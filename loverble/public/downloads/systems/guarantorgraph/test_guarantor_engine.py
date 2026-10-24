import time, random
import pytest
from guarantor_engine import GuarantorRiskEngine, Policy, CommitRefused


def base():
    e = GuarantorRiskEngine()
    e.register_member("John", 500000, 100000, 0.04)
    e.register_member("Alice", 400000, 50000, 0.03)
    e.register_member("Bob", 300000, 0, 0.05)
    return e


def approve(e, rid, b, lid, amt, gs, **kw):
    r = e.assess(rid, b, lid, amt, gs)
    assert r["decision"] == "APPROVED", r["findings"]
    e.commit(rid, **kw)


def test_blueprint_circular_scenario_is_blocked():
    e = base()
    approve(e, "r1", "John", "L1", 200000, [{"guarantor_id": "Alice", "amount": 200000}])
    approve(e, "r2", "Alice", "L2", 150000, [{"guarantor_id": "Bob", "amount": 150000}])
    r = e.assess("r3", "Bob", "L3", 180000, [{"guarantor_id": "John", "amount": 180000}])
    assert r["decision"] == "REJECTED" and r["hard_block"]
    cyc = [f for f in r["findings"] if f["code"] == "CIRCULAR_GUARANTEE"][0]
    assert cyc["cycle"] == ["John", "Bob", "Alice", "John"] and cyc["cycle_length"] == 3


def test_assess_is_pure_until_commit():
    e = base()
    e.assess("r1", "John", "L1", 200000, [{"guarantor_id": "Alice", "amount": 200000}])
    assert not e.by_guarantor["Alice"]            # nothing written by a dry run
    e.commit("r1")
    assert len(e.by_guarantor["Alice"]) == 1


def test_unknown_borrower_no_crash():
    e = base()
    r = e.assess("r", "Ghost", "L", 1000, [{"guarantor_id": "Alice", "amount": 1000}])
    assert r["decision"] == "REJECTED" and r["findings"][0]["code"] == "UNKNOWN_BORROWER"


def test_duplicate_guarantors_do_not_inflate_coverage():
    e = base()
    e.register_member("New", 0, 0)
    r = e.assess("r", "New", "L", 200000, [{"guarantor_id": "Alice", "amount": 100000},
                                            {"guarantor_id": "Alice", "amount": 100000}])
    assert r["decision"] == "APPROVED"              # merged to 200k, genuinely covered
    r2 = e.assess("r2", "New", "L2", 300000, [{"guarantor_id": "Alice", "amount": 150000},
                                               {"guarantor_id": "Alice", "amount": 150000}])
    assert any(f["code"] == "DUPLICATE_GUARANTOR_MERGED" for f in r2["findings"])


def test_same_guarantor_same_borrower_second_loan_accumulates():
    e = base()
    e.register_member("New", 0, 0)
    approve(e, "r1", "New", "L1", 100000, [{"guarantor_id": "Alice", "amount": 100000}])
    approve(e, "r2", "New", "L2", 100000, [{"guarantor_id": "Alice", "amount": 100000}])
    assert e._guarantor_metrics("Alice")["gross_exposure"] == 200000   # v1 would have said 100000 or less


def test_pd_weighted_gei_loophole_is_closed():
    e = base()
    e.register_member("New", 0, 0, 0.05)
    r = e.assess("r", "New", "L", 6_000_000, [{"guarantor_id": "Alice", "amount": 6_000_000}])
    assert r["decision"] == "REJECTED"
    assert any(f["code"] == "GUARANTOR_CAPACITY_EXCEEDED" for f in r["findings"])  # v1 approved this at GEI 0.75


def test_self_guarantee_and_bad_amounts():
    e = base()
    assert e.assess("a", "John", "L", 10, [{"guarantor_id": "John", "amount": 10}])["decision"] == "REJECTED"
    assert e.assess("b", "John", "L", 10, [{"guarantor_id": "Alice", "amount": -5}])["decision"] == "REJECTED"
    assert e.assess("c", "John", "L", 0, [{"guarantor_id": "Alice", "amount": 5}])["decision"] == "REJECTED"


def test_reciprocal_pair_is_referred_and_needs_maker_checker():
    e = GuarantorRiskEngine()
    for m in ("A", "B"):
        e.register_member(m, 1_000_000, 0, 0.02)
    e.register_member("A", 100000, 0)
    e.register_member("B", 100000, 0)
    approve(e, "r1", "A", "L1", 150000, [{"guarantor_id": "B", "amount": 100000}])
    r = e.assess("r2", "B", "L2", 150000, [{"guarantor_id": "A", "amount": 100000}])
    assert r["decision"] == "REFERRED"
    with pytest.raises(CommitRefused):
        e.commit("r2")
    with pytest.raises(CommitRefused):
        e.commit("r2", override={"maker": "x", "checker": "x", "reason": "ok"})
    e.commit("r2", override={"maker": "mgr", "checker": "board", "reason": "documented exception #12"})
    assert any(a["event"] == "OVERRIDE" for a in e.audit)


def test_rejected_can_never_be_committed():
    e = base()
    e.register_member("New", 0, 0, 0.05)
    e.assess("r", "New", "L", 6_000_000, [{"guarantor_id": "Alice", "amount": 6_000_000}])
    with pytest.raises(CommitRefused):
        e.commit("r", override={"maker": "a", "checker": "b", "reason": "pls"})


def test_race_two_requests_each_fine_alone_second_commit_is_blocked():
    e2 = GuarantorRiskEngine(Policy(max_cascade_members=99, reciprocal_is_hard=True))
    for m in ("X", "Y"):
        e2.register_member(m, 1_000_000, 0, 0.02)
    a = e2.assess("a", "Y", "La", 500000, [{"guarantor_id": "X", "amount": 500000}])
    b = e2.assess("b", "X", "Lb", 500000, [{"guarantor_id": "Y", "amount": 500000}])
    assert a["decision"] == "APPROVED" and b["decision"] == "APPROVED"   # each fine in isolation
    e2.commit("a")
    with pytest.raises(CommitRefused):
        e2.commit("b")


def test_repayment_releases_capacity():
    e = base()
    e.register_member("New", 0, 0)
    approve(e, "r", "New", "L", 200000, [{"guarantor_id": "Alice", "amount": 200000}])
    e.record_repayment("L", 100000)
    assert e._guarantor_metrics("Alice")["gross_exposure"] == 100000
    e.record_repayment("L", 0)
    assert e._guarantor_metrics("Alice")["gross_exposure"] == 0


def test_contagion_cascade_detected():
    e = GuarantorRiskEngine(Policy(max_cascade_members=99))
    e.register_member("B0", 0, 0)
    for m in ("G1", "G2", "G3"):
        e.register_member(m, 100000, 0, 0.02)
    # chain: G1 guarantees B0, G2 guarantees G1, G3 guarantees G2, each at 100% of the guarantor's deposits
    approve(e, "1", "B0", "L1", 100000, [{"guarantor_id": "G1", "amount": 100000}])
    approve(e, "2", "G1", "L2", 100000, [{"guarantor_id": "G2", "amount": 100000}])
    approve(e, "3", "G2", "L3", 100000, [{"guarantor_id": "G3", "amount": 100000}])
    c = e.cascade(["B0"])
    assert c["defaulted"] == ["B0", "G1", "G2", "G3"] and c["knock_on"] == 3


def test_cascade_policy_refers():
    e = GuarantorRiskEngine(Policy(max_cascade_members=2))
    e.register_member("B0", 0, 0)
    for m in ("G1", "G2", "G3"):
        e.register_member(m, 100000, 0, 0.02)
    approve(e, "1", "B0", "L1", 100000, [{"guarantor_id": "G1", "amount": 100000}])
    approve(e, "2", "G1", "L2", 100000, [{"guarantor_id": "G2", "amount": 100000}])
    r = e.assess("3", "G2", "L3", 100000, [{"guarantor_id": "G3", "amount": 100000}])
    assert r["decision"] == "REFERRED" and any(f["code"] == "CASCADE_RISK" for f in r["findings"])


def test_audit_rings_finds_existing_loop():
    e = GuarantorRiskEngine(Policy(hard_cycle_len=1, max_cascade_members=99, reciprocal_is_hard=False))
    for m in "ABC":
        e.register_member(m, 1_000_000, 0, 0.02)
    # legacy data already containing a ring (loaded without the checks, as in a real onboarding)
    from guarantor_engine import Rec
    e._add([Rec("1", "A", "B", 1e5, 1e5, 1e5), Rec("2", "B", "C", 1e5, 1e5, 1e5), Rec("3", "C", "A", 1e5, 1e5, 1e5)])
    out = e.audit_rings()
    assert out["ring_count"] == 1 and out["rings"][0]["members"] == ["A", "B", "C"]


def test_idempotent_assess():
    e = base()
    a = e.assess("r", "John", "L", 200000, [{"guarantor_id": "Alice", "amount": 200000}])
    assert e.assess("r", "John", "L", 999, []) is a


def test_performance_5000_members_20000_guarantees():
    random.seed(1)
    e = GuarantorRiskEngine(Policy(max_cascade_members=10**6))
    n = 5000
    for i in range(n):
        e.register_member(f"M{i}", 1_000_000, 0, 0.03)
    from guarantor_engine import Rec
    for k in range(20000):
        g, b = random.sample(range(n), 2)
        e._add([Rec(f"S{k}", f"M{g}", f"M{b}", 1000, 1000, 1000)])
    t = time.time()
    for k in range(50):
        e.assess(f"p{k}", f"M{k}", f"PL{k}", 50000, [{"guarantor_id": f"M{k+100}", "amount": 50000}])
    per = (time.time() - t) / 50
    print(f"avg assess latency on 5k members / 20k guarantees: {per*1000:.1f} ms")
    assert per < 0.5

"""
GuarantorGraph v2 - guarantor risk engine for SACCOs / small lenders.

Fixes vs. the v1 blueprint (all verified by test_guarantor_engine.py):
  * assess() is a pure dry-run; commit() is separate, re-validates, and is idempotent
  * guarantees are per-loan records (v1 overwrote the edge when the same guarantor backed
    the same borrower twice -> exposure silently understated)
  * duplicate guarantors in one request are merged (v1 double-counted coverage)
  * unknown borrower / self-guarantee / non-positive amounts are validated (v1 raised KeyError)
  * cycle test = bounded shortest-path search from the borrower back to the guarantor
    (v1 enumerated EVERY cycle in the graph: exponential, and ignored its own k<=5 rule)
  * capacity is judged on GROSS outstanding guarantees vs free deposits; the PD-weighted
    number (v1's GEI) is kept only as a secondary expected-loss signal
  * exposures amortise as the loan is repaid
  * contagion stress test: "if X defaults, who else falls?"
  * fails closed, returns ALL findings (not first-fail), writes an audit trail
  * 3 outcomes: APPROVED / REFERRED (committee override, maker-checker) / REJECTED (never overridable here)

Money is float for readability; use Decimal/NUMERIC at the persistence boundary.
"""
from __future__ import annotations

import hashlib
import json
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Optional

import networkx as nx

INF = float("inf")


@dataclass(frozen=True)
class Policy:
    """Every number here is a SACCO policy choice, not a constant of nature. Calibrate per tenant."""
    version: str = "draft-1"
    max_gross_exposure_ratio: float = 1.0   # sum(outstanding guarantees) / free deposits
    insider_gross_ratio: float = 0.5        # stricter for board/staff/insiders
    max_expected_loss_ratio: float = 0.25   # sum(exposure*PD) / free deposits  (v1's "GEI")
    max_active_guarantees: int = 5
    hard_cycle_len: int = 5                 # cycles of 3..N members are REJECTED
    watch_cycle_len: int = 8                # longer cycles up to this are REFERRED
    reciprocal_is_hard: bool = False        # A<->B mutual guarantees: REFER by default
    max_cascade_members: int = 1            # one default may topple at most this many others
    cascade_default_loss_ratio: float = 1.0 # guarantor defaults once losses >= this share of free deposits
    borrower_self_cover: bool = True        # borrower's free deposits count toward the loan


@dataclass
class Member:
    deposits: float
    encumbered: float
    pd: float
    is_insider: bool = False

    @property
    def free(self) -> float:
        return max(0.0, self.deposits - self.encumbered)


@dataclass
class Rec:
    loan_id: str
    g: str            # guarantor
    b: str            # borrower
    guaranteed: float
    principal: float
    outstanding: float

    @property
    def exposure(self) -> float:
        if self.principal <= 0:
            return 0.0
        return self.guaranteed * min(1.0, max(0.0, self.outstanding / self.principal))


class CommitRefused(Exception):
    pass


def pd_from_repayment(on_time_ratio: float, max_days_past_due: int, months_history: int) -> float:
    """PLACEHOLDER banded scorecard. Replace with a model fitted on the institution's own
    36-month repayment data (logistic regression / gradient boosting) before any real use."""
    if months_history < 6:
        return 0.10                      # thin file: be conservative
    if on_time_ratio >= 0.98 and max_days_past_due <= 7:
        return 0.02
    if on_time_ratio >= 0.90 and max_days_past_due <= 30:
        return 0.06
    if on_time_ratio >= 0.75 and max_days_past_due <= 60:
        return 0.15
    return 0.35


class GuarantorRiskEngine:
    def __init__(self, policy: Policy = Policy()):
        self.policy = policy
        self.members: dict[str, Member] = {}
        self.by_guarantor: dict[str, list[Rec]] = defaultdict(list)
        self.by_borrower: dict[str, list[Rec]] = defaultdict(list)
        self.loan_recs: dict[str, list[Rec]] = {}
        self.pending: dict[str, dict] = {}
        self.decisions: dict[str, dict] = {}
        self.audit: list[dict] = []
        self._lock = threading.RLock()   # production: Postgres advisory lock per tenant

    # ------------------------------------------------------------------ members
    def register_member(self, member_id: str, deposits: float, encumbered: float = 0.0,
                        pd: float = 0.05, is_insider: bool = False) -> None:
        if deposits < 0 or encumbered < 0 or encumbered > deposits:
            raise ValueError("require 0 <= encumbered <= deposits")
        if not 0.0 <= pd <= 1.0:
            raise ValueError("pd must be in [0,1]")
        with self._lock:
            self.members[member_id] = Member(float(deposits), float(encumbered), float(pd), is_insider)

    # ------------------------------------------------------------------ graph helpers
    def _live(self, recs: list[Rec]) -> list[Rec]:
        return [r for r in recs if r.exposure > 1e-9]

    def _shortest_path(self, src: str, dst: str, max_edges: int) -> Optional[list[str]]:
        """BFS along 'guarantees' edges (n -> m means n guarantees m). Bounded depth."""
        if src == dst:
            return [src]
        seen = {src}
        q = deque([(src, [src])])
        while q:
            node, path = q.popleft()
            if len(path) - 1 >= max_edges:
                continue
            for r in self._live(self.by_guarantor.get(node, [])):
                if r.b in seen:
                    continue
                if r.b == dst:
                    return path + [r.b]
                seen.add(r.b)
                q.append((r.b, path + [r.b]))
        return None

    def _add(self, recs: list[Rec]) -> None:
        for r in recs:
            self.by_guarantor[r.g].append(r)
            self.by_borrower[r.b].append(r)

    def _remove(self, recs: list[Rec]) -> None:
        for r in recs:
            self.by_guarantor[r.g].remove(r)
            self.by_borrower[r.b].remove(r)

    def _guarantor_metrics(self, gid: str) -> dict:
        recs = self._live(self.by_guarantor.get(gid, []))
        m = self.members[gid]
        gross = sum(r.exposure for r in recs)
        el = sum(r.exposure * self.members[r.b].pd for r in recs if r.b in self.members)
        free = m.free
        return {
            "gross_exposure": round(gross, 2),
            "free_deposits": round(free, 2),
            "gross_ratio": round(gross / free, 4) if free > 0 else (0.0 if gross == 0 else 999.0),
            "expected_loss_ratio": round(el / free, 4) if free > 0 else (0.0 if el == 0 else 999.0),
            "active_guarantees": len(recs),
        }

    def _downstream(self, node: str, max_depth: int = 6, cap: int = 200) -> list[str]:
        """Members whose default would propagate UP to `node`: those `node` (transitively) guarantees."""
        seen, q = {node}, deque([(node, 0)])
        while q and len(seen) < cap:
            n, d = q.popleft()
            if d >= max_depth:
                continue
            for r in self._live(self.by_guarantor.get(n, [])):
                if r.b not in seen:
                    seen.add(r.b)
                    q.append((r.b, d + 1))
        return sorted(seen)

    # ------------------------------------------------------------------ contagion
    def cascade(self, start: list[str]) -> dict:
        """If `start` members default, guarantors absorb losses from free deposits; a guarantor
        whose loss exceeds free deposits defaults too, and the shock moves on."""
        defaulted = set(start)
        frontier = list(start)
        loss: dict[str, float] = defaultdict(float)
        rounds = 0
        while frontier:
            rounds += 1
            nxt = []
            for b in frontier:
                for r in self._live(self.by_borrower.get(b, [])):
                    if r.g not in self.members:
                        continue
                    loss[r.g] += r.exposure
                    if loss[r.g] >= self.policy.cascade_default_loss_ratio * self.members[r.g].free - 1e-9 and r.g not in defaulted:
                        defaulted.add(r.g)
                        nxt.append(r.g)
            frontier = nxt
        shortfall = sum(max(0.0, l - self.members[g].free) for g, l in loss.items())
        return {"defaulted": sorted(defaulted), "knock_on": len(defaulted) - len(start),
                "rounds": rounds, "guarantor_losses": {g: round(v, 2) for g, v in loss.items()},
                "institution_shortfall": round(shortfall, 2)}

    # ------------------------------------------------------------------ evaluation (pure)
    def _evaluate(self, borrower_id: str, loan_id: str, loan_amount: float,
                  guarantors: list[dict]) -> dict:
        P = self.policy
        findings: list[dict] = []

        def add(code, sev, msg, **kw):
            findings.append({"code": code, "severity": sev, "message": msg, **kw})

        def finish(recs=None, metrics=None):
            sev = {f["severity"] for f in findings}
            decision = "REJECTED" if "REJECT" in sev else "REFERRED" if "REFER" in sev else "APPROVED"
            return {"decision": decision, "hard_block": decision == "REJECTED",
                    "findings": findings, "metrics": metrics or {}, "recs": recs or []}

        try:
            if not loan_amount or loan_amount <= 0:
                add("INVALID_AMOUNT", "REJECT", "Loan amount must be positive.")
            if borrower_id not in self.members:
                add("UNKNOWN_BORROWER", "REJECT", f"Borrower {borrower_id} is not registered.")
            if loan_id in self.loan_recs:
                add("DUPLICATE_LOAN", "REJECT", f"Loan {loan_id} already has guarantees on file.")

            merged: dict[str, float] = defaultdict(float)
            for g in guarantors:
                gid, amt = g.get("guarantor_id"), g.get("amount", 0)
                if amt is None or amt <= 0:
                    add("INVALID_AMOUNT", "REJECT", f"Guarantee amount for {gid} must be positive.", subject=gid)
                    continue
                if gid == borrower_id:
                    add("SELF_GUARANTEE", "REJECT", "A member cannot guarantee their own loan.", subject=gid)
                    continue
                if gid not in self.members:
                    add("UNKNOWN_GUARANTOR", "REJECT", f"Guarantor {gid} is not registered.", subject=gid)
                    continue
                if gid in merged:
                    add("DUPLICATE_GUARANTOR_MERGED", "INFO", f"{gid} listed twice; amounts merged.", subject=gid)
                merged[gid] += float(amt)
            if not merged and not any(f["severity"] == "REJECT" for f in findings):
                add("NO_GUARANTORS", "REJECT", "No valid guarantors supplied.")
            if any(f["severity"] == "REJECT" for f in findings):
                return finish()

            self_cover = self.members[borrower_id].free if P.borrower_self_cover else 0.0
            required = max(0.0, loan_amount - self_cover)
            total = sum(merged.values())
            if total + 1e-9 < required:
                add("COVERAGE_SHORTFALL", "REJECT",
                    f"Guarantees {total:,.2f} < required {required:,.2f} "
                    f"(loan {loan_amount:,.2f} less borrower free deposits {self_cover:,.2f}).")

            # circular-guarantee test BEFORE adding the new edges
            cycles = []
            for gid in merged:
                path = self._shortest_path(borrower_id, gid, P.watch_cycle_len - 1)
                if path:
                    k = len(path)
                    cyc = [gid] + path           # g -> b -> ... -> g
                    if k == 2:
                        sev = "REJECT" if P.reciprocal_is_hard else "REFER"
                    elif k <= P.hard_cycle_len:
                        sev = "REJECT"
                    else:
                        sev = "REFER"
                    cycles.append(cyc)
                    add("CIRCULAR_GUARANTEE", sev, "Guarantee loop: " + " -> ".join(cyc),
                        subject=gid, cycle=cyc, cycle_length=k)

            recs = [Rec(loan_id, gid, borrower_id, amt, float(loan_amount), float(loan_amount))
                    for gid, amt in merged.items()]
            self._add(recs)
            try:
                gm = {}
                for gid in merged:
                    m = self._guarantor_metrics(gid)
                    gm[gid] = m
                    limit = P.insider_gross_ratio if self.members[gid].is_insider else P.max_gross_exposure_ratio
                    if m["gross_ratio"] > limit:
                        add("GUARANTOR_CAPACITY_EXCEEDED", "REJECT",
                            f"{gid} would have {m['gross_exposure']:,.2f} guaranteed against "
                            f"{m['free_deposits']:,.2f} free deposits (ratio {m['gross_ratio']:.2f} > {limit:.2f}).",
                            subject=gid)
                    if m["active_guarantees"] > P.max_active_guarantees:
                        add("MAX_GUARANTEES_EXCEEDED", "REJECT",
                            f"{gid} would carry {m['active_guarantees']} active guarantees "
                            f"(max {P.max_active_guarantees}).", subject=gid)
                    if m["expected_loss_ratio"] > P.max_expected_loss_ratio:
                        add("EXPECTED_LOSS_HIGH", "REFER",
                            f"{gid} PD-weighted exposure is {m['expected_loss_ratio']:.2f} of free deposits.",
                            subject=gid)
                worst = {"knock_on": 0}
                starts = set(self._downstream(borrower_id)) | set(merged)
                for start in sorted(starts):
                    c = self.cascade([start])
                    if c["knock_on"] > worst["knock_on"]:
                        worst = {**c, "start": start}
                if worst["knock_on"] > P.max_cascade_members:
                    add("CASCADE_RISK", "REFER",
                        f"Default of {worst['start']} would topple {worst['knock_on']} more member(s): "
                        f"{[d for d in worst['defaulted'] if d != worst['start']]}.")
            finally:
                self._remove(recs)

            return finish(recs, {"guarantors": gm, "required_guarantee": round(required, 2),
                                 "cascade_worst_case": worst, "cycles": cycles})
        except Exception as exc:   # FAIL CLOSED: a broken risk control must never approve
            add("ENGINE_ERROR", "REJECT", f"Internal error, failing closed: {type(exc).__name__}: {exc}")
            return finish()

    # ------------------------------------------------------------------ public API
    def assess(self, request_id: str, borrower_id: str, loan_id: str, loan_amount: float,
               guarantors: list[dict]) -> dict:
        """Dry run. Never mutates the graph. Idempotent on request_id."""
        with self._lock:
            if request_id in self.decisions:
                return self.decisions[request_id]
            req = dict(borrower_id=borrower_id, loan_id=loan_id, loan_amount=loan_amount,
                       guarantors=guarantors)
            ev = self._evaluate(**req)
            out = {"request_id": request_id, "decision": ev["decision"], "hard_block": ev["hard_block"],
                   "findings": ev["findings"], "metrics": ev["metrics"],
                   "policy_version": self.policy.version,
                   "input_hash": hashlib.sha256(json.dumps(req, sort_keys=True).encode()).hexdigest(),
                   "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "committed": False}
            self.pending[request_id] = req
            self.decisions[request_id] = out
            self.audit.append({"event": "ASSESS", **{k: out[k] for k in
                               ("request_id", "decision", "policy_version", "input_hash", "timestamp")},
                               "finding_codes": [f["code"] for f in out["findings"]]})
            return out

    def commit(self, request_id: str, override: Optional[dict] = None) -> dict:
        """Called by the CBS only when the loan is actually disbursed. Re-validates against the
        CURRENT graph (state may have moved since assess). REFERRED needs a maker-checker override;
        REJECTED can never be committed here."""
        with self._lock:
            if request_id not in self.decisions:
                raise CommitRefused("unknown request_id")
            d = self.decisions[request_id]
            if d["committed"]:
                return d
            ev = self._evaluate(**self.pending[request_id])
            if ev["decision"] == "REJECTED":
                raise CommitRefused("blocked on re-validation: " + "; ".join(
                    f["code"] for f in ev["findings"] if f["severity"] == "REJECT"))
            if ev["decision"] == "REFERRED":
                o = override or {}
                if not (o.get("maker") and o.get("checker") and o.get("reason")) or o["maker"] == o["checker"]:
                    raise CommitRefused("REFERRED needs override with maker, checker (different people) and reason")
                self.audit.append({"event": "OVERRIDE", "request_id": request_id, **o,
                                   "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
            self._add(ev["recs"])
            self.loan_recs[ev["recs"][0].loan_id] = ev["recs"]
            d["committed"] = True
            self.audit.append({"event": "COMMIT", "request_id": request_id,
                               "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})
            return d

    def record_repayment(self, loan_id: str, outstanding: float) -> None:
        """Guarantor exposure shrinks as the loan amortises; zero releases the guarantee."""
        with self._lock:
            for r in self.loan_recs.get(loan_id, []):
                r.outstanding = max(0.0, float(outstanding))
            if outstanding <= 0:
                self._remove(self.loan_recs.pop(loan_id, []))
            self.audit.append({"event": "REPAYMENT", "loan_id": loan_id, "outstanding": outstanding})

    # ------------------------------------------------------------------ portfolio audit
    def audit_rings(self) -> dict:
        """Portfolio-wide scan for existing guarantee rings using strongly connected components
        (Tarjan-family, linear time) - the thing to run on day 1 of onboarding a SACCO."""
        G = nx.DiGraph()
        for recs in self.by_guarantor.values():
            for r in self._live(recs):
                w = G.get_edge_data(r.g, r.b, {}).get("w", 0.0)
                G.add_edge(r.g, r.b, w=w + r.exposure)
        rings = []
        for comp in nx.strongly_connected_components(G):
            if len(comp) > 1:
                sub = G.subgraph(comp)
                rings.append({"members": sorted(comp),
                              "internal_exposure": round(sum(d["w"] for *_, d in sub.edges(data=True)), 2)})
        rings.sort(key=lambda x: -x["internal_exposure"])
        return {"ring_count": len(rings), "rings": rings}

    def leaderboard(self, top: int = 10) -> list[dict]:
        rows = [{"member": g, "is_insider": m.is_insider, **self._guarantor_metrics(g)}
                for g, m in self.members.items() if self.by_guarantor.get(g)]
        return sorted(rows, key=lambda r: -r["gross_ratio"])[:top]

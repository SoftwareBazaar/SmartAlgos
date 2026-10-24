"""
ReconGuard Switch Engine v2 (reference implementation)

Fixes vs v1:
 - Two phases: initiate() reserves funds BEFORE dispatch; callback closes the loop.
 - Engine looks up the authorised amount itself (never trusts caller-supplied ledger amount).
 - HMAC covers the RAW request body (amount, ids, status), not a re-serialised sub-field.
 - Checks switch status (v1 would "commit" a FAILED payout if amounts matched).
 - Variance is checked per transaction (v1 sum could net +30k and -30k to zero).
 - Legit switch retries are idempotent; only a conflicting duplicate raises a fraud flag.
 - Security failures are logged/alerted, they do NOT lock the customer account (DoS risk).
 - Decimal money, 5-minute clock skew window, atomic nonce claim, hash-chained audit log.
 - Timeout sweep moves silent transactions to STATUS_QUERY_REQUIRED (ask the switch, don't guess).

Production notes: replace in-memory dicts with PostgreSQL (durable) + Redis SET NX EX (nonces).
Locks/holds must be persisted in the database; Redis is a cache, not the source of truth.
"""
import hashlib
import hmac
import json
import threading
import time
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum

CENT = Decimal("0.01")


def money(x) -> Decimal:
    return Decimal(str(x)).quantize(CENT, ROUND_HALF_UP)


class TxState(str, Enum):
    HELD = "HELD"                                  # funds reserved, awaiting switch callback
    SETTLED = "SETTLED"                            # switch SUCCESS and amount matches
    FAILED_RELEASED = "FAILED_RELEASED"            # switch FAILED, hold released to customer
    SUSPENDED_VARIANCE = "SUSPENDED_VARIANCE"      # amount mismatch, manual resolution
    STATUS_QUERY_REQUIRED = "STATUS_QUERY_REQUIRED"  # no callback in time, query the switch


class Txn:
    def __init__(self, idem_key, account_id, channel, amount, now_ms):
        self.idem_key = idem_key
        self.account_id = account_id
        self.channel = channel
        self.amount = amount
        self.created_ms = now_ms
        self.state = TxState.HELD
        self.switch_receipt = None


class ReconGuardEngine:
    def __init__(self, secret: str, max_skew_ms=300_000, nonce_ttl_s=86_400,
                 callback_timeout_ms=15_000):
        self._secret = secret.encode()
        self.max_skew_ms = max_skew_ms
        self.nonce_ttl_s = nonce_ttl_s
        self.callback_timeout_ms = callback_timeout_ms
        self._lock = threading.Lock()
        self.balances = {}          # account_id -> available Decimal
        self.txns = {}              # idem_key -> Txn
        self.review_flags = {}      # account_id -> reason (human review, not a hard lock)
        self._nonces = {}           # nonce -> expiry epoch seconds
        self.audit = []             # hash-chained, append-only
        self._prev_hash = "0" * 64

    # ---------- helpers ----------
    def sign(self, raw_body: bytes, timestamp_ms: int, nonce: str) -> str:
        msg = f"{timestamp_ms}.{nonce}.".encode() + raw_body
        return hmac.new(self._secret, msg, hashlib.sha256).hexdigest()

    def _log(self, event: str, **data):
        entry = {"ts": int(time.time() * 1000), "event": event, **data}
        body = json.dumps(entry, sort_keys=True, default=str)
        h = hashlib.sha256((self._prev_hash + body).encode()).hexdigest()
        self.audit.append({"entry": body, "hash": h, "prev": self._prev_hash})
        self._prev_hash = h

    def verify_audit_chain(self) -> bool:
        prev = "0" * 64
        for e in self.audit:
            if e["prev"] != prev or hashlib.sha256((prev + e["entry"]).encode()).hexdigest() != e["hash"]:
                return False
            prev = e["hash"]
        return True

    # ---------- phase 1: before dispatch ----------
    def initiate(self, idem_key: str, account_id: str, channel: str, amount) -> dict:
        t0 = time.perf_counter()
        amt = money(amount)
        with self._lock:
            if idem_key in self.txns:  # client retry: return original, never double-reserve
                tx = self.txns[idem_key]
                return {"status": "DUPLICATE_REQUEST_IGNORED", "state": tx.state.value,
                        "dispatch": False}
            if account_id in self.review_flags:
                self._log("INITIATE_BLOCKED_REVIEW", account=account_id, key=idem_key)
                return {"status": "BLOCKED_PENDING_REVIEW", "dispatch": False,
                        "reason": self.review_flags[account_id]}
            if amt <= 0 or self.balances.get(account_id, Decimal(0)) < amt:
                self._log("INITIATE_REJECTED", account=account_id, key=idem_key, amount=amt)
                return {"status": "REJECTED_INSUFFICIENT_OR_INVALID", "dispatch": False}
            self.balances[account_id] -= amt
            self.txns[idem_key] = Txn(idem_key, account_id, channel, amt, int(time.time() * 1000))
            self._log("HOLD_PLACED", account=account_id, key=idem_key, amount=amt, channel=channel)
        return {"status": "HOLD_PLACED", "dispatch": True,
                "latency_ms": round((time.perf_counter() - t0) * 1000, 3)}

    # ---------- security ----------
    def _verify(self, raw_body: bytes, ts_ms: int, nonce: str, signature: str):
        now_ms = int(time.time() * 1000)
        if abs(now_ms - ts_ms) > self.max_skew_ms:
            return False, "EXPIRED_TIMESTAMP"
        if not hmac.compare_digest(self.sign(raw_body, ts_ms, nonce), signature):
            return False, "INVALID_SIGNATURE"
        with self._lock:  # atomic claim (prod: Redis SET nonce 1 NX EX ttl)
            now_s = time.time()
            self._nonces = {n: e for n, e in self._nonces.items() if e > now_s}
            if nonce in self._nonces:
                return False, "REPLAYED_NONCE"
            self._nonces[nonce] = now_s + self.nonce_ttl_s
        return True, "OK"

    # ---------- phase 2: switch callback ----------
    def handle_callback(self, raw_body: bytes, ts_ms: int, nonce: str, signature: str) -> dict:
        t0 = time.perf_counter()
        ok, why = self._verify(raw_body, ts_ms, nonce, signature)
        if not ok:
            # Alert only. No account lock: forged traffic must not be able to freeze customers.
            self._log("SECURITY_REJECT", reason=why, nonce=nonce)
            return {"status": "REJECTED_SECURITY", "reason": why}

        msg = json.loads(raw_body)
        key = msg["originator_id"]
        sw_status = msg["switch_status"]            # SUCCESS | FAILED
        sw_amount = money(msg["amount"])
        receipt = msg.get("switch_receipt")

        with self._lock:
            tx = self.txns.get(key)
            if tx is None:
                self._log("ORPHAN_CALLBACK", key=key, receipt=receipt, amount=sw_amount)
                return {"status": "ORPHAN_CALLBACK", "action": "ALERT_AND_INVESTIGATE"}

            if tx.state in (TxState.SETTLED, TxState.FAILED_RELEASED, TxState.SUSPENDED_VARIANCE):
                same = (receipt == tx.switch_receipt) or tx.switch_receipt is None
                if same and sw_amount == tx.amount:
                    return {"status": "IDEMPOTENT_REPLAY", "state": tx.state.value}
                # Different receipt or amount for an already-closed transaction = possible double payout
                self.review_flags[tx.account_id] = "DUPLICATE_PAYOUT_SUSPECTED"
                self._log("DUPLICATE_PAYOUT_SUSPECTED", key=key, first=tx.switch_receipt,
                          second=receipt, amount=sw_amount)
                return {"status": "DUPLICATE_PAYOUT_SUSPECTED", "action": "ACCOUNT_REVIEW_FLAG"}

            delta = sw_amount - tx.amount           # per-transaction, signed
            tx.switch_receipt = receipt
            if sw_status == "FAILED":
                self.balances[tx.account_id] += tx.amount
                tx.state = TxState.FAILED_RELEASED
                self._log("FAILED_RELEASED", key=key, amount=tx.amount)
                result = {"status": "FAILED_RELEASED", "action": "HOLD_RELEASED"}
            elif delta == 0:
                tx.state = TxState.SETTLED
                self._log("SETTLED", key=key, receipt=receipt, amount=tx.amount)
                result = {"status": "SETTLED", "action": "CONFIRM_LEDGER"}
            else:
                tx.state = TxState.SUSPENDED_VARIANCE
                if delta > 0:  # switch paid more than authorised: real loss exposure
                    self.review_flags[tx.account_id] = "OVERPAYMENT_BY_SWITCH"
                self._log("SUSPENDED_VARIANCE", key=key, delta=delta, authorised=tx.amount,
                          switch=sw_amount)
                result = {"status": "SUSPENDED_VARIANCE", "delta": str(delta),
                          "action": "MANUAL_RESOLUTION"}
        result["latency_ms"] = round((time.perf_counter() - t0) * 1000, 3)
        return result

    # ---------- silence is a signal ----------
    def sweep_timeouts(self, now_ms: int = None) -> list:
        now_ms = now_ms or int(time.time() * 1000)
        flagged = []
        with self._lock:
            for tx in self.txns.values():
                if tx.state == TxState.HELD and now_ms - tx.created_ms > self.callback_timeout_ms:
                    tx.state = TxState.STATUS_QUERY_REQUIRED
                    self._log("STATUS_QUERY_REQUIRED", key=tx.idem_key)
                    flagged.append(tx.idem_key)  # caller queries switch (e.g. Daraja Transaction Status)
        return flagged


# ---------- sales tool: show the prospect their own numbers ----------
def estimate_savings(monthly_txn_count: int, avg_txn_kes: float, leakage_rate_pct: float,
                     catch_rate_pct: float, monthly_fee_kes: float) -> dict:
    """
    All rates come from the PROSPECT (or from a shadow-mode run on their data), not from
    this document. leakage_rate_pct = share of throughput lost to duplicates/phantom
    callbacks/float errors; catch_rate_pct = share of that leakage ReconGuard prevents.
    """
    throughput = Decimal(str(monthly_txn_count)) * Decimal(str(avg_txn_kes))
    leakage = throughput * Decimal(str(leakage_rate_pct)) / 100
    prevented = leakage * Decimal(str(catch_rate_pct)) / 100
    fee = Decimal(str(monthly_fee_kes))
    net = prevented - fee
    return {
        "monthly_throughput_kes": float(throughput),
        "monthly_leakage_kes": float(leakage),
        "monthly_prevented_kes": float(prevented),
        "monthly_net_saving_kes": float(net),
        "annual_net_saving_kes": float(net * 12),
        "roi_multiple": float(prevented / fee) if fee else None,
    }


# ---------- tests ----------
if __name__ == "__main__":
    def body(**kw):
        return json.dumps(kw, sort_keys=True).encode()

    def send(e, raw, nonce, ts=None, sig=None):
        ts = ts or int(time.time() * 1000)
        return e.handle_callback(raw, ts, nonce, sig or e.sign(raw, ts, nonce))

    e = ReconGuardEngine("test-secret")
    e.balances = {"A1": Decimal("100000"), "A2": Decimal("100000")}

    # 1 normal settle
    assert e.initiate("K1", "A1", "MPESA_B2C", 25000)["dispatch"]
    r = send(e, body(originator_id="K1", switch_status="SUCCESS", amount=25000, switch_receipt="R1"), "n1")
    assert r["status"] == "SETTLED", r

    # 2 client retry of initiate does not double-reserve
    assert e.initiate("K1", "A1", "MPESA_B2C", 25000)["status"] == "DUPLICATE_REQUEST_IGNORED"
    assert e.balances["A1"] == Decimal("75000")

    # 3 legitimate switch retry (new nonce, same receipt) is idempotent, no fraud flag
    r = send(e, body(originator_id="K1", switch_status="SUCCESS", amount=25000, switch_receipt="R1"), "n2")
    assert r["status"] == "IDEMPOTENT_REPLAY" and "A1" not in e.review_flags

    # 4 second payout with different receipt = duplicate payout flag
    r = send(e, body(originator_id="K1", switch_status="SUCCESS", amount=25000, switch_receipt="R9"), "n3")
    assert r["status"] == "DUPLICATE_PAYOUT_SUSPECTED" and "A1" in e.review_flags

    # 5 replayed nonce rejected, no lock
    raw = body(originator_id="X", switch_status="SUCCESS", amount=1, switch_receipt="Z")
    ts = int(time.time() * 1000); sig = e.sign(raw, ts, "n4")
    e.handle_callback(raw, ts, "n4", sig)
    assert e.handle_callback(raw, ts, "n4", sig)["reason"] == "REPLAYED_NONCE"

    # 6 tampered amount breaks the signature
    raw = body(originator_id="K2", switch_status="SUCCESS", amount=1000, switch_receipt="R2")
    ts = int(time.time() * 1000); sig = e.sign(raw, ts, "n5")
    tampered = raw.replace(b"1000", b"9000")
    assert e.handle_callback(tampered, ts, "n5", sig)["reason"] == "INVALID_SIGNATURE"

    # 7 stale timestamp rejected
    old = int(time.time() * 1000) - 3_600_000
    assert send(e, raw, "n6", ts=old)["reason"] == "EXPIRED_TIMESTAMP"

    # 8 FAILED switch status releases the hold (v1 would have committed it)
    e.initiate("K3", "A2", "MPESA_B2C", 40000)
    r = send(e, body(originator_id="K3", switch_status="FAILED", amount=40000, switch_receipt=None), "n7")
    assert r["status"] == "FAILED_RELEASED" and e.balances["A2"] == Decimal("100000")

    # 9 variance caught per transaction (+30k and -30k no longer cancel)
    e.initiate("K4", "A2", "FOSA_CHEQUE", 20000); e.initiate("K5", "A2", "FOSA_CHEQUE", 50000)
    r4 = send(e, body(originator_id="K4", switch_status="SUCCESS", amount=50000, switch_receipt="R4"), "n8")
    r5 = send(e, body(originator_id="K5", switch_status="SUCCESS", amount=20000, switch_receipt="R5"), "n9")
    assert r4["status"] == r5["status"] == "SUSPENDED_VARIANCE"
    assert r4["delta"] == "30000.00" and r5["delta"] == "-30000.00"

    # 10 blocked account cannot start new payouts until reviewed
    assert e.initiate("K6", "A2", "MPESA_B2C", 10)["status"] == "BLOCKED_PENDING_REVIEW"

    # 11 silent transaction escalates to status query
    e.balances["A3"] = Decimal("5000"); e.initiate("K7", "A3", "MPESA_B2C", 1000)
    assert e.sweep_timeouts(int(time.time() * 1000) + 60_000) == ["K7"]

    # 12 audit chain intact, then tamper-detect
    assert e.verify_audit_chain()
    e.audit[0]["entry"] = e.audit[0]["entry"].replace("A1", "AX")
    assert not e.verify_audit_chain()

    print("All 12 tests passed")
    print(estimate_savings(200_000, 3_500, 0.30, 70, 150_000))

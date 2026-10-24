"""FastAPI sidecar. Demo wiring: one in-memory engine per API key (= tenant).
Production: hydrate each tenant's engine from Postgres on start, write every
assess/commit/repayment through to the append-only tables in schema_v2.sql, and
replace the in-process lock with a per-tenant Postgres advisory lock."""
import os
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
from guarantor_engine import CommitRefused, GuarantorRiskEngine, Policy

app = FastAPI(title="GuarantorGraph v2", version="2.0")
TENANTS: dict[str, GuarantorRiskEngine] = {}          # api_key -> engine
DEMO_KEY = os.getenv("GG_DEMO_KEY", "demo-key")
TENANTS[DEMO_KEY] = GuarantorRiskEngine(Policy(version="demo"))


def engine(x_api_key: str = Header(...)) -> GuarantorRiskEngine:
    e = TENANTS.get(x_api_key)
    if e is None:
        raise HTTPException(401, "invalid API key")
    return e


class MemberIn(BaseModel):
    member_id: str
    total_deposits: float = Field(ge=0)
    encumbered_deposits: float = Field(ge=0, default=0)
    probability_of_default: float = Field(ge=0, le=1, default=0.05)
    is_insider: bool = False


class GuarantorIn(BaseModel):
    guarantor_id: str
    guaranteed_amount: float = Field(gt=0)


class AssessIn(BaseModel):
    request_id: str
    loan_id: str
    borrower_id: str
    loan_amount: float = Field(gt=0)
    guarantors: list[GuarantorIn] = Field(min_length=1)


class OverrideIn(BaseModel):
    maker: str
    checker: str
    reason: str = Field(min_length=10)


class RepaymentIn(BaseModel):
    loan_id: str
    outstanding: float = Field(ge=0)


P = "/api/v1/risk/guarantor-graph"


@app.put(P + "/members")
def upsert_member(m: MemberIn, e: GuarantorRiskEngine = Depends(engine)):
    try:
        e.register_member(m.member_id, m.total_deposits, m.encumbered_deposits,
                          m.probability_of_default, m.is_insider)
    except ValueError as ex:
        raise HTTPException(400, str(ex))
    return {"ok": True}


@app.post(P + "/assess")
def assess(a: AssessIn, e: GuarantorRiskEngine = Depends(engine)):
    # HTTP 200 with a decision body: a business REJECTED is not a malformed request (v1 used 422).
    return e.assess(a.request_id, a.borrower_id, a.loan_id, a.loan_amount,
                    [{"guarantor_id": g.guarantor_id, "amount": g.guaranteed_amount} for g in a.guarantors])


@app.post(P + "/commit/{request_id}")
def commit(request_id: str, override: OverrideIn | None = None, e: GuarantorRiskEngine = Depends(engine)):
    try:
        return e.commit(request_id, override.model_dump() if override else None)
    except CommitRefused as ex:
        raise HTTPException(409, str(ex))


@app.post(P + "/repayment")
def repayment(r: RepaymentIn, e: GuarantorRiskEngine = Depends(engine)):
    e.record_repayment(r.loan_id, r.outstanding)
    return {"ok": True}


@app.get(P + "/portfolio/rings")
def rings(e: GuarantorRiskEngine = Depends(engine)):
    return e.audit_rings()


@app.get(P + "/portfolio/leaderboard")
def leaderboard(top: int = 10, e: GuarantorRiskEngine = Depends(engine)):
    return e.leaderboard(top)

"""
SpreadShield v2: deposit retention engine (reference implementation)

Fixes vs v1:
 - Savings are expected values per account (v1 doc used a deterministic 100% flight case).
 - Offer rate is OPTIMISED over a grid, bounded by policy limits (v1 hard-coded 7%).
 - Retention effectiveness depends on how much of the rate gap the offer closes
   (v1 assumed a flat 85% churn cut at any rate).
 - Replacement rate is an input (what the institution really pays to replace funds),
   not a hard-coded "11.5% emergency interbank".
 - Model uses ln(balance) as documented; default weights are flagged UNCALIBRATED and
   fit_logistic() trains on the prospect's own labelled history.
 - Holdout assignment + uplift measurement, so savings are measured, not asserted.
 - Elasticity is a computed portfolio diagnostic, not a hard-coded number.
 - Currency neutral (KES in, KES out). No hard-coded FX.
"""
import hashlib
import math
from dataclasses import dataclass

import numpy as np


@dataclass
class Policy:
    replacement_rate: float          # what the institution pays to replace lost funds
    market_rate: float               # benchmark (e.g. 364-day T-bill); live input, never hard-coded
    trigger_p: float = 0.35          # minimum churn probability to consider an offer
    min_offer_step: float = 0.0025   # grid step for offer rate
    max_offer_rate: float = None     # policy cap; default = min(replacement, market)
    max_effectiveness: float = 0.60  # best-case churn reduction; CALIBRATE via holdout test
    budget_cap: float = None         # max total extra interest per year across offers

    def cap(self):
        return self.max_offer_rate if self.max_offer_rate is not None else min(
            self.replacement_rate, self.market_rate)


DEFAULT_W = {"b0": -3.0, "spread": 28.5, "ln_bal": 0.22, "txn": -0.045, "tenure": -0.025}
MODEL_STATUS = "UNCALIBRATED_DEFAULT_WEIGHTS"  # illustrative only until fit_logistic() is run


def features(balance, dep_rate, mkt_rate, txn_count, tenure_m):
    return np.array([1.0, max(0.0, mkt_rate - dep_rate), math.log(max(balance, 1.0)),
                     txn_count, tenure_m])


def p_churn(x, w=None):
    w = w if w is not None else np.array([DEFAULT_W[k] for k in ("b0", "spread", "ln_bal", "txn", "tenure")])
    z = float(x @ w)
    return float(np.clip(1 / (1 + math.exp(-z)), 0.001, 0.999))


def fit_logistic(X, y, lr=0.1, epochs=4000, l2=1e-3):
    """Train on the institution's labelled history (y=1 if balance left within 30 days)."""
    X = np.asarray(X, float); y = np.asarray(y, float)
    mu, sd = X[:, 1:].mean(0), X[:, 1:].std(0) + 1e-9
    Z = np.hstack([np.ones((len(X), 1)), (X[:, 1:] - mu) / sd])
    w = np.zeros(Z.shape[1])
    for _ in range(epochs):
        p = 1 / (1 + np.exp(-Z @ w))
        w -= lr * (Z.T @ (p - y) / len(y) + l2 * w)
    w_raw = np.empty_like(w)                 # convert back to raw-feature weights
    w_raw[1:] = w[1:] / sd
    w_raw[0] = w[0] - float(np.sum(w[1:] * mu / sd))
    return w_raw


def evaluate_account(balance, dep_rate, txn_count, tenure_m, pol: Policy, w=None):
    x = features(balance, dep_rate, pol.market_rate, txn_count, tenure_m)
    p = p_churn(x, w)
    cost_none = balance * (p * pol.replacement_rate + (1 - p) * dep_rate)
    best = {"rate": dep_rate, "saving": 0.0, "p_after": p}
    gap = max(pol.market_rate - dep_rate, 1e-9)
    r = dep_rate + pol.min_offer_step
    while r <= pol.cap() + 1e-12:
        eff = pol.max_effectiveness * min(1.0, (r - dep_rate) / gap)
        p2 = p * (1 - eff)
        cost_off = balance * (p2 * pol.replacement_rate + (1 - p2) * r)
        s = cost_none - cost_off
        if s > best["saving"]:
            best = {"rate": round(r, 6), "saving": s, "p_after": p2}
        r += pol.min_offer_step
    trigger = p >= pol.trigger_p and best["saving"] > 0
    return {"p_churn_30d": round(p, 4), "model_status": MODEL_STATUS if w is None else "CALIBRATED",
            "action": "TRIGGER_OFFER" if trigger else "MAINTAIN_CURRENT_YIELD",
            "offer_rate": best["rate"] if trigger else dep_rate,
            "p_churn_after_offer": round(best["p_after"], 4) if trigger else round(p, 4),
            "expected_cost_no_action": round(cost_none, 2),
            "expected_annual_saving": round(best["saving"], 2) if trigger else 0.0,
            "extra_interest_if_accepted": round(balance * (best["rate"] - dep_rate), 2) if trigger else 0.0}


def portfolio_savings(accounts, pol: Policy, w=None):
    """accounts: iterable of dicts(balance, dep_rate, txn_count, tenure_m). Respects budget cap."""
    rows = [(a, evaluate_account(a["balance"], a["dep_rate"], a["txn_count"], a["tenure_m"], pol, w))
            for a in accounts]
    trig = sorted([r for r in rows if r[1]["action"] == "TRIGGER_OFFER"],
                  key=lambda r: -r[1]["expected_annual_saving"] / max(r[1]["extra_interest_if_accepted"], 1))
    spent, total, n = 0.0, 0.0, 0
    for _, r in trig:
        if pol.budget_cap is not None and spent + r["extra_interest_if_accepted"] > pol.budget_cap:
            continue
        spent += r["extra_interest_if_accepted"]; total += r["expected_annual_saving"]; n += 1
    return {"accounts": len(rows), "offers": n, "expected_annual_saving": round(total, 2),
            "extra_interest_budget_used": round(spent, 2)}


def sensitivity(accounts, pol: Policy, effs=(0.2, 0.4, 0.6)):
    """Show a range, not a point: the honest way to present savings before a pilot."""
    out = {}
    for e in effs:
        p2 = Policy(**{**pol.__dict__, "max_effectiveness": e})
        out[f"effectiveness_{int(e*100)}pct"] = portfolio_savings(accounts, p2)["expected_annual_saving"]
    return out


def in_holdout(account_id: str, pct=0.10, salt="ss-v2") -> bool:
    """Deterministic control group: these accounts get NO offer, so uplift can be measured."""
    h = int(hashlib.sha256(f"{salt}:{account_id}".encode()).hexdigest(), 16) % 10_000
    return h < pct * 10_000


def measure_uplift(treated_total, treated_left, control_total, control_left):
    rt, rc = treated_left / treated_total, control_left / control_total
    return {"churn_treated": round(rt, 4), "churn_control": round(rc, 4),
            "relative_churn_reduction": round(1 - rt / rc, 4) if rc else None}


def realised_elasticity(balance_change_pct, spread_change_pct):
    """Portfolio diagnostic from history; None when the spread did not move."""
    return None if abs(spread_change_pct) < 1e-9 else balance_change_pct / spread_change_pct


if __name__ == "__main__":
    pol = Policy(replacement_rate=0.0904, market_rate=0.0904)   # illustrative: 364d T-bill ~9.04% (Oct 2026)

    whale = evaluate_account(5_000_000, 0.03, 3, 12, pol)
    sticky = evaluate_account(200_000, 0.03, 25, 48, pol)
    print("Whale :", whale)
    print("Sticky:", sticky)
    assert whale["action"] == "TRIGGER_OFFER" and sticky["action"] == "MAINTAIN_CURRENT_YIELD"
    assert pol.min_offer_step <= whale["offer_rate"] - 0.03 and whale["offer_rate"] <= pol.cap()
    assert whale["expected_annual_saving"] < 5_000_000 * (pol.replacement_rate - whale["offer_rate"]), \
        "expected saving must be below the naive deterministic figure"

    # calibration recovers a known relationship from synthetic labelled history
    rng = np.random.default_rng(7)
    n = 6000
    bal = rng.lognormal(12, 1.2, n); dep = rng.uniform(0.02, 0.05, n)
    txn = rng.integers(0, 40, n); ten = rng.integers(1, 120, n)
    X = np.array([features(b, d, 0.0904, t, a) for b, d, t, a in zip(bal, dep, txn, ten)])
    true_w = np.array([-4.0, 30.0, 0.25, -0.05, -0.02])
    y = (rng.random(n) < 1 / (1 + np.exp(-X @ true_w))).astype(float)
    w_fit = fit_logistic(X, y)
    print("true w  :", true_w); print("fitted w:", np.round(w_fit, 3))
    assert abs(w_fit[3] - true_w[3]) < 0.02 and abs(w_fit[2] - true_w[2]) < 0.08

    # portfolio + sensitivity + holdout
    accts = [{"balance": float(b), "dep_rate": float(d), "txn_count": int(t), "tenure_m": int(a)}
             for b, d, t, a in zip(bal[:500], dep[:500], txn[:500], ten[:500])]
    print("Portfolio:", portfolio_savings(accts, pol, w_fit))
    print("Sensitivity:", sensitivity(accts, pol))
    share = sum(in_holdout(f"ACC{i}") for i in range(20000)) / 20000
    assert 0.08 < share < 0.12
    print("Uplift:", measure_uplift(900, 54, 100, 12))
    print("All checks passed")

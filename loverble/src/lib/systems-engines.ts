export type SystemsEngineFile = {
  filename: string;
  label: string;
};

export type SystemsEngine = {
  slug: string;
  name: string;
  codename: string;
  version: string;
  category: string;
  summary: string;
  description: string;
  audience: string;
  problem: string;
  howItWorks: string[];
  inputs: string[];
  outputs: string[];
  capabilities: string[];
  limitations: string[];
  status: "Architecture preview";
  stack: string[];
  /** YouTube/Vimeo embed URL when ready — leave empty for placeholder. */
  demoVideoUrl?: string;
  /** Deliverables shown as preview labels only (not downloadable). */
  files: SystemsEngineFile[];
};

export const SYSTEMS_ENGINES: SystemsEngine[] = [
  {
    slug: "spreadshield",
    name: "SpreadShield",
    codename: "Deposit retention engine",
    version: "v2",
    category: "DEPOSITS · RETENTION",
    summary:
      "Optimises deposit retention offers from churn probability, market rates, and replacement cost — expected-value savings, not a hard-coded rate.",
    description:
      "Reference implementation for SACCO and bank deposit desks. Models churn with logistic features (rate gap, ln(balance), activity, tenure), optimises offer rates on a policy-bounded grid, and supports holdout assignment so retention savings are measured. Default weights are flagged uncalibrated until fit_logistic() trains on labelled history.",
    audience: "Banks · SACCOs · treasury / liability desks",
    problem:
      "When market rates rise, depositors leave. Flat retention offers waste margin; no offer costs replacement funding. Teams need a policy-bounded way to decide who gets an offer and at what rate.",
    howItWorks: [
      "Score each account’s churn probability from rate gap, ln(balance), transactions, and tenure.",
      "Estimate cost of doing nothing vs cost of an offer (extra interest vs replacement funding).",
      "Search a policy-capped rate grid and pick the offer with the best expected saving.",
      "Optionally assign holdouts so uplift is measured, not asserted.",
    ],
    inputs: [
      "Account balance and current deposit rate",
      "Market / T-bill benchmark rate (live input)",
      "Replacement funding rate",
      "Transaction count and tenure (months)",
      "Policy caps: max offer, trigger probability, budget",
    ],
    outputs: [
      "Churn probability before / after offer",
      "Recommended offer rate (or keep current)",
      "Expected annual saving vs no-action",
      "Portfolio elasticity diagnostic",
    ],
    capabilities: [
      "Expected-value retention vs deterministic flight assumptions",
      "Policy-capped offer-rate grid optimisation",
      "Holdout uplift measurement + portfolio elasticity diagnostic",
      "Currency-neutral (KES in, KES out) — no hard-coded FX",
    ],
    limitations: [
      "Default logistic weights are UNCALIBRATED until you train on labelled history.",
      "Reference pack only — not a production-certified deployment.",
      "Does not connect to your core banking system out of the box.",
    ],
    status: "Architecture preview",
    stack: ["Python", "NumPy"],
    demoVideoUrl: undefined,
    files: [
      { filename: "README.txt", label: "Pack notes" },
      { filename: "spreadshield_engine_v2.py", label: "Engine source (Python)" },
    ],
  },
  {
    slug: "reconguard",
    name: "ReconGuard",
    codename: "Payment switch reconciliation",
    version: "v2",
    category: "PAYMENTS · RECONCILIATION",
    summary:
      "Two-phase initiate/callback reconciliation for mobile-money and card switches — HMAC authenticity, idempotent retries, and per-txn variance checks.",
    description:
      "Reference switch engine for payment rails. Reserves funds before dispatch, verifies HMAC over the raw request body, never trusts caller-supplied ledger amounts, and handles FAILED / variance / timeout states without locking customer accounts on security failures. Includes a hash-chained audit log and timeout sweep to STATUS_QUERY_REQUIRED.",
    audience: "Payment ops · fintech · SACCO switch integrations",
    problem:
      "Payment switches callback late, retry, or fail. Trusting caller amounts or netting batch variance hides leakage. Ops need a clear hold → settle / release / query loop with cryptographic integrity.",
    howItWorks: [
      "initiate() reserves (holds) funds before anything is sent to the switch.",
      "Callbacks are HMAC-verified over the raw body, with skew and nonce checks.",
      "Engine looks up the authorised amount itself — never trusts a caller-supplied ledger figure.",
      "States: SETTLED, FAILED_RELEASED, SUSPENDED_VARIANCE, or STATUS_QUERY_REQUIRED on timeout.",
    ],
    inputs: [
      "Account id, channel, amount, idempotency key",
      "Switch callback body + HMAC signature",
      "Timestamp and nonce",
      "Policy: max skew, nonce TTL, callback timeout",
    ],
    outputs: [
      "Transaction state machine updates",
      "Hold / release / settle ledger effects",
      "Review flags (human review — not hard account locks)",
      "Hash-chained append-only audit entries",
    ],
    capabilities: [
      "Initiate hold → switch callback close-out",
      "HMAC over raw body + clock-skew + nonce claim",
      "Per-transaction variance (not netted batch sums)",
      "Idempotent retries · hash-chained audit trail",
    ],
    limitations: [
      "In-memory stores in the pack — replace with Postgres + Redis for production.",
      "Reference pack only — wire to your actual M-Pesa / card switch adapters.",
      "Security failures alert; they do not lock customer accounts (DoS risk).",
    ],
    status: "Architecture preview",
    stack: ["Python", "Decimal money"],
    demoVideoUrl: undefined,
    files: [
      { filename: "README.txt", label: "Pack notes" },
      { filename: "reconguard_engine_v2.py", label: "Engine source (Python)" },
    ],
  },
  {
    slug: "guarantorgraph",
    name: "GuarantorGraph",
    codename: "Guarantor risk engine",
    version: "v2",
    category: "CREDIT · GUARANTEES",
    summary:
      "Graph-based guarantor capacity, cycle detection, and contagion stress for SACCO / microfinance group lending — with assess/commit separation and SQL audit schema.",
    description:
      "Reference guarantor risk engine for SACCOs and small lenders. assess() is a pure dry-run; commit() re-validates and is idempotent. Tracks per-loan guarantee records, merges duplicate guarantors, rejects self-guarantees, and uses bounded shortest-path cycle search. Outcomes: APPROVED / REFERRED / REJECTED. Pack includes FastAPI sidecar wiring and Postgres-oriented schema_v2.sql.",
    audience: "SACCO credit · microfinance · risk committees",
    problem:
      "Group lending creates hidden cycles and over-concentration of guarantor exposure. Approving without a graph view understates risk; rejecting without referral paths blocks legitimate committee overrides.",
    howItWorks: [
      "assess() dry-runs capacity, cycles, and contagion — no state mutation.",
      "commit() re-validates and writes per-loan guarantee edges idempotently.",
      "Capacity uses gross outstanding guarantees vs free deposits (PD-weighted EL as a secondary signal).",
      "Outcomes: APPROVED, REFERRED (maker-checker), or REJECTED (not overridable here).",
    ],
    inputs: [
      "Member deposits, encumbrances, PD, insider flag",
      "Loan id, borrower, amount, guarantor list",
      "Policy ratios: exposure, expected loss, cycle lengths",
      "Optional maker/checker override payload for referrals",
    ],
    outputs: [
      "Decision: APPROVED / REFERRED / REJECTED",
      "All findings (fails closed — not first-error only)",
      "Updated exposure graph + contagion stress view",
      "Audit trail entries (schema_v2.sql for persistence)",
    ],
    capabilities: [
      "Assess vs commit separation + maker-checker referral",
      "Gross exposure vs free deposits + PD-weighted EL signal",
      "Cycle / reciprocal / contagion stress checks",
      "FastAPI demo sidecar + append-only SQL schema",
    ],
    limitations: [
      "Requires NetworkX (and FastAPI/Pydantic for the sidecar).",
      "Demo API uses in-memory tenants — hydrate from Postgres in production.",
      "Reference pack only — calibrate Policy() per SACCO, do not treat defaults as universal.",
    ],
    status: "Architecture preview",
    stack: ["Python", "NetworkX", "FastAPI", "SQL"],
    demoVideoUrl: undefined,
    files: [
      { filename: "README.txt", label: "Pack notes" },
      { filename: "guarantor_engine.py", label: "Engine source (Python)" },
      { filename: "api.py", label: "FastAPI sidecar" },
      { filename: "schema_v2.sql", label: "SQL schema" },
      { filename: "test_guarantor_engine.py", label: "Unit tests" },
    ],
  },
];

export function getSystemsEngine(slug: string): SystemsEngine | undefined {
  return SYSTEMS_ENGINES.find((e) => e.slug === slug);
}

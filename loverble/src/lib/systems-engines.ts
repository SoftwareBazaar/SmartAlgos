export type SystemsEngineFile = {
  filename: string;
  label: string;
  href: string;
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
  capabilities: string[];
  status: "Reference pack" | "Architecture preview";
  stack: string[];
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
    capabilities: [
      "Expected-value retention vs deterministic flight assumptions",
      "Policy-capped offer-rate grid optimisation",
      "Holdout uplift measurement + portfolio elasticity diagnostic",
      "Currency-neutral (KES in, KES out) — no hard-coded FX",
    ],
    status: "Reference pack",
    stack: ["Python", "NumPy"],
    files: [
      {
        filename: "README.txt",
        label: "Pack notes",
        href: "/downloads/systems/spreadshield/README.txt",
      },
      {
        filename: "spreadshield_engine_v2.py",
        label: "Engine source",
        href: "/downloads/systems/spreadshield/spreadshield_engine_v2.py",
      },
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
    capabilities: [
      "Initiate hold → switch callback close-out",
      "HMAC over raw body + clock-skew + nonce claim",
      "Per-transaction variance (not netted batch sums)",
      "Idempotent retries · hash-chained audit trail",
    ],
    status: "Reference pack",
    stack: ["Python", "Decimal money"],
    files: [
      {
        filename: "README.txt",
        label: "Pack notes",
        href: "/downloads/systems/reconguard/README.txt",
      },
      {
        filename: "reconguard_engine_v2.py",
        label: "Engine source",
        href: "/downloads/systems/reconguard/reconguard_engine_v2.py",
      },
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
    capabilities: [
      "Assess vs commit separation + maker-checker referral",
      "Gross exposure vs free deposits + PD-weighted EL signal",
      "Cycle / reciprocal / contagion stress checks",
      "FastAPI demo sidecar + append-only SQL schema",
    ],
    status: "Reference pack",
    stack: ["Python", "NetworkX", "FastAPI", "SQL"],
    files: [
      {
        filename: "README.txt",
        label: "Pack notes",
        href: "/downloads/systems/guarantorgraph/README.txt",
      },
      {
        filename: "guarantor_engine.py",
        label: "Engine source",
        href: "/downloads/systems/guarantorgraph/guarantor_engine.py",
      },
      {
        filename: "api.py",
        label: "FastAPI sidecar",
        href: "/downloads/systems/guarantorgraph/api.py",
      },
      {
        filename: "schema_v2.sql",
        label: "SQL schema",
        href: "/downloads/systems/guarantorgraph/schema_v2.sql",
      },
      {
        filename: "test_guarantor_engine.py",
        label: "Tests",
        href: "/downloads/systems/guarantorgraph/test_guarantor_engine.py",
      },
    ],
  },
];

export function getSystemsEngine(slug: string): SystemsEngine | undefined {
  return SYSTEMS_ENGINES.find((e) => e.slug === slug);
}

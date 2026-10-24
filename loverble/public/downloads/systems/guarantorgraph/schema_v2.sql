-- GuarantorGraph v2 schema (PostgreSQL 14+). Multi-tenant, constraint-enforced, audit-ready.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
  tenant_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  policy     JSONB NOT NULL DEFAULT '{}',          -- per-SACCO thresholds (engine Policy)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE members (
  tenant_id           UUID NOT NULL REFERENCES tenants,
  member_id           TEXT NOT NULL,
  full_name           TEXT NOT NULL,               -- PII: encrypt at rest, Data Protection Act 2019
  total_deposits      NUMERIC(15,2) NOT NULL CHECK (total_deposits >= 0),
  encumbered_deposits NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_insider          BOOLEAN NOT NULL DEFAULT false,   -- board / staff / related parties
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, member_id),
  CHECK (encumbered_deposits >= 0 AND encumbered_deposits <= total_deposits)
);

-- PD is a model OUTPUT with lineage, not a static column
CREATE TABLE member_pd_history (
  tenant_id UUID NOT NULL, member_id TEXT NOT NULL, as_of DATE NOT NULL,
  pd NUMERIC(5,4) NOT NULL CHECK (pd BETWEEN 0 AND 1),
  model_version TEXT NOT NULL,
  PRIMARY KEY (tenant_id, member_id, as_of),
  FOREIGN KEY (tenant_id, member_id) REFERENCES members
);

CREATE TABLE loans (
  tenant_id   UUID NOT NULL,
  loan_id     TEXT NOT NULL,
  borrower_id TEXT NOT NULL,
  principal   NUMERIC(15,2) NOT NULL CHECK (principal > 0),
  outstanding NUMERIC(15,2) NOT NULL CHECK (outstanding >= 0),
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DEFAULTED','CLEARED')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, loan_id),
  UNIQUE (tenant_id, loan_id, borrower_id),
  FOREIGN KEY (tenant_id, borrower_id) REFERENCES members
);

CREATE TABLE loan_guarantees (
  tenant_id         UUID NOT NULL,
  loan_id           TEXT NOT NULL,
  guarantor_id      TEXT NOT NULL,
  borrower_id       TEXT NOT NULL,                  -- denormalised, but FK-locked to the loan below
  guaranteed_amount NUMERIC(15,2) NOT NULL CHECK (guaranteed_amount > 0),
  status            TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','RELEASED','CALLED')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, loan_id, guarantor_id),
  FOREIGN KEY (tenant_id, loan_id, borrower_id) REFERENCES loans (tenant_id, loan_id, borrower_id),
  FOREIGN KEY (tenant_id, guarantor_id) REFERENCES members,
  CHECK (guarantor_id <> borrower_id)               -- no self-guarantee, enforced by the database
);
CREATE INDEX idx_gg_out ON loan_guarantees (tenant_id, guarantor_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_gg_in  ON loan_guarantees (tenant_id, borrower_id)  WHERE status = 'ACTIVE';

-- Append-only decision + override trail (REVOKE UPDATE, DELETE from the app role)
CREATE TABLE risk_decisions (
  tenant_id UUID NOT NULL, request_id TEXT NOT NULL,
  input_hash TEXT NOT NULL, decision TEXT NOT NULL CHECK (decision IN ('APPROVED','REFERRED','REJECTED')),
  findings JSONB NOT NULL, metrics JSONB NOT NULL, policy_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, request_id)
);
CREATE TABLE risk_overrides (
  override_id BIGSERIAL PRIMARY KEY, tenant_id UUID NOT NULL, request_id TEXT NOT NULL,
  maker TEXT NOT NULL, checker TEXT NOT NULL, reason TEXT NOT NULL CHECK (length(reason) >= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (maker <> checker),
  FOREIGN KEY (tenant_id, request_id) REFERENCES risk_decisions
);

-- Tenant isolation: enable RLS on every table and filter on current_setting('app.tenant_id')
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_iso ON members USING (tenant_id = current_setting('app.tenant_id')::uuid);

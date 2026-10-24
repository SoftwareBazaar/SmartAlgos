GuarantorGraph v2 — Guarantor risk engine (reference pack)
Smart Algos & Financial Systems · Smart Algos Investment Solution Ltd (Kenya)

What this is
  A reference graph-based guarantor risk engine for SACCOs / small lenders,
  plus a FastAPI demo sidecar and SQL schema sketch. Educational /
  architecture preview — not a production-certified product.

Includes
  - guarantor_engine.py
  - api.py                 (FastAPI sidecar; demo API key wiring)
  - schema_v2.sql          (append-oriented persistence sketch)
  - test_guarantor_engine.py

Notes
  - assess() is dry-run; commit() re-validates and is idempotent.
  - Requires: Python 3, networkx, fastapi, pydantic (for the sidecar)
  - Production: hydrate engines from Postgres; use advisory locks per tenant.

Contact
  Book a desk at https://www.smartalgosts.com/consultation?track=systems

ReconGuard v2 — Payment switch reconciliation (reference pack)
Smart Algos & Financial Systems · Smart Algos Investment Solution Ltd (Kenya)

What this is
  A reference Python engine for two-phase payment-switch reconciliation
  (initiate hold → callback settlement). Educational / architecture preview —
  not a production-certified product.

Includes
  - reconguard_engine_v2.py  (engine + inline scenario helpers)

Notes
  - Replace in-memory stores with PostgreSQL + Redis SET NX EX for production.
  - HMAC must cover the raw request body; never re-serialise for verification.
  - Requires: Python 3 (stdlib)

Contact
  Book a desk at https://www.smartalgosts.com/consultation?track=systems

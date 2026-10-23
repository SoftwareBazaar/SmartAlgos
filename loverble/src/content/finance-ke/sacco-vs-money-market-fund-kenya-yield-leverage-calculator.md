# SACCO vs Money Market Fund in Kenya: Yield, Tax and Borrowing Leverage (2026)

## The Short Answer

For **idle cash**, a CMA-regulated **money market fund (MMF)** usually wins on liquidity and after-tax yield versus parking the same money unleveraged in a SACCO. At a **10.50% EAR** MMF (aligned with our October 2026 MMF vs T-bill snapshot), net return is about **8.9%** after **15%** withholding tax. An illustrative DT-SACCO mix of **KES 50,000** shares at **14%** and **KES 450,000** deposits at **10.5%** nets about **9.4%** after the correct tax split (**5%** on share dividends, **15%** on deposit interest) — close on yield, far worse on liquidity (often **60–90 days** to exit).

The SACCO’s real edge is not the dividend brochure — it is **member borrowing** (often up to about **3×–4×** deposits, subject to bylaws, guarantors and affordability). Borrowing to invest only works if **(a)** the asset’s after-tax yield beats the **loan APR**, and **(b)** you can service the instalment from income without starving your emergency fund. Comparing a “~6.6% flat” loan cost to a 14% bond is **not** a valid spread test.

*Illustrative rates as of October 2026. SACCO AGM rates change yearly; MMF yields move daily.*

## What Each Vehicle Actually Is

| | **Money market fund** | **Deposit-taking SACCO (DT-SACCO)** |
| :--- | :--- | :--- |
| **Regulator** | CMA (collective investment) | SASRA |
| **Job** | Liquid cash / short-term parking | Savings + member credit |
| **Return form** | Daily interest (fund EAR) | Share **dividend** + deposit **interest/rebate** |
| **Typical tax (resident)** | **15%** WHT on interest | **~5%** on share dividends; deposit interest often **15%** (confirm on your advice note) |
| **Liquidity** | Often **T+1 to T+3** | Withdrawals / exit commonly **60–90 days**; active loans need guarantors |
| **Leverage** | None | Borrow against deposits (multiplier set in bylaws) |

Never treat “12% SACCO” as one number. Share capital and deposits pay **different** rates and can face **different** tax.

---

## Baseline Assumptions (KES 500,000)

| Parameter | MMF | DT-SACCO (illustrative) |
| :--- | :--- | :--- |
| Capital | KES 500,000 | KES 50,000 shares + KES 450,000 BOSA deposits |
| Gross yield | **10.50% EAR** (before WHT; after fund fees as published) | **14.0%** on shares / **10.5%** on deposits |
| Tax | 15% WHT on interest | 5% on share dividend; 15% on deposit interest |
| Horizon | 12 and 36 months | Same |

These SACCO rates sit inside the 2026 AGM range reported for many DT-SACCOs (share dividends often low-teens to high-teens; deposit interest often high-single to low-teens). Pick **your** SACCO’s latest AGM circular before deciding.

---

## Mathematics

### 1. MMF: published EAR → net of 15% WHT

Let published effective annual rate be $\text{EAR} = 0.105$. Convert to a daily rate, tax the daily interest, then compound (same approach as our [MMF vs T-bill note](/finance/ke/money-market-fund-vs-treasury-bills-kenya-net-returns)):

$$r_{\text{daily}} = (1 + \text{EAR})^{1/365} - 1, \qquad r_{\text{net,daily}} = r_{\text{daily}} \cdot (1 - 0.15)$$

$$A_{\text{MMF}} = P \cdot (1 + r_{\text{net,daily}})^{365}$$

For $P = 500{,}000$ this yields about **8.86% net** and:

$$A_{\text{MMF}}(1\text{ yr}) \approx \mathbf{KES\ 544{,}300} \quad (\text{profit } \approx \mathbf{KES\ 44{,}300})$$

Over 36 months, if the **same** net effective rate compounds:

$$A_{\text{MMF}}(3\text{ yr}) \approx 500{,}000 \times (1.0886)^{3} \approx \mathbf{KES\ 645{,}000} \quad (\text{profit } \approx \mathbf{KES\ 145{,}000},\ \sim\mathbf{29\%}\ \text{ROI})$$

*MMF yields float. Do not treat 10.50% EAR as locked.*

### 2. Unleveraged SACCO: two rates, two tax lines

$$\text{Gross} = 50{,}000 \times 0.14 + 450{,}000 \times 0.105 = 7{,}000 + 47{,}250 = 54{,}250$$

$$\text{Net} = 7{,}000 \times (1 - 0.05) + 47{,}250 \times (1 - 0.15) = 6{,}650 + 40{,}162.50 = \mathbf{KES\ 46{,}812.50}\ (\mathbf{9.36\%})$$

**Wrong method (do not use):** applying **15%** to the entire KES 54,250 understates the share-dividend net and was an error in earlier drafts of this note.

If dividends are **spent** rather than reinvested, 3-year profit ≈ $3 \times 46{,}812.50 = \mathbf{KES\ 140{,}438}$ (~**28%** ROI) with principal still in the SACCO — and still hard to unlock quickly.

---

<!-- [AD_SLOT_INLINE_1] -->

## 12- and 36-Month Comparison (Unleveraged)

| Strategy | Year-1 net yield | ~12-mo wealth* | ~36-mo profit | Liquidity |
| :--- | :--- | :--- | :--- | :--- |
| **MMF @ 10.50% EAR** | **~8.86%** | **~KES 544,300** | **~KES 145,000** | High |
| **SACCO unleveraged** | **~9.36%** | **~KES 546,813** (if dividends held as cash) | **~KES 140,400** | Low |

\*MMF figure compounds inside the fund. SACCO figure assumes the KES 500,000 stake stays put and year-1 net distributions are counted as cash.

**Reading the table:** unleveraged, the products are in the same yield neighbourhood in this illustration. The MMF wins on **access** and on **automatic compounding**. The SACCO wins only if you value membership, dividends culture, or — most importantly — **borrowing rights**.

---

<!-- [AD_SLOT_INLINE_2] -->

## Borrowing Leverage: Where the Real (and Risky) Edge Is

Many DT-SACCOs allow loans of about **3×–4×** deposits at roughly **12% p.a. reducing balance**, subject to guarantors, shares, and ability-to-pay tests.

### Valid spread test (use this)

Compare **like with like**:

$$R_{\text{asset, after tax}} > \text{Loan APR (reducing)}$$

Example: a **14%** asset versus a **12%** reducing loan is a **~2 percentage-point** spread — not ~7 points.

### Invalid “flat rate” trick (avoid this)

A 12% reducing loan over 36 months has a lower **flat-rate equivalent** (~6–7%). Marketing that flat figure against a 14% bond **overstates** the arbitrage. Banks and SACCOs quote reducing APRs for a reason — use that APR in the test.

### Worked leverage sketch (KES 450,000 deposits → 3× loan)

| Item | Value |
| :--- | :--- |
| BOSA deposits | KES 450,000 |
| Max illustrative loan (3×) | **KES 1,350,000** |
| Rate / term | **12%** reducing / **36** months |
| Monthly instalment | **≈ KES 44,839** |
| Total interest if held to term | **≈ KES 264,200** |
| Simple 14% × 3 years on full KES 1.35M | **≈ KES 567,000** interest income |
| Interest spread (if assumptions hold) | **≈ KES 303,000** |

**What this sketch hides:**

1. **Cash-flow strain** — You must pay ≈ **KES 45,000/month** from salary or other income. That cash has an opportunity cost (it could have gone into the MMF).
2. **Guarantors & rules** — No guarantors, no clean repayment history, no loan.
3. **Asset risk** — Bond prices move; land does not pay the instalment; “14% tax-free” only applies to specific instruments and holding conditions.
4. **SACCO risk** — Dividends are declared annually; liquidity is poor; governance and credit quality vary by SACCO.
5. **ROI on KES 500,000** that ignores the monthly outflows is **not** a complete return.

A honest decision rule: only borrow to invest if the instalment fits your budget **after** a 3–6 month MMF emergency buffer, and the after-tax asset yield still clears the **reducing** loan APR with a cushion.

---

## Decision Rules

### Rule 1 — Dual tranche, not either/or

* **Tranche A (liquidity):** 3–6 months of expenses in an MMF.
* **Tranche B (membership / leverage):** Long-horizon savings in a **SASRA-licensed DT-SACCO** you trust, sized for the loan you might actually need (school fees, business stock, home improvement) — not for speculative leverage by default.

### Rule 2 — Run the APR test, not the brochure test

$$R_{\text{asset, net}} > \text{APR}_{\text{loan, reducing}} + \text{cushion}$$

If the asset is illiquid land with 0% cash yield, reject the “arbitrage” framing.

### Rule 3 — Tax as printed on your advice note

Confirm whether your SACCO withholds **5%** on the share dividend only, or also treats deposit interest as **15%** WHT. Use the advice note, not a blog average.

---

<!-- [AD_SLOT_INLINE_3] -->

## Related Notes

* [Money Market Fund vs Treasury Bills — net returns after 15% WHT](/finance/ke/money-market-fund-vs-treasury-bills-kenya-net-returns)
* [Kenya net salary — PAYE, NSSF, SHA, Housing Levy](/finance/ke/net-salary-calculator-paye-sha-housing-levy)

---

## Sources

1. SASRA — deposit-taking SACCO regulatory framework (member deposits, prudential rules).
2. CMA — collective investment schemes / money market fund disclosures (check each fund’s factsheet for EAR vs net-of-tax presentation).
3. Income Tax Act practice for resident dividends (~5% WHT) and interest (~15% WHT); confirm on KRA guidance and your payer’s advice note.
4. Public 2026 SACCO AGM dividend/interest round-ups (rates vary widely by SACCO — e.g. reported FY2025 declarations announced in 2026).
5. Smart Algos — [MMF vs T-bill net return methodology](/finance/ke/money-market-fund-vs-treasury-bills-kenya-net-returns) (October 2026 rate snapshot).

*Educational comparison. Not advice to join a SACCO, buy an MMF, or borrow to invest. Past dividend rates and fund yields are not guarantees.*

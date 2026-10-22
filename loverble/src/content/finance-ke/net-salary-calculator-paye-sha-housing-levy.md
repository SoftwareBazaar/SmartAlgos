# Kenya Net Salary Calculator 2026: PAYE, NSSF, SHA and Housing Levy Explained (with Worked Examples)

## Executive Summary & Parameter Definitions

Navigating payroll statutory deductions in Kenya requires accounting for progressive income tax bands alongside recently enacted national statutory levies. With the enforcement of the **Social Health Insurance Act (SHA/SHIF)** at **2.75%**, the **Affordable Housing Act** at **1.5%**, and the **NSSF Act Phase 4 Escalation (4th Schedule)**, salaried employees experience significant "tax wedge" friction between gross contract pay and actual bank account liquidity.

This guide breaks down the mathematical framework governing Kenyan net salary calculations under current 2026 Kenya Revenue Authority (KRA) and statutory guidelines (rates last checked against KRA, NSSF and SHA guidance in **October 2026**; see Sources at the end). We show worked examples across key gross salary benchmarks (**KES 40,000**, **KES 80,000**, and **KES 150,000**), detailing how allowable deductions reduce taxable income before progressive PAYE brackets apply.

### Statutory Deduction Parameters & Rates (2026 Audit)

| Statutory Body | Deduction Type | Rate / Formula | 2026 Cap / Bounds | Tax Treatment |
| :--- | :--- | :--- | :--- | :--- |
| **NSSF Tier I** | Statutory Pension | **6.0%** of earnings up to LEL | Max **KES 540.00** (LEL: KES 9,000) | Allowable Tax Deduction |
| **NSSF Tier II** | Statutory Pension | **6.0%** of earnings (LEL to UEL) | Max **KES 5,940.00** (UEL: KES 108,000) | Allowable Tax Deduction |
| **SHA / SHIF** | Health Insurance | **2.75%** of Monthly Gross Pay | Min **KES 300.00**, **No Upper Cap** | Allowable Tax Relief / Deduction |
| **Housing Levy** | Affordable Housing Act | **1.50%** of Monthly Gross Pay | **No Upper Cap** (100% Employer Match) | Allowable Tax Relief / Deduction |
| **KRA PAYE** | Progressive Income Tax | **10% to 35%** Across 5 Brackets | Less Personal Relief (**KES 2,400.00/mo**) | Mandatory Monthly Tax |

---

## LaTeX Mathematical Framework

A Kenyan employee's net take-home salary ($N$) is derived by subtracting total statutory obligations--National Social Security Fund ($NSSF$), Social Health Authority ($SHA$), Housing Levy ($HL$), and Pay As You Earn ($PAYE$)--from gross monthly earnings ($G$):

$$N = G - (NSSF + SHA + HL + PAYE)$$

### 1. NSSF Pension Calculation (Feb 2026 4th Schedule)
Under the 4th Schedule of the NSSF Act, contributions are split into Tier I and Tier II based on Lower Earnings Limit ($LEL = \text{KES } 9,000$) and Upper Earnings Limit ($UEL = \text{KES } 108,000$):

$$NSSF_{\text{Tier I}} = \min(G, \quad 9,000) \times 0.06$$

$$NSSF_{\text{Tier II}} = \max\left(0, \quad \min(G, \quad 108,000) - 9,000\right) \times 0.06$$

$$NSSF = NSSF_{\text{Tier I}} + NSSF_{\text{Tier II}} \quad \le \quad \text{KES } 6,480.00$$

### 2. SHA / SHIF & Housing Levy Formulas
The Social Health Authority deduction applies an un-capped 2.75% rate (floor KES 300), while the Affordable Housing Levy applies a flat 1.5%:

$$SHA = \max(300, \quad G \times 0.0275)$$

$$HL = G \times 0.015$$

### 3. Allowable Deductions & Taxable Income ($T$)
Under the Tax Laws (Amendment) Act, statutory contributions (NSSF, SHA, and Housing Levy) are subtracted from gross salary to establish taxable income ($T$):

$$T = \max\left(0, \quad G - (NSSF + SHA + HL)\right)$$

### 4. Progressive PAYE Brackets & Personal Relief
Gross PAYE tax ($PAYE_{\text{gross}}$) is calculated across five progressive brackets:

$$PAYE_{\text{gross}} = 
\begin{cases} 
T \times 0.10 & T \le 24,000 \\
2,400 + (T - 24,000) \times 0.25 & 24,000 < T \le 32,333 \\
4,483.25 + (T - 32,333) \times 0.30 & 32,333 < T \le 500,000 \\
144,783.35 + (T - 500,000) \times 0.325 & 500,000 < T \le 800,000 \\
242,283.35 + (T - 800,000) \times 0.35 & T > 800,000
\end{cases}$$

Net PAYE payable subtracts monthly personal relief ($R_{\text{personal}} = \text{KES } 2,400.00$):

$$PAYE_{\text{net}} = \max\left(0, \quad PAYE_{\text{gross}} - 2,400.00\right)$$

---

<!-- [AD_SLOT_INLINE_1] -->

## Monthly Deductions by Salary Level

The dataset below outlines the complete monthly payroll deduction breakdown across key Kenyan salary benchmarks under current 2026 statutory rates:

| Gross salary (KES) | NSSF Tier I | NSSF Tier II | SHA/SHIF (2.75%) | Housing Levy (1.5%) | Total allowable deductions | Taxable income | PAYE before relief | PAYE after personal relief | Total statutory deductions | Net take-home pay | Effective deduction rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **40,000.00** | 540.00 | 1,860.00 | 1,100.00 | 600.00 | 4,100.00 | 35,900.00 | 5,553.35 | **3,153.35** | 7,253.35 | **32,746.65** | 18.13% |
| **80,000.00** | 540.00 | 4,260.00 | 2,200.00 | 1,200.00 | 8,200.00 | 71,800.00 | 16,323.35 | **13,923.35** | 22,123.35 | **57,876.65** | 27.65% |
| **150,000.00** | 540.00 | 5,940.00 | 4,125.00 | 2,250.00 | 12,855.00 | 137,145.00 | 35,926.85 | **33,526.85** | 46,381.85 | **103,618.15** | 30.92% |
| **250,000.00** | 540.00 | 5,940.00 | 6,875.00 | 3,750.00 | 17,105.00 | 232,895.00 | 64,651.85 | **62,251.85** | 79,356.85 | **170,643.15** | 31.74% |
| **500,000.00** | 540.00 | 5,940.00 | 13,750.00 | 7,500.00 | 27,730.00 | 472,270.00 | 136,464.35 | **134,064.35** | 161,794.35 | **338,205.65** | 32.36% |
| **1,000,000.00** | 540.00 | 5,940.00 | 27,500.00 | 15,000.00 | 48,980.00 | 951,020.00 | 295,140.35 | **292,740.35** | 341,720.35 | **658,279.65** | 34.17% |

*Table Notes: Calculations apply 2026 NSSF 4th Schedule caps (Max KES 6,480.00), SHA 2.75% un-capped health contribution, 1.5% Housing Levy, and monthly Personal Relief of KES 2,400.00.*

---

<!-- [AD_SLOT_INLINE_2] -->

## Quantitative Narrative & Economic Analysis

| Gross salary | Total deductions | Net take-home | Deduction rate |
| :--- | :--- | :--- | :--- |
| KES 40,000 | KES 7,253.35 | **KES 32,746.65** | 18.13% |
| KES 80,000 | KES 22,123.35 | **KES 57,876.65** | 27.65% |
| KES 150,000 | KES 46,381.85 | **KES 103,618.15** | 30.92% |
| KES 250,000 | KES 79,356.85 | **KES 170,643.15** | 31.74% |

### 1. The Transition from NHIF Flat Bands to Un-Capped SHA (2.75%)

Under the former National Hospital Insurance Fund (NHIF) framework, contributions were set in bands and capped at **KES 1,700.00/month** for gross incomes of KES 100,000 and above.

The replacement **Social Health Authority (SHA/SHIF)** model applies an un-capped **2.75% levy** across all gross earnings.
- For a **KES 80,000 gross salary**, health deductions increase from KES 1,500.00 (NHIF band for KES 80,000–89,999) to **KES 2,200.00 (SHA)**--a **46.7% increase**.
- For a **KES 250,000 gross salary**, health deductions jump from KES 1,700.00 (NHIF) to **KES 6,875.00 (SHA)**--a **304.4% increase**.

### 2. NSSF Phase 4 Escalation & Tax-Allowable Relief Protections

The 4th Schedule of the NSSF Act expands upper pension contribution limits to **KES 108,000.00 UEL**, bringing total combined NSSF contributions (Tier I + Tier II) to **KES 6,480.00/month** for salaries at or above KES 108,000.

Crucially, because statutory NSSF, SHA, and Housing Levy contributions are treated as **allowable tax deductions** under the Tax Laws (Amendment) Act, they reduce taxable income prior to PAYE calculation. For an employee in the 30% PAYE bracket, every KES 1,000 in statutory deductions reduces gross PAYE by **KES 300.00**, partially softening the net take-home reduction.

---

<!-- [AD_SLOT_INLINE_3] -->

## Strategic Takeaways & Decision Rules for Tax Optimization

Kenyan salaried employees and payroll administrators can apply two deterministic optimization rules to minimize tax drag:

### Rule 1: Use the Higher Pension Deduction Limit (KES 30,000/month)
Since the Tax Laws (Amendment) Act, 2024 took effect on 27 December 2024, the tax-deductible limit for contributions to a registered pension scheme is **KES 30,000 per month (KES 360,000 per year)**, up from KES 20,000. Check with your payroll team or KRA whether your NSSF contribution counts toward that limit; the example below assumes it does.
- **Example (KES 150,000 gross)**: NSSF already uses KES 6,480, leaving **KES 23,520/month** of room. Contributing that extra amount lowers taxable income from KES 137,145.00 to KES 113,625.00.
- **Tax saved**: at the 30% bracket, monthly PAYE falls by about **KES 7,056 (KES 84,672 per year)**, while the money goes into your retirement savings. Your pension provider must be registered with the relevant authority for the deduction to apply.

### Rule 2: Claim Mortgage Interest Deduction if You Qualify
Interest on a loan used to buy or build your own home can be deducted from taxable income if it is paid to a licensed lender and the home is owner-occupied. Payroll-vendor summaries of the 2024 changes put the monthly limit at **KES 30,000** (previously KES 25,000), but sources differ, so confirm the current cap in the Income Tax Act or with KRA before relying on it.
- **Illustration**: at the 30% bracket, each KES 1,000 of allowable interest cuts PAYE by KES 300, so a full KES 30,000 claim would save up to **KES 9,000 per month**, if that cap applies to you.
- You usually need your lender's interest certificate and must give it to your employer's payroll team.

*This article is educational and is not tax advice. Check your own situation with a qualified tax adviser or KRA.*

---

## Sources and Last Checked

- Kenya Revenue Authority (KRA): PAYE bands, personal relief, and the Tax Laws (Amendment) Act, 2024 changes to deductions (kra.go.ke)
- NSSF: Year 4 contribution limits (Lower Earnings Limit KES 9,000, Upper Earnings Limit KES 108,000) effective February 2026
- Social Health Authority: SHIF 2.75% contribution, KES 300 minimum
- Affordable Housing Act: 1.5% employee levy
- NHIF Standard and Special Contributions Regulations (historical bands, for the comparison above)
- **Rates last checked: October 2026. Update this date and re-verify whenever KRA, NSSF, or SHA announce changes.**

---

## Publisher Notes (do not display on the page)

Inject the block below as `<script type="application/ld+json">` in the page head, not as visible text. Add `author`, `datePublished` and `dateModified`, and include the `WebApplication` entry only if the calculator is actually embedded on the page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Kenya Net Salary Calculator 2026: PAYE, NSSF, SHA and Housing Levy Explained",
      "description": "How Kenyan payroll deductions work in 2026: PAYE bands, NSSF Year 4 limits, SHA 2.75%, and the 1.5% Housing Levy, with worked examples at KES 40,000, 80,000 and 150,000.",
      "inLanguage": "en-KE"
    },
    {
      "@type": "WebApplication",
      "name": "Kenya Net Take-Home Salary Calculator 2026",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "KES" }
    }
  ]
}
```

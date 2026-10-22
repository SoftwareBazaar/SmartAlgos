# Fuliza Charges Explained: What Borrowing KES 5,000 for 7 Days Really Costs (2026)

## The Short Answer

Using the Fuliza charges reported for 2026, borrowing **KES 5,000 for 7 days costs about KES 260**. That is 5.2% of the amount, or roughly **271% a year** if you annualise it. A 30-day M-Shwari loan for the same amount costs **KES 375** whether you repay on day 7 or day 30. For KES 5,000, Fuliza is cheaper if you repay within about **11 days**, and M-Shwari is cheaper after that.

*Tariffs change. Confirm against Safaricom's current Fuliza and M-Shwari pages and your own M-Pesa statement before relying on these figures. Last checked October 2026.*

## Executive Summary & Parameter Definitions

Fuliza (Safaricom with NCBA and KCB) and M-Shwari charge in different ways, which makes them hard to compare:

- **Fuliza** charges a one-off **1% access fee**, then a **daily maintenance fee** that depends on your balance band, with **20% excise duty** on the daily fee as reported in 2026.
- **M-Shwari** charges a **7.5% facilitation fee** once per 30-day loan. Safaricom states it is not interest and is payable once per loan; rolling the loan over triggers another fee.

This note converts both into the **total shilling cost** and an **annualised rate (APR)** so you can compare them.

### Fee components used

| Component | Fuliza (2026) | M-Shwari |
| :--- | :--- | :--- |
| One-off fee | 1% of the amount borrowed | 7.5% of the loan |
| Daily fee, KES 1–100 | None | n/a |
| Daily fee, KES 501–1,000 | KES 5 per day after 3 free days | n/a |
| Daily fee, KES 2,501–70,000 | KES 25 per day | n/a |
| Excise duty | 20% on the daily fee | Check whether excise applies to the fee |
| When the daily fee starts | From midnight after you borrow | n/a |

*Sources: reporting on Safaricom's June 2026 Fuliza tariff revision, a fee calculator checked 13 October 2026, and Safaricom's M-Shwari FAQ. Some sources also apply excise duty to the access fee or the M-Shwari fee, so confirm on your own statement. Bands not listed above (101–500, 1,001–2,500) are not covered here.*

---

## The Mathematics

For a Fuliza balance $P$ held for $D$ days, with access fee rate $a = 1\%$, daily fee $d$, free days $f$, and excise rate $x = 20\%$ on the daily fee:

$$F_{\text{Fuliza}} = a \cdot P + (1 + x) \cdot d \cdot \max(0,\; D - f)$$

$$\text{APR} = \frac{F}{P} \cdot \frac{365}{D}$$

For M-Shwari, with facilitation fee rate $m = 7.5\%$ charged once per loan:

$$F_{\text{M-Shwari}} = m \cdot P \qquad \text{APR}_{\text{M-Shwari}}(D) = m \cdot \frac{365}{D}$$

**Why APR and not EAR?** An effective annual rate assumes you borrow again and again for a year at the same short interval. Almost nobody does, and that assumption produces numbers in the thousands of percent that mislead rather than inform. The shilling cost and the simple annualised APR are the fair comparison.

---

<!-- [AD_SLOT_INLINE_1] -->

## KES 5,000: Fuliza vs M-Shwari by Days Held

Fuliza here is in the KES 2,501–70,000 band ($d = 25$, $f = 0$).

| Days held | Fuliza cost (KES) | Fuliza % of amount | Fuliza APR | M-Shwari cost (KES) | M-Shwari APR |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 80 | 1.6% | 584.0% | 375 | 2,737.5% |
| 3 | 140 | 2.8% | 340.7% | 375 | 912.5% |
| **7** | **260** | **5.2%** | **271.1%** | **375** | **391.1%** |
| 14 | 470 | 9.4% | 245.1% | 375 | 195.5% |
| 30 | 950 | 19.0% | 231.2% | 375 | 91.3% |

## Other Amounts

**KES 1,000** (Fuliza in the KES 501–1,000 band: $d = 5$, $f = 3$; M-Shwari fee is KES 75):

| Days held | Fuliza cost (KES) | Fuliza APR |
| :--- | :--- | :--- |
| 1 | 10 | 365.0% |
| 3 | 10 | 121.7% |
| 7 | 34 | 177.3% |
| 14 | 76 | 198.1% |
| 30 | 172 | 209.3% |

**KES 10,000** (Fuliza in the KES 2,501–70,000 band: $d = 25$, $f = 0$):

| Days held | Fuliza cost (KES) | Fuliza APR |
| :--- | :--- | :--- |
| 1 | 130 | 474.5% |
| 3 | 190 | 231.2% |
| 7 | 310 | 161.6% |
| 14 | 520 | 135.6% |
| 30 | 1,000 | 121.7% |

---

<!-- [AD_SLOT_INLINE_2] -->

## Why the Cost Surprises People

Fuliza's daily fee looks small, but the **1% access fee plus excise duty** and the daily charge add up. Holding KES 5,000 for a month costs KES 950, or **19% of the amount**. A charge of 19% in one month is the kind of figure people normally see quoted per year.

Many people also assume M-Shwari gets cheaper if they repay early. It does not: the facilitation fee is charged once per loan, so repaying on day 7 costs the same KES 375 as repaying on day 30. Repaying early only improves your future loan limit.

*For context, compare these rates with the Central Bank's current published average commercial lending rate.*
<!-- TODO before publishing: insert the latest CBK average lending rate with its date. Do not publish an uncited comparison figure. -->

---

<!-- [AD_SLOT_INLINE_3] -->

## Decision Rules

### Rule 1: The crossover is about 11 days (for KES 5,000)
Set Fuliza's total cost equal to M-Shwari's flat fee. With $a P = 50$ and $(1 + x) \cdot d = 30$ per day:

$$50 + 30 \cdot D = 375 \implies D = \frac{375 - 50}{30} \approx 10.8 \text{ days}$$

- **Under about 11 days:** Fuliza is cheaper (7 days: KES 260 vs KES 375).
- **Over about 11 days:** M-Shwari is cheaper (30 days: KES 375 vs KES 950), if you qualify and can repay within 30 days. A rollover adds a second facilitation fee.

### Rule 2: Repay Fuliza fast
- The daily fee starts from midnight after you borrow, and balances of KES 1,000 or less get three free days. The 1% access fee always applies.
- Money deposited into M-Pesa repays an outstanding Fuliza balance first, so topping up quickly is the cheapest way to clear it.

### Comparing other lenders
Loan apps usually quote a flat fee for a term of 21 to 30 days. Use the same formula: $\text{APR} = \text{fee \%} \times 365 / \text{days}$. For example, a 10% fee for 21 days is about 173.8% APR. Check each lender's own terms, as fees vary by borrower.

*This article is educational and is not financial advice. Borrow only what you can repay.*

---

## Sources and Last Checked

- Reporting on Safaricom's June 2026 Fuliza daily-fee revision (including the KES 2,501–70,000 band at KES 25 per day and the KES 501–1,000 band at KES 5 per day after three free days)
- Fuliza fee calculator and tariff summary, checked 13 October 2026 (1% access fee, daily fee from midnight, 20% excise on the daily fee)
- Safaricom M-Shwari FAQ (7.5% facilitation fee per 30-day loan, payable once per loan, with a new fee on rollover)
- **Last checked: October 2026. Re-verify the tariff bands before each update.**

---

## Publisher Notes (do not display on the page)

Inject the block below as `<script type="application/ld+json">` in the page head, not as visible text. Add `author`, `datePublished` and `dateModified`, and include the `WebApplication` entry only if the calculator is embedded on the page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Fuliza Charges Explained: What Borrowing KES 5,000 for 7 Days Really Costs (2026)",
      "description": "How much Fuliza really costs: access fee, daily fee and excise duty, compared with M-Shwari for KES 1,000, 5,000 and 10,000 over 1 to 30 days.",
      "inLanguage": "en-KE"
    },
    {
      "@type": "WebApplication",
      "name": "Kenya Mobile Loan Cost and APR Calculator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "KES" }
    }
  ]
}
```

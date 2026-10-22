# Money Market Fund vs Treasury Bills in Kenya: Net Returns After Tax (October 2026)

## The Short Answer

At today's rates, a typical Kenyan money market fund (MMF) earns more after tax than a Treasury bill: about **8.86% net** for an MMF yielding 10.50%, against **7.68% net** for the 364-day Treasury bill. On KES 100,000 over 12 months, that is roughly **KES 1,196 more** in the MMF. But MMF yields change daily and the T-bill rate is locked in when you buy, so the gap is a snapshot, not a promise.

*Data as of 16–19 October 2026. Yields move, so re-check before you decide.*

## Executive Summary & Parameter Definitions

Retail savers in Kenya mainly choose between **Money Market Funds (MMFs)** and **Central Bank of Kenya (CBK) Treasury bills**. The headline rates are not directly comparable, for three reasons:

1. MMFs publish an **effective annual yield (EAR)**, which already includes daily compounding. T-bills quote a simple annualised rate on a discount basis.
2. Both are subject to **15% withholding tax (WHT)**, which for individuals is a final tax. MMF yields are usually quoted after management fees but **before** WHT (for example, Nabo Capital states this on its own site), so check each fund's disclosure.
3. MMF yields float daily, while a T-bill's rate is fixed for its term.

This note converts both to a net-of-tax, 12-month result on **KES 100,000**.

### Rates used (October 2026)

| Instrument | Quoted rate | Source and date | Minimum | Liquidity |
| :--- | :--- | :--- | :--- | :--- |
| **Money market fund (illustrative)** | **10.50% EAR** | Top-10 tracked funds showed about 10.2%–10.8% on 16 Oct 2026; yields vary widely by fund | Varies by fund | Varies by fund, check the redemption time |
| **91-day T-bill** | **8.75%** | CBK auction, 19 Oct 2026 | KES 50,000 | Held to maturity |
| **182-day T-bill** | **8.86%** | CBK auction, 19 Oct 2026 | KES 50,000 | Held to maturity |
| **364-day T-bill** | **9.04%** | CBK auction, 19 Oct 2026 | KES 50,000 | Held to maturity |

---

## The Mathematics

Let $WHT = 0.15$.

### 1. Money market fund: from published EAR to net return

Because the published figure is already an effective annual rate, convert it to a daily rate first, apply tax to the daily interest, then compound:

$$r_{\text{daily}} = (1 + \text{EAR})^{1/365} - 1 \qquad r_{\text{net,daily}} = r_{\text{daily}} \cdot (1 - WHT)$$

$$A_{\text{MMF}} = P \cdot \left(1 + r_{\text{net,daily}}\right)^{365}$$

For $P = 100{,}000$ and $\text{EAR} = 10.50\%$, the net effective yield is **8.86%** and $A_{\text{MMF}} = \text{KES } 108{,}857.58$.

(Do not compound the published rate a second time: it already includes compounding.)

### 2. Treasury bill: discount price and net return

CBK quotes an annualised rate $r$. For a bill with $t$ days to maturity, the price per KES 100 face value is:

$$P_{\text{price}} = \frac{100}{1 + r \cdot t/365}$$

For the 364-day bill at $r = 9.0383\%$ this gives a price of **91.7317**. Withholding tax is charged on the discount (the interest). On a KES 100,000 outlay:

$$I_{\text{gross}} = 100{,}000 \cdot \left(\tfrac{100}{91.7317} - 1\right) = 9{,}013.54 \qquad I_{\text{net}} = I_{\text{gross}} \cdot 0.85 = 7{,}661.51$$

The ending value is **KES 107,661.51**, a net return of 7.66% over 364 days (about **7.68% annualised**).

---

<!-- [AD_SLOT_INLINE_1] -->

## KES 100,000 for 12 Months: Net Results

| Option | Net yield (12 months) | Withholding tax paid | Net profit (KES) | Ending value (KES) |
| :--- | :--- | :--- | :--- | :--- |
| **MMF at 10.50% EAR** | **8.86%** | 1,563.10 | **8,857.58** | **108,857.58** |
| **364-day T-bill (9.04%)** | **7.66%** | 1,352.03 | **7,661.51** | **107,661.51** |
| **182-day T-bill, rolled twice** | **7.65%** | 1,350.24 | **7,651.38** | **107,651.38** |
| **91-day T-bill, rolled four times** | **7.63%** | 1,345.76 | **7,625.99** | **107,625.99** |

*The rolled T-bill rows assume the same rate is available at each rollover, which is not guaranteed.*

**Reading the table:** at these rates, the T-bill curve is nearly flat, so locking up money for a year gains you almost nothing over rolling shorter bills. The MMF's advantage today comes from its higher yield, not from a structural edge.

### How much would the MMF yield have to fall to lose its lead?

Against the 364-day bill's 7.68% net, an MMF breaks even at roughly **9.1% EAR**. A fall of about 1.4 percentage points, well within the range of past MMF yield swings, would erase the gap.

---

<!-- [AD_SLOT_INLINE_2] -->

## What About Infrastructure Bonds and SACCOs?

**Infrastructure bonds (IFBs)** are not a 12-month product, so they are left out of the table above. They are long-dated (for example, bonds reopened in 2025 had maturities of 15 and 19 years and coupons around 12.5%–13%), and selling early exposes you to price changes. Interest on IFBs issued so far has been reported as exempt from withholding tax, but the Finance Bill 2024 proposed a 5% withholding tax on future infrastructure bonds of three years or more. Always check the tax status stated in the specific bond's prospectus before relying on it.

**SACCO returns** are left out too: dividends on shares and interest on deposits can be taxed differently, and payouts are annual and depend on the individual SACCO. Add a sourced example for a specific SACCO before comparing it here.

---

<!-- [AD_SLOT_INLINE_3] -->

## Decision Framework

### 1. Match the product to when you need the money
- **Emergency fund and money you may need within weeks:** an MMF's flexibility matters more than a small yield difference. Check the fund's redemption time and any minimum balance.
- **Money you are sure you will not touch for 3, 6 or 12 months:** a T-bill locks the rate. It is worth comparing against the MMF's current net yield, as in the table above.

### 2. Compare after fees and tax, on the same basis
- Check whether the fund's quoted yield is net of management fees. Most are, so do **not** subtract the fee again.
- Apply the 15% withholding tax to interest (daily for the MMF, on the discount for the T-bill) and compare net annual returns.
- Check that the fund is licensed. The Capital Markets Authority publishes a verification portal for fund managers.

*This article is educational. It is not investment advice, and past yields do not guarantee future returns.*

---

## Sources and Last Checked

- Central Bank of Kenya: Treasury bill auction results dated 19 October 2026 (91-day 8.75%, 182-day 8.86%, 364-day 9.04%)
- Independent MMF yield trackers (for example, Business Radar and Serrari), snapshot of 16 October 2026
- Nabo Capital yield disclosure (net of fees, gross of withholding tax)
- Kenya Revenue Authority: withholding tax rates
- CBK infrastructure bond reopening details (2025) and Finance Bill 2024 reporting for IFB tax treatment
- **Rates last checked: 19 October 2026. Update this section whenever you refresh the numbers.**

---

## Publisher Notes (do not display on the page)

Inject the block below as `<script type="application/ld+json">` in the page head, not as visible text. Add `author`, `datePublished` and `dateModified`, and include the `WebApplication` entry only if the calculator is embedded on the page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "Money Market Fund vs Treasury Bills in Kenya: Net Returns After Tax (October 2026)",
      "description": "Compare Kenyan money market fund and CBK Treasury bill returns after 15% withholding tax, with a KES 100,000 worked example using October 2026 rates.",
      "inLanguage": "en-KE"
    },
    {
      "@type": "WebApplication",
      "name": "Kenya Money Market Fund vs T-Bill Net Return Calculator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0.00", "priceCurrency": "KES" }
    }
  ]
}
```

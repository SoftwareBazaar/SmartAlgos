---
title: "Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)"
description: "When the Sydney, Tokyo, London and New York sessions open in East Africa Time (including daylight-saving shifts), how to size a position in KES, how CMA licensing works, and how KRA taxes trading profits."
slug: /finance/ke/forex-trading-hours-kenya-eat-cma-tax-guide
last_checked: 2026-10-22
---

# Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)

*Last checked: 22 October 2026. This is general information, not financial, legal or tax advice. Leveraged forex and CFD trading can lose you more than you expect, including your whole deposit. Rules and tax rates change, so confirm current requirements with the CMA and KRA.*

## Summary

Kenya (EAT, UTC+3) does not use daylight saving, but London, New York and Sydney do. That means **the session times in EAT move by an hour twice a year**, and a guide with one fixed table is wrong for part of the year. The London–New York overlap is **16:00–20:00 EAT in northern-hemisphere winter** and **15:00–19:00 EAT in summer**. For the few weeks when the UK and US clocks are out of step, it stretches to 15:00–20:00.

On the regulatory side, a forex broker serving Kenyans needs a **CMA licence**, and the broker, not the trader, commits the offence if unlicensed. On tax, trading profits are generally treated as **income taxed at 10% to 35%**, not as capital gains.

## Session times in EAT

Sessions are defined here as 08:00–17:00 local time in Sydney, London and New York, and 09:00–18:00 in Tokyo. Because EAT is fixed, only the daylight-saving shifts move the windows.

| Session | Local hours | EAT (northern-hemisphere winter) | EAT (northern-hemisphere summer) | Main currencies |
| :--- | :--- | :--- | :--- | :--- |
| Sydney | 08:00–17:00 | 00:00–09:00 (Sydney on summer time, Oct–Apr) | 01:00–10:00 (Sydney on winter time, Apr–Oct) | AUD, NZD |
| Tokyo | 09:00–18:00 | 03:00–12:00 | 03:00–12:00 (Japan has no daylight saving) | JPY, AUD, NZD |
| London | 08:00–17:00 | 11:00–20:00 (GMT) | 10:00–19:00 (BST) | EUR, GBP, CHF |
| New York | 08:00–17:00 | 16:00–01:00 (EST) | 15:00–00:00 (EDT) | USD, CAD |
| **London–New York overlap** | | **16:00–20:00** | **15:00–19:00** | EUR/USD, GBP/USD, USD/CAD |

### What applies right now

| Dates in 2026 | London | New York | Overlap in EAT |
| :--- | :--- | :--- | :--- |
| Until Sun 25 Oct | BST, 10:00–19:00 | EDT, 15:00–00:00 | 15:00–19:00 |
| 25 Oct to 1 Nov | GMT, 11:00–20:00 | EDT, 15:00–00:00 | 15:00–20:00 (5 hours) |
| From 1 Nov to March | GMT, 11:00–20:00 | EST, 16:00–01:00 | 16:00–20:00 |

The same mismatch happens again in March, when the US moves its clocks before the UK does. Australia is already on summer time, so Sydney currently opens at 00:00 EAT.

**Weekly open and close:** the forex week opens when New York's Friday close ends, about **00:00–01:00 EAT on Monday**, and closes about **00:00–01:00 EAT on Saturday**, depending on US daylight saving.

## Why the overlap matters

The overlap is usually the most liquid window for EUR/USD and GBP/USD, because both London and New York dealing desks are active. Spreads are often tightest, but how tight depends on your broker and account type, so check your own platform rather than relying on a quoted average.

Major US data releases land inside or just after the overlap. US releases such as Non-Farm Payrolls come at 08:30 New York time, which is **15:30 EAT in summer and 16:30 EAT in winter**. FOMC decisions come at 14:00 New York time, which is **21:00 EAT in summer and 22:00 EAT in winter**. Add an alert for the US daylight-saving change each March and November.

Asian-session hours are not "dead" for every pair. JPY, AUD and NZD pairs are most active during the Tokyo and Sydney sessions.

## The maths

### Pip value in KES

For a pair with USD as the quote currency (EUR/USD, GBP/USD), one pip on a standard lot of 100,000 units is worth USD 10. At an exchange rate of $S$ KES per USD:

$$\text{Pip value (KES)} = 100{,}000 \times 0.0001 \times S = 10 \times S$$

At an illustrative rate of KES 130 per USD, one pip on one standard lot is **KES 1,300**. Use the live rate when you size a trade. The formula does not apply as written to pairs where USD is not the quote currency, such as USD/CAD or USD/JPY. For those, convert the pip value from the quote currency, or use your broker's calculator.

### Position size from a risk limit

To risk $R\%$ of equity $E$ with a stop-loss of $S_{\text{pips}}$:

$$\text{Lots} = \frac{E \times R\%}{S_{\text{pips}} \times \text{Pip value (KES)}}$$

**Example:** KES 500,000 account, 1% risk (KES 5,000), 25-pip stop:

$$\text{Lots} = \frac{500{,}000 \times 0.01}{25 \times 1{,}300} = \frac{5{,}000}{32{,}500} = 0.1538$$

Round down to **0.15 standard lots**. That equals 1.5 mini lots or 15 micro lots. Actual risk on 0.15 lots is 0.15 × 25 × 1,300 = KES 4,875, or 0.975% of the account. Spreads, commissions and slippage add to that risk.

## CMA licensing

The Capital Markets (Online Foreign Exchange Trading) Regulations, 2017 (amended 2023) require anyone carrying on business as an online forex broker or money manager in Kenya to hold a CMA licence. Operating without one is an offence by the operator. The rules protect you as a client, but trading with an unlicensed operator leaves you without those protections.

### Licence categories

| Category | What it does | Minimum paid-up capital | Liquid capital to maintain |
| :--- | :--- | :--- | :--- |
| Dealing online forex broker | Trades as principal and market maker | KES 50,000,000 | KES 30,000,000 or 8% of total liabilities, whichever is higher |
| Non-dealing online forex broker | Links clients to the market for a commission or spread mark-up, with no market making | KES 30,000,000 | KES 30,000,000 or 8% of total liabilities, whichever is higher |
| Money manager | Manages a client's forex portfolio for a fee, through a licensed broker | KES 10,000,000 | KES 5,000,000 or 8% of total liabilities, whichever is higher |

Applicants must be companies incorporated in Kenya and limited by shares.

### What licensed brokers must do

- Hold client funds in a segregated client account at a **bank licensed under the Banking Act**, never mixed with the broker's own money or used for margining, hedging or company assets.
- Reconcile client accounts daily.
- Give each client a written risk disclosure and a signed acknowledgement before opening an account.
- Keep leverage within the cap, currently **up to 400 times** the client's deposit, which the CMA may revise by circular.
- **Not offer currency pairs involving the Kenya shilling, and not offer binary options.**
- Money managers may not receive client money. They only get trading access to funds the client deposits in their own account at the broker.

### Verify before you deposit

1. Check the broker is on the CMA's current list of licensed online forex brokers and that the licensed entity name matches the one on your account agreement.
2. Confirm where client funds are held, and that it is a bank licensed in Kenya.
3. Read the risk disclosure statement before signing.

Many brokers Kenyans use are offshore and not CMA-licensed. That is not an offence by the trader, but you lose CMA-backed protections and recourse.

## KRA tax on trading profits

Kenya has no separate tax category for forex. Profits are generally assessed under the Income Tax Act (Cap 470) as income, not capital gains. Whether your trading counts as a business is a question of fact, so get advice if your activity is large or irregular.

**Individuals:** net trading profit is added to your other income and taxed at progressive annual rates:

| Annual taxable income (KES) | Rate |
| :--- | :--- |
| First 288,000 | 10% |
| 288,001–388,000 | 25% |
| 388,001–6,000,000 | 30% |
| 6,000,001–9,600,000 | 32.5% |
| Above 9,600,000 | 35% |

Resident individuals get **personal relief of KES 2,400 a month (KES 28,800 a year)**, subtracted from the tax due.

**Worked example:** net trading profit of KES 1,000,000, with no other income or reliefs.

- 10% × 288,000 = KES 28,800
- 25% × 100,000 = KES 25,000
- 30% × 612,000 = KES 183,600
- Tax before relief: KES 237,400
- Less personal relief: KES 28,800
- **Tax payable: about KES 208,600**, an effective rate of roughly 21%

**Companies:** resident companies pay 30% corporate tax on taxable profit.

**Deductions and filing:**

- Trading expenses such as internet, VPS or software, commissions and equipment may be deductible if they were incurred wholly for earning the income. Keep invoices and broker statements, and take advice on borderline items such as training.
- Declare the income on your annual return through iTax. The deadline is **30 June** of the following year, and self-employed income can also attract instalment tax during the year.
- Do not call this "PAYE". PAYE is the employer-deduction system for salaries. Trading income is self-assessed.

## Decision rules

### Rule 1: Know your clock, then pick your window

Plan around the overlap that applies this month (see the table above), not a fixed 16:00–20:00. For EUR/USD and GBP/USD, that window and the London morning are usually the most liquid. For JPY, AUD and NZD pairs, the Tokyo and Sydney sessions can offer better activity. Avoid placing new trades in the minutes around major news unless your strategy is built for it.

### Rule 2: Verify the licence, the entity and the bank

Check the CMA list, the legal entity name, and where client money is held, before you deposit any funds.

### Rule 3: Size trades from risk, then keep tax records

Use the position-size formula above, round lots down, and keep monthly broker statements. They support both your risk review and your KRA return.

## Sources and further reading

- [Capital Markets (Online Foreign Exchange Trading) Regulations, 2017 (Kenya Law)](https://new.kenyalaw.org/akn/ke/act/ln/2017/226/eng)
- [Kenya PAYE and income tax bands for 2026 (Teamed)](https://www.teamed.global/country-hiring-guides/kenya/tax-and-payroll)
- [PAYE and personal relief (KRA)](https://kra.go.ke/individual/filing-paying/types-of-taxes/paye)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)",
  "description": "When the Sydney, Tokyo, London and New York sessions open in East Africa Time (including daylight-saving shifts), how to size a position in KES, how CMA licensing works, and how KRA taxes trading profits.",
  "inLanguage": "en-KE",
  "datePublished": "2026-10-22",
  "dateModified": "2026-10-22",
  "author": { "@type": "Organization", "name": "Smart Algos Capital", "url": "https://smartalgosts.com" },
  "publisher": { "@type": "Organization", "name": "Smart Algos Capital", "url": "https://smartalgosts.com" },
  "mainEntityOfPage": "https://smartalgosts.com/finance/ke/forex-trading-hours-kenya-eat-cma-tax-guide"
}
```

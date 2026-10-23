export type FinanceCategory = "Credit" | "Debt" | "Loans" | "Tax" | "Kenya";

export type FinanceNote = {
  slug: string;
  day: number;
  category: FinanceCategory;
  title: string;
  /** Search-friendly H1 for article pages */
  seoTitle: string;
  shortTitle: string;
  /** Plain-language card blurb (one sentence) */
  cardBlurb: string;
  description: string;
  date: string;
  dateISO: string;
  readingMinutes: number;
  stats: { label: string; value: string }[];
  hasCalculator: boolean;
  published: boolean;
  jsonLd: Record<string, unknown>;
  /** When set, article lives at /finance/ke/$slug */
  region?: "ke";
};

const SITE = "https://www.smartalgosts.com";

/** Public path for a note (Kenya notes nest under /finance/ke/). */
export function financeNotePath(note: Pick<FinanceNote, "slug" | "region">): string {
  return note.region === "ke" ? `/finance/ke/${note.slug}` : `/finance/${note.slug}`;
}

export function financeNoteAbsoluteUrl(note: Pick<FinanceNote, "slug" | "region">): string {
  return `${SITE}${financeNotePath(note)}`;
}

export const DAY_01_SLUG = "credit-card-minimum-payment-decay";
export const DAY_02_SLUG = "credit-card-balance-transfer-arbitrage-npv-calculator";
export const DAY_03_SLUG = "velocity-banking-rate-spread-failure-boundaries";
export const DAY_04_SLUG = "student-loan-idr-recertification-arbitrage";

export const KE_NET_SALARY_SLUG = "net-salary-calculator-paye-sha-housing-levy";
export const KE_FULIZA_SLUG = "fuliza-charges-mobile-loan-apr-calculator";
export const KE_MMF_TBILL_SLUG = "money-market-fund-vs-treasury-bills-kenya-net-returns";
export const KE_FOREX_HOURS_SLUG = "forex-trading-hours-kenya-eat-cma-tax-guide";
export const KE_HELB_SLUG = "helb-loan-repayment-penalty-waiver-strategy";
export const KE_QUICKMART_IPO_SLUG = "quickmart-ipo-valuation-and-investor-guide";
export const KE_SACCO_MMF_SLUG = "sacco-vs-money-market-fund-kenya-yield-leverage-calculator";

function orgGraphExtras(url: string, datePublished: string) {
  return {
    url,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: "Smart Algos Quant Desk",
      url: SITE,
    },
    publisher: {
      "@type": "Organization",
      name: "Smart Algos Investment Solution Ltd",
      url: SITE,
    },
  };
}

export const financeNotes: FinanceNote[] = [
  {
    slug: DAY_01_SLUG,
    day: 1,
    category: "Credit",
    title:
      "Paying Only the Minimum on $10,000 at 24.99% APR: 22.7 Years and $19,236 in Interest",
    seoTitle:
      "Paying Only the Minimum on $10,000 at 24.99% APR: 22.7 Years and $19,236 in Interest",
    shortTitle: "Credit card minimum payment decay",
    cardBlurb:
      "Pay only the minimum on $10,000 at 24.99% APR and you may still be paying for 22.7 years — with about $19,236 in interest.",
    description:
      "How long to pay off a $10,000 credit card at 24.99% APR with minimum payments — dynamic decay vs fixed-payment models, with payoff timelines and interest totals.",
    date: "14 Oct 2026",
    dateISO: "2026-10-14",
    readingMinutes: 12,
    stats: [
      { label: "Payoff", value: "22.7 yrs" },
      { label: "Interest", value: "$19,236" },
    ],
    hasCalculator: true,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Paying Only the Minimum on $10,000 at 24.99% APR: 22.7 Years and $19,236 in Interest",
          description:
            "How long to pay off a $10,000 credit card at 24.99% APR with minimum payments — dynamic decay vs fixed-payment models.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_01_SLUG}`, "2026-10-14"),
        },
        {
          "@type": "WebApplication",
          name: "Dynamic Minimum Payment Decay Simulator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
        },
        {
          "@type": "FinancialProduct",
          name: "Revolving Consumer Credit Card Obligation",
          description:
            "Unsecured revolving debt obligation subject to dynamic minimum payment decay algorithms.",
          annualPercentageRate: 24.99,
          interestRate: 24.99,
        },
      ],
    },
  },
  {
    slug: DAY_02_SLUG,
    day: 2,
    category: "Credit",
    title:
      "Is a 0% Balance Transfer Worth It? Fee Drag, Promo Cliffs, and the Break-Even on $15,000",
    seoTitle:
      "Is a 0% Balance Transfer Worth It? Fee Drag, Promo Cliffs, and the Break-Even on $15,000",
    shortTitle: "0% APR balance transfer break-even",
    cardBlurb:
      "A $15,000 balance transfer looks free until the 3–5% fee and the promo cliff hit. Here’s the break-even math.",
    description:
      "0% APR balance transfer calculator for a $15,000 balance — upfront fee drag, 18-month promo cliffs, and NPV break-even rules.",
    date: "15 Oct 2026",
    dateISO: "2026-10-15",
    readingMinutes: 11,
    stats: [
      { label: "Fee on $15k", value: "$600" },
      { label: "Clearance", value: "$867/mo" },
    ],
    hasCalculator: true,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Is a 0% Balance Transfer Worth It? Fee Drag, Promo Cliffs, and the Break-Even on $15,000",
          description:
            "0% APR balance transfer calculator — upfront fee drag, promo cliffs, and NPV break-even on $15,000.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_02_SLUG}`, "2026-10-15"),
        },
        {
          "@type": "WebApplication",
          name: "0% APR Balance Transfer Arbitrage & Fee Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
        },
        {
          "@type": "FinancialProduct",
          name: "0% APR Balance Transfer Credit Card Facility",
          description:
            "Promotional revolving credit facility subject to upfront transfer fee drag and post-introductory rate reset cliffs.",
          annualPercentageRate: 0,
          interestRate: 0,
        },
      ],
    },
  },
  {
    slug: DAY_03_SLUG,
    day: 3,
    category: "Debt",
    title:
      "Velocity Banking vs Paying Extra on Your Mortgage: When a HELOC Chunk Loses Money",
    seoTitle:
      "Velocity Banking vs Paying Extra on Your Mortgage: When a HELOC Chunk Loses Money",
    shortTitle: "Velocity banking rate-spread traps",
    cardBlurb:
      "Routing income through a 9.5% HELOC to chunk a 3.5% mortgage can cost more than it saves — unless surplus cash flow is large enough.",
    description:
      "Velocity banking and HELOC chunking math — average daily balance interest, rate-spread failure, and why a direct extra principal payment often wins.",
    date: "19 Oct 2026",
    dateISO: "2026-10-19",
    readingMinutes: 14,
    stats: [
      { label: "Spread loss", value: "−$8.43/mo" },
      { label: "5-yr edge", value: "+$1,079" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Velocity Banking vs Paying Extra on Your Mortgage: When a HELOC Chunk Loses Money",
          description:
            "When HELOC velocity banking loses to direct mortgage principal payments — ADB accounting and rate-spread failure.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_03_SLUG}`, "2026-10-19"),
        },
        {
          "@type": "WebApplication",
          name: "Velocity Banking & HELOC Chunking Arbitrage Simulator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
        },
        {
          "@type": "FinancialProduct",
          name: "Home Equity Line of Credit (HELOC) Debt Facility",
          description:
            "Revolving second-lien home equity line subject to variable interest rate spreads and average daily balance calculation mechanics.",
          annualPercentageRate: 9.5,
          interestRate: 9.5,
        },
      ],
    },
  },
  {
    slug: DAY_04_SLUG,
    day: 4,
    category: "Loans",
    title:
      "Married Filing Separately vs Jointly for Student Loan IDR: $4,435/Year Net Savings",
    seoTitle:
      "Married Filing Separately vs Jointly for Student Loan IDR: $4,435/Year Net Savings",
    shortTitle: "Student loan IDR filing-status trade-offs",
    cardBlurb:
      "For a $75k federal loan, filing MFS can cut IDR payments enough to net about $4,435/year after the tax penalty — more with the 5% undergrad formula.",
    description:
      "Student loan IDR calculator for married borrowers — MFS vs MFJ discretionary income, tax penalties, and government interest subsidies.",
    date: "21 Oct 2026",
    dateISO: "2026-10-21",
    readingMinutes: 13,
    stats: [
      { label: "Net gain", value: "+$4,435/yr" },
      { label: "Subsidy", value: "$2,544/yr" },
    ],
    hasCalculator: true,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Married Filing Separately vs Jointly for Student Loan IDR: $4,435/Year Net Savings",
          description:
            "Student loan IDR for married borrowers — MFS vs MFJ, tax penalties, and interest subsidies on a $75,000 balance.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_04_SLUG}`, "2026-10-21"),
        },
        {
          "@type": "WebApplication",
          name: "Student Loan IDR & MFS Tax Arbitrage Calculator",
          applicationCategory: "FinanceApplication",
          operatingSystem: "All",
          offers: { "@type": "Offer", price: "0.00", priceCurrency: "USD" },
        },
        {
          "@type": "FinancialProduct",
          name: "Direct Federal Student Loan Facility",
          description:
            "Federal student loan obligation eligible for income-driven repayment formulas and federal interest subsidies.",
          annualPercentageRate: 6.8,
          interestRate: 6.8,
        },
      ],
    },
  },
  {
    slug: KE_NET_SALARY_SLUG,
    day: 5,
    category: "Kenya",
    region: "ke",
    title:
      "Kenya Net Salary Calculator 2026: PAYE, NSSF, SHA and Housing Levy Explained",
    seoTitle:
      "Kenya Net Salary Calculator 2026: PAYE, NSSF, SHA and Housing Levy Explained",
    shortTitle: "Kenya net salary — PAYE, NSSF, SHA",
    cardBlurb:
      "Worked net-pay examples at KES 40k–150k after NSSF Phase 4, uncapped SHA 2.75%, Housing Levy 1.5%, and progressive PAYE.",
    description:
      "Kenya 2026 net salary calculator guide — NSSF Tier I/II caps, SHA/SHIF 2.75%, Housing Levy 1.5%, PAYE brackets, and worked take-home examples.",
    date: "22 Oct 2026",
    dateISO: "2026-10-22",
    readingMinutes: 11,
    stats: [
      { label: "KES 80k net", value: "57,877" },
      { label: "SHA rate", value: "2.75%" },
    ],
    hasCalculator: true,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Kenya Net Salary Calculator 2026: PAYE, NSSF, SHA and Housing Levy Explained",
          description:
            "2026 Kenyan payroll statutory deductions — NSSF, SHA, Housing Levy, and PAYE with worked net salary examples.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_NET_SALARY_SLUG}`, "2026-10-22"),
        },
      ],
    },
  },
  {
    slug: KE_FULIZA_SLUG,
    day: 6,
    category: "Kenya",
    region: "ke",
    title: "Fuliza Charges Explained: What Borrowing KES 5,000 for 7 Days Really Costs (2026)",
    seoTitle: "Fuliza Charges Explained: What Borrowing KES 5,000 for 7 Days Really Costs (2026)",
    shortTitle: "Fuliza vs M-Shwari APR cost",
    cardBlurb:
      "KES 5,000 for 7 days on Fuliza costs about KES 260 (~271% APR annualised). Compare break-even days vs M-Shwari’s 7.5% fee.",
    description:
      "Fuliza 2026 access and daily fees vs M-Shwari — total shilling cost and annualised APR for short-term mobile borrowing in Kenya.",
    date: "22 Oct 2026",
    dateISO: "2026-10-22",
    readingMinutes: 8,
    stats: [
      { label: "7-day cost", value: "KES 260" },
      { label: "Approx APR", value: "~271%" },
    ],
    hasCalculator: true,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Fuliza Charges Explained: What Borrowing KES 5,000 for 7 Days Really Costs (2026)",
          description:
            "Fuliza vs M-Shwari fee math — access fees, daily maintenance, excise, and annualised cost on KES 5,000.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_FULIZA_SLUG}`, "2026-10-22"),
        },
      ],
    },
  },
  {
    slug: KE_MMF_TBILL_SLUG,
    day: 7,
    category: "Kenya",
    region: "ke",
    title: "Money Market Fund vs Treasury Bills in Kenya: Net Returns After Tax (October 2026)",
    seoTitle: "Money Market Fund vs Treasury Bills in Kenya: Net Returns After Tax (October 2026)",
    shortTitle: "MMF vs T-bills after 15% WHT",
    cardBlurb:
      "At October 2026 rates, a 10.50% EAR MMF nets about 8.86% after 15% WHT vs ~7.68% on the 364-day T-bill — a snapshot, not a promise.",
    description:
      "Kenya money market funds vs CBK Treasury bills after 15% withholding tax — net return math on KES 100,000 (October 2026 rates).",
    date: "22 Oct 2026",
    dateISO: "2026-10-22",
    readingMinutes: 9,
    stats: [
      { label: "MMF net", value: "~8.86%" },
      { label: "364d T-bill net", value: "~7.68%" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Money Market Fund vs Treasury Bills in Kenya: Net Returns After Tax (October 2026)",
          description:
            "Compare Kenyan MMF effective yields and CBK T-bill rates after 15% WHT on a KES 100,000 stake.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_MMF_TBILL_SLUG}`, "2026-10-22"),
        },
      ],
    },
  },
  {
    slug: KE_FOREX_HOURS_SLUG,
    day: 8,
    category: "Kenya",
    region: "ke",
    title:
      "Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)",
    seoTitle:
      "Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)",
    shortTitle: "Forex hours in EAT + CMA/tax",
    cardBlurb:
      "London–New York overlap in EAT shifts with daylight saving; plus CMA licensing notes and how KRA generally taxes trading profits.",
    description:
      "Forex session times in East Africa Time including DST shifts, CMA broker licensing, and Kenya tax treatment of trading profits (2026).",
    date: "22 Oct 2026",
    dateISO: "2026-10-22",
    readingMinutes: 10,
    stats: [
      { label: "Winter overlap", value: "16:00–20:00" },
      { label: "Summer overlap", value: "15:00–19:00" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Forex Trading Hours in Kenya Time (EAT): Session Overlaps, CMA Rules and Tax (2026 Guide)",
          description:
            "Sydney, Tokyo, London and New York sessions in EAT, CMA licensing, and Kenya tax notes for forex traders.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_FOREX_HOURS_SLUG}`, "2026-10-22"),
        },
      ],
    },
  },
  {
    slug: KE_HELB_SLUG,
    day: 9,
    category: "Kenya",
    region: "ke",
    title:
      "HELB Loan Repayment, KES 5,000 Penalties and the 80% Waiver: What You Will Actually Owe (2026 Guide)",
    seoTitle:
      "HELB Loan Repayment, KES 5,000 Penalties and the 80% Waiver: What You Will Actually Owe (2026 Guide)",
    shortTitle: "HELB penalties & 80% waiver math",
    cardBlurb:
      "On a KES 120,000 balance, 24 months of default penalties can add ~KES 120,000; an 80% penalty waiver saves about KES 96,000 — interest still owed.",
    description:
      "HELB 4% reducing-balance interest, KES 5,000 monthly default penalties, and the current 80% penalty waiver — worked repayment paths (2026).",
    date: "22 Oct 2026",
    dateISO: "2026-10-22",
    readingMinutes: 11,
    stats: [
      { label: "24-mo stack", value: "~KES 258k" },
      { label: "80% waiver save", value: "~KES 96k" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "HELB Loan Repayment, KES 5,000 Penalties and the 80% Waiver: What You Will Actually Owe (2026 Guide)",
          description:
            "HELB interest, ledger fees, monthly default penalties, and 80% penalty waiver savings on a KES 120,000 loan.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_HELB_SLUG}`, "2026-10-22"),
        },
      ],
    },
  },
  {
    slug: KE_QUICKMART_IPO_SLUG,
    day: 10,
    category: "Kenya",
    region: "ke",
    title: "Quickmart IPO Kenya: Offer Price, Valuation Multiples and Investor Checklist (October 2026)",
    seoTitle: "Quickmart IPO Kenya: Offer Price, Valuation Multiples and Investor Checklist (October 2026)",
    shortTitle: "Quickmart IPO valuation checklist",
    cardBlurb:
      "KES 7.50 offer, KES 30B implied equity, company raises KES 0 — secondary sale math, ~13× forward P/E, and a retail checklist before 30 Oct close.",
    description:
      "Quick Mart PLC NSE offer for sale — KES 7.50 price, KES 15B offer size, trailing vs forward P/E, dividend yield caveats, and retail application checklist (IM Oct 2026).",
    date: "23 Oct 2026",
    dateISO: "2026-10-23",
    readingMinutes: 12,
    stats: [
      { label: "Offer price", value: "KES 7.50" },
      { label: "Fwd P/E", value: "~12.9×" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Quickmart IPO Kenya: Offer Price, Valuation Multiples and Investor Checklist (October 2026)",
          description:
            "Secondary offer for sale of Quick Mart PLC shares — valuation multiples, dividend yield caveats, and retail checklist from the October 2026 IM.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_QUICKMART_IPO_SLUG}`, "2026-10-23"),
        },
      ],
    },
  },
  {
    slug: KE_SACCO_MMF_SLUG,
    day: 11,
    category: "Kenya",
    region: "ke",
    title: "SACCO vs Money Market Fund in Kenya: Yield, Tax and Borrowing Leverage (2026)",
    seoTitle: "SACCO vs Money Market Fund in Kenya: Yield, Tax and Borrowing Leverage (2026)",
    shortTitle: "SACCO vs MMF — yield & leverage",
    cardBlurb:
      "MMF ~8.9% net vs unleveraged SACCO ~9.4% with correct 5%/15% tax split — and why ‘flat-rate’ loan arbitrage math misleads.",
    description:
      "Kenya DT-SACCO vs money market fund comparison — after-tax yields, liquidity, and a like-for-like test for 3× borrowing leverage (2026).",
    date: "23 Oct 2026",
    dateISO: "2026-10-23",
    readingMinutes: 11,
    stats: [
      { label: "MMF net", value: "~8.9%" },
      { label: "SACCO net*", value: "~9.4%" },
    ],
    hasCalculator: false,
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline: "SACCO vs Money Market Fund in Kenya: Yield, Tax and Borrowing Leverage (2026)",
          description:
            "Compare Kenyan MMF and DT-SACCO after-tax yields, liquidity, and borrowing leverage with correct withholding-tax treatment.",
          inLanguage: "en-KE",
          ...orgGraphExtras(`${SITE}/finance/ke/${KE_SACCO_MMF_SLUG}`, "2026-10-23"),
        },
      ],
    },
  },
];

export const FINANCE_CATEGORIES: Array<FinanceCategory | "All"> = [
  "All",
  "Credit",
  "Debt",
  "Loans",
  "Tax",
  "Kenya",
];

export function getFinanceNoteBySlug(slug: string): FinanceNote | undefined {
  return financeNotes.find((note) => note.slug === slug);
}

export function listPublishedFinanceNotes(): FinanceNote[] {
  return financeNotes.filter((note) => note.published).sort((a, b) => b.day - a.day);
}

export function listRelatedFinanceNotes(slug: string, limit = 3): FinanceNote[] {
  const current = getFinanceNoteBySlug(slug);
  const published = listPublishedFinanceNotes().filter((n) => n.slug !== slug);
  if (!current) return published.slice(0, limit);
  const same = published.filter((n) => n.category === current.category);
  const rest = published.filter((n) => n.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

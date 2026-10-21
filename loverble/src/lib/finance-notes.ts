export type FinanceCategory = "Credit" | "Debt" | "Loans" | "Tax";

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
};

const SITE = "https://www.smartalgosts.com";

export const DAY_01_SLUG = "credit-card-minimum-payment-decay";
export const DAY_02_SLUG = "credit-card-balance-transfer-arbitrage-npv-calculator";
export const DAY_03_SLUG = "velocity-banking-rate-spread-failure-boundaries";
export const DAY_04_SLUG = "student-loan-idr-recertification-arbitrage";

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
];

export const FINANCE_CATEGORIES: Array<FinanceCategory | "All"> = [
  "All",
  "Credit",
  "Debt",
  "Loans",
  "Tax",
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

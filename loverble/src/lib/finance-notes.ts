export type FinanceNote = {
  slug: string;
  day: number;
  title: string;
  shortTitle: string;
  description: string;
  date: string;
  published: boolean;
  jsonLd: Record<string, unknown>;
};

const SITE = "https://www.smartalgosts.com";

export const DAY_01_SLUG = "credit-card-minimum-payment-decay";
export const DAY_02_SLUG = "credit-card-balance-transfer-arbitrage-npv-calculator";

function orgGraphExtras(url: string, datePublished: string) {
  return {
    url,
    datePublished,
    author: {
      "@type": "Organization",
      name: "Smart Algos Capital",
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
    title:
      "Credit Card Minimum Payment Decay — Dynamic Recurrence Engineering vs. Commercial Static Assumptions",
    shortTitle: "Credit card minimum payment decay",
    description:
      "A quantitative mathematical proof demonstrating how dynamic credit card minimum payment decay extends $10,000 of 24.99% APR debt to a 22.7-year payoff timeline and $19,236 in cumulative interest.",
    date: "Oct 2026",
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Day 1: Credit Card Minimum Payment Decay — Dynamic Recurrence Engineering vs. Commercial Static Assumptions",
          description:
            "A quantitative mathematical proof demonstrating how dynamic credit card minimum payment decay extends $10,000 of 24.99% APR debt to a 22.7-year payoff timeline and $19,236 in cumulative interest.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_01_SLUG}`, "2026-10-19"),
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
          monthlyMinimumRepaymentAmount: {
            "@type": "MonetaryAmount",
            currency: "USD",
            value: "308.25",
          },
        },
      ],
    },
  },
  {
    slug: DAY_02_SLUG,
    day: 2,
    title:
      "0% APR Balance Transfer Arbitrage — NPV Threshold Equations & Upfront Fee Drag Mechanics",
    shortTitle: "0% APR balance transfer arbitrage",
    description:
      "A quantitative mathematical analysis of 0% APR balance transfer offers, evaluating upfront fee drag, promotional cliff shocks, and exact NPV threshold equations across $15,000 credit liabilities.",
    date: "Oct 2026",
    published: true,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "TechArticle",
          headline:
            "Day 2: 0% APR Balance Transfer Arbitrage — Net Present Value (NPV) Threshold Equations & Upfront Fee Drag Mechanics",
          description:
            "A quantitative mathematical analysis of 0% APR balance transfer offers, evaluating upfront fee drag, promotional cliff shocks, and exact NPV threshold equations across $15,000 credit liabilities.",
          inLanguage: "en-US",
          ...orgGraphExtras(`${SITE}/finance/${DAY_02_SLUG}`, "2026-10-19"),
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
          feesAndCommissionsSpecification: "4.0% upfront balance transfer fee.",
        },
      ],
    },
  },
];

export function getFinanceNoteBySlug(slug: string): FinanceNote | undefined {
  return financeNotes.find((note) => note.slug === slug);
}

export function listPublishedFinanceNotes(): FinanceNote[] {
  return financeNotes.filter((note) => note.published).sort((a, b) => a.day - b.day);
}

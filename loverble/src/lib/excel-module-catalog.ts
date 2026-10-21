export type ExcelLevel = "Intermediate" | "Advanced";

export type ExcelModuleProduct = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  filename: string;
  priceUsd: number;
  listValueUsd: number;
  summary: string;
  description: string;
  features: string[];
  level: ExcelLevel;
  sheetCount: number;
  chartCount: number;
  approxSizeMb: string;
  previewLabel: string;
  /** Module IDs unlocked on purchase (self for singles; all four for bundle). */
  unlocks: string[];
  isBundle?: boolean;
};

const MODULE_IDS = {
  portfolio: "portfolio-monte-carlo-risk-suite",
  options: "multi-leg-options-greeks-visualizer",
  fixedIncome: "fixed-income-yield-curve-duration",
  multifactor: "multi-factor-quant-stock-selector",
  bundle: "quantitative-finance-master-bundle",
} as const;

export const EXCEL_MODULE_PRODUCTS: ExcelModuleProduct[] = [
  {
    id: MODULE_IDS.portfolio,
    slug: MODULE_IDS.portfolio,
    title: "Portfolio Optimization & Monte Carlo Risk Suite",
    shortTitle: "Portfolio & Monte Carlo Risk",
    filename: "Portfolio_Optimization_Monte_Carlo_Risk_Suite.xlsx",
    priceUsd: 49,
    listValueUsd: 49,
    summary:
      "Markowitz mean-variance weights, covariance, Sharpe frontier, plus an illustrative NORM.INV simulation for VaR/CVaR and a CAPM performance sheet.",
    description:
      "Build optimal portfolios from your own return inputs: covariance matrix, efficient frontier, and Sharpe-max weights. An illustrative Monte Carlo sheet runs configurable NORM.INV trials (default 500; raise if your machine allows) so you can see how sample size affects 95% VaR and Expected Shortfall. Includes a CAPM sheet with Beta, Jensen’s Alpha, and drawdown charts using trade-log friction assumptions you control.",
    features: [
      "Markowitz mean-variance: weights, covariance, Sharpe-max portfolio",
      "Illustrative Monte Carlo sheet (configurable trials via NORM.INV)",
      "CAPM sheet: Beta, Alpha, drawdowns with optional slippage/commission",
    ],
    level: "Advanced",
    sheetCount: 8,
    chartCount: 6,
    approxSizeMb: "~1.2 MB",
    previewLabel: "Efficient frontier + VaR panel",
    unlocks: [MODULE_IDS.portfolio],
  },
  {
    id: MODULE_IDS.options,
    slug: MODULE_IDS.options,
    title: "Multi-Leg Options Strategy & Greeks Visualizer",
    shortTitle: "Options & Greeks Visualizer",
    filename: "Multi_Leg_Options_Strategy_Greeks_Visualizer.xlsx",
    priceUsd: 29,
    listValueUsd: 29,
    summary:
      "Black-Scholes-Merton pricing with dividend yield, up to four legs, aggregate Greeks, payoff curves, and a DTE/vol heatmap.",
    description:
      "Price calls and puts with continuous dividend yield (q) and risk-free rate (r). Configure spreads, straddles, strangles, and iron condors (up to four legs) and see aggregate Delta, Gamma, Vega, and Theta. Compare T+0 mark-to-market vs expiration P&L and explore a 2D DTE/volatility scenario matrix.",
    features: [
      "Black-Scholes-Merton with continuous dividend yield (q)",
      "Up to 4 legs: spreads, straddles, strangles, iron condors",
      "Payoff curves + DTE/volatility heatmap for scenario P&L",
    ],
    level: "Intermediate",
    sheetCount: 6,
    chartCount: 5,
    approxSizeMb: "~900 KB",
    previewLabel: "Payoff curve + vol heatmap",
    unlocks: [MODULE_IDS.options],
  },
  {
    id: MODULE_IDS.fixedIncome,
    slug: MODULE_IDS.fixedIncome,
    title: "Fixed Income, Yield Curve & Duration Risk Dashboard",
    shortTitle: "Fixed Income & Yield Curve",
    filename: "Fixed_Income_Yield_Curve_Duration_Dashboard.xlsx",
    priceUsd: 39,
    listValueUsd: 39,
    summary:
      "11-tenor Treasury-style curve (manual inputs), duration/convexity, rate-shock matrix, and LDI cash-flow matching.",
    description:
      "Enter an 11-tenor par/coupon curve (1M–30Y); the workbook bootstraps spots, 1-year forwards, and discount factors. Measure price sensitivity with modified duration and convexity, run parallel and non-parallel rate shocks, and match a multi-year liability cash-flow schedule. Curve inputs are manual — you paste or type updates; there is no live market feed.",
    features: [
      "11-tenor curve: spots, forwards, discount factors (manual inputs)",
      "Modified duration + convexity with rate-shock matrix",
      "Liability cash-flow matching / LDI-style waterfall sheet",
    ],
    level: "Advanced",
    sheetCount: 7,
    chartCount: 5,
    approxSizeMb: "~1.0 MB",
    previewLabel: "Yield curve + shock matrix",
    unlocks: [MODULE_IDS.fixedIncome],
  },
  {
    id: MODULE_IDS.multifactor,
    slug: MODULE_IDS.multifactor,
    title: "Multi-Factor Quant Stock Selector",
    shortTitle: "Multi-Factor Stock Selector",
    filename: "Multi_Factor_Quant_Stock_Selector.xlsx",
    priceUsd: 49,
    listValueUsd: 49,
    summary:
      "Cross-sectional z-scores for Value, Momentum, Quality, and Low Vol with style sliders, top-quintile picks, and a 12-month illustrative walk-through.",
    description:
      "Paste a stock universe with factor inputs; the model standardizes Value, Momentum, Quality, and Low Volatility via cross-sectional z-scores. Weight styles with sliders, extract top-quintile names, and view a radar-style tilt chart. A 12-month monthly-rebalance sheet is an illustrative walk-through for learning the process — not a statistically powered backtest.",
    features: [
      "Cross-sectional z-scores across four style factors",
      "Style weight sliders + top-quintile conviction list",
      "Radar tilt chart + 12-month illustrative rebalance walk-through",
    ],
    level: "Intermediate",
    sheetCount: 7,
    chartCount: 4,
    approxSizeMb: "~1.1 MB",
    previewLabel: "Factor radar + quintile table",
    unlocks: [MODULE_IDS.multifactor],
  },
  {
    id: MODULE_IDS.bundle,
    slug: MODULE_IDS.bundle,
    title: "Quantitative Finance Master Bundle",
    shortTitle: "Master Bundle (all 4)",
    filename: "Quantitative_Finance_Master_Bundle.zip",
    priceUsd: 129,
    listValueUsd: 166,
    summary:
      "All four Excel workbooks — portfolio risk, options Greeks, fixed income, and multi-factor selection — plus four Quick-Start PDFs.",
    description:
      "One purchase unlocks every module: Markowitz/Monte Carlo risk, multi-leg options & Greeks, yield-curve/duration, and multi-factor stock selection. No VBA macros — formulas stay readable (blue inputs, black formulas, green cross-sheet links). Includes four Quick-Start PDFs (one per workbook). Built for analysts, CFA candidates, and serious retail quants who want transparent models they can audit.",
    features: [
      "All four .xlsx modules unlocked after one Paystack payment",
      "No macros — opens on Windows and Mac without security prompts",
      "Blue inputs / black formulas / green links (banking colour convention)",
      "Four Quick-Start PDFs (one guide per workbook)",
    ],
    level: "Advanced",
    sheetCount: 28,
    chartCount: 20,
    approxSizeMb: "~4.5 MB",
    previewLabel: "Full suite dashboard collage",
    unlocks: [
      MODULE_IDS.portfolio,
      MODULE_IDS.options,
      MODULE_IDS.fixedIncome,
      MODULE_IDS.multifactor,
    ],
    isBundle: true,
  },
];

export const STORE_FAQ: { q: string; a: string }[] = [
  {
    q: "Which Excel versions work?",
    a: "Designed for Microsoft Excel for Microsoft 365 and Excel 2021/2019 on Windows and Mac. Workbooks use standard formulas (MMULT, NORM.INV, SUMPRODUCT, RANK, IFERROR). Dynamic-array habits help but LET/LAMBDA are not required. Not guaranteed in Google Sheets or LibreOffice.",
  },
  {
    q: "Where does the data come from?",
    a: "You supply inputs. The Treasury-style curve and stock universes are manual entry or paste — there is no live market data feed. Update rates and prices when you need a fresh run.",
  },
  {
    q: "How do I get the files after paying?",
    a: "Paystack emails a receipt; we also email a portal download link and unlock the files under My downloads (client portal). Keep your purchase email handy. No account is required before checkout — create/sign in to the portal with the same email to re-download later.",
  },
  {
    q: "What’s the license?",
    a: "Single-user license for personal or internal business use. You may not resell, redistribute, or publish the workbooks as a product. Educational and research use is fine; they are not regulated advice tools.",
  },
  {
    q: "Refunds and support?",
    a: "If a file won’t open in a supported Excel version, contact us within 14 days with your Paystack reference and we’ll refund or replace. Formula questions for setup issues are answered by email; we don’t provide custom consulting inside the purchase price.",
  },
  {
    q: "Do I get updates?",
    a: "Minor bug-fix versions of the same SKU are free to re-download from your portal for 12 months after purchase. Major new editions may be sold separately and will be noted on the product page.",
  },
  {
    q: "Who is this for — and who isn’t it for?",
    a: "For analysts, CFA candidates, students, and retail quants who want transparent Excel models. Not a substitute for a risk system, OMS, or licensed advisory software — and not for anyone who needs live Bloomberg/Refinitiv feeds out of the box.",
  },
];

export const FREE_SAMPLE = {
  id: "black-scholes-sample",
  title: "Free sample: single-name Black-Scholes calculator",
  description:
    "A stripped-down, one-sheet European call/put pricer with Greeks — no macros. Enter email to unlock the download link.",
  filename: "SmartAlgo_BlackScholes_Sample.xlsx",
};

export function listExcelStoreProducts(): ExcelModuleProduct[] {
  return EXCEL_MODULE_PRODUCTS;
}

export function listExcelModulesOnly(): ExcelModuleProduct[] {
  return EXCEL_MODULE_PRODUCTS.filter((p) => !p.isBundle);
}

export function getExcelModuleProduct(idOrSlug: string): ExcelModuleProduct | undefined {
  const key = (idOrSlug || "").trim();
  if (!key) return undefined;
  return EXCEL_MODULE_PRODUCTS.find((p) => p.id === key || p.slug === key);
}

export function getExcelModuleByUnlockId(moduleId: string): ExcelModuleProduct | undefined {
  return listExcelModulesOnly().find((p) => p.id === moduleId);
}

export function bundleSavingsUsd(product: ExcelModuleProduct) {
  return Math.max(0, product.listValueUsd - product.priceUsd);
}

export function excelProductJsonLd(product: ExcelModuleProduct) {
  const SITE = "https://www.smartalgosts.com";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "Smart Algo STS" },
    category: "Quantitative Finance Software",
    offers: {
      "@type": "Offer",
      url: `${SITE}/store/${product.slug}`,
      priceCurrency: "USD",
      price: product.priceUsd.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Smart Algo STS", url: SITE },
    },
  };
}

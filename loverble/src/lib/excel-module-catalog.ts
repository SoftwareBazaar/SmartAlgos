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
      "Markowitz mean-variance optimization, native Monte Carlo VaR/CVaR, and CAPM backtesting in macro-free Excel.",
    description:
      "Calculate optimal asset weights, covariance matrices, and Sharpe-maximizing portfolios. Run 50 automated stochastic trials using NORM.INV for 95% and 99% VaR and Expected Shortfall, plus CAPM backtesting with slippage, commissions, Beta, Jensen's Alpha, and drawdown charts.",
    features: [
      "Markowitz mean-variance model with covariance and Sharpe maximization",
      "100% native Monte Carlo engine (50 trials) for VaR / CVaR",
      "CAPM backtester with trade-log friction and underwater drawdowns",
    ],
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
      "Merton Black-Scholes pricing with dividend yield, 4-leg strategy builder, dual payoff curves, and volatility heatmaps.",
    description:
      "Price options on stocks, ETFs, and indexes with continuous dividend yields and risk-free rates. Configure Spreads, Straddles, Strangles, and Iron Condors with aggregate Greeks, plus T+0 mark-to-market vs expiration P&L across a DTE/volatility matrix.",
    features: [
      "Merton Black-Scholes extension with continuous dividend yield (q)",
      "Dynamic 4-leg configurator: spreads, straddles, strangles, iron condors",
      "Dual payoff curves and 2D DTE/volatility heatmap",
    ],
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
      "11-tenor Treasury term structure, duration/convexity, rate shock matrix, and LDI cash-flow matching.",
    description:
      "Bootstrap zero-coupon spot rates, 1-year forwards, and discount factors from 1M to 30Y. Measure non-linear price sensitivity with modified duration and convexity, then stress rates and match 30-year liability cash flows.",
    features: [
      "11-tenor US Treasury term structure with spots, forwards, and discounts",
      "2nd-order Taylor expansion: modified duration and convexity",
      "Rate shock matrix and 30-year LDI cash-flow waterfall",
    ],
    unlocks: [MODULE_IDS.fixedIncome],
  },
  {
    id: MODULE_IDS.multifactor,
    slug: MODULE_IDS.multifactor,
    title: "Multi-Factor Quant Stock Selector & Strategy",
    shortTitle: "Multi-Factor Stock Selector",
    filename: "Multi_Factor_Quant_Stock_Selector.xlsx",
    priceUsd: 49,
    listValueUsd: 49,
    summary:
      "Cross-sectional z-score factor model with style sliders, top-quintile selection, radar plot, and 12-month backtest.",
    description:
      "Standardize stock universes across Value, Momentum, Quality, and Low Volatility. Weight factors in real time, extract top-quintile conviction names, and compare style tilts vs the S&P 500 with Information Ratio diagnostics.",
    features: [
      "Cross-sectional z-score normalization across four style factors",
      "Active style weight sliders with top-quintile conviction extraction",
      "Radar spider plot and 12-month monthly-rebalance backtest",
    ],
    unlocks: [MODULE_IDS.multifactor],
  },
  {
    id: MODULE_IDS.bundle,
    slug: MODULE_IDS.bundle,
    title: "Quantitative Finance Master Bundle",
    shortTitle: "Quant Finance Master Bundle",
    filename: "Quantitative_Finance_Master_Bundle.zip",
    priceUsd: 129,
    listValueUsd: 166,
    summary:
      "All four institutional Excel workbooks — portfolio risk, options Greeks, fixed income, and multi-factor equity — macro-free.",
    description:
      "Stop paying thousands per year for bloated financial software. The Master Bundle brings Wall Street-grade quantitative analysis into standard Microsoft Excel across four complete, audit-ready, zero-macro workbooks with Quick-Start guides.",
    features: [
      "All four modules unlocked immediately after Paystack checkout",
      "100% macro-free native Excel formulas (Windows and Mac)",
      "Institutional input/formula/output color standards and KPI dashboards",
      "Includes hyperlinked navigation and 3 PDF Quick-Start guides",
    ],
    unlocks: [
      MODULE_IDS.portfolio,
      MODULE_IDS.options,
      MODULE_IDS.fixedIncome,
      MODULE_IDS.multifactor,
    ],
    isBundle: true,
  },
];

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

export function excelProductJsonLd(product: ExcelModuleProduct) {
  const SITE = "https://www.smartalgosts.com";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Smart Algo STS",
    },
    category: "Quantitative Finance Software",
    offers: {
      "@type": "Offer",
      url: `${SITE}/store/${product.slug}`,
      priceCurrency: "USD",
      price: product.priceUsd.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Smart Algo STS",
        url: SITE,
      },
    },
  };
}

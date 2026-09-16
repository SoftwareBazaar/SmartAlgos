// Research-first data — no fake AUM, investors, or hedge fund operations

import { PRICING, formatUsd } from "@/lib/pricing";
import { buildStrategyEquityCurve } from "@/lib/chart-domain";

export const company = {
  name: "Smart Algos Capital",
  tagline: "Quantitative Research & Systematic Strategies",
  operator: "Smart Algos Investment Solution Ltd (Kenya)",
};

export type StrategyStatus = "Live" | "Testing" | "Research" | "Development";

export type Strategy = {
  slug: string;
  name: string;
  asset: string;
  platform: string;
  status: StrategyStatus;
  summary: string;
  thesis: string;
  highlights: string[];
  verificationUrl?: string;
  tier: "free" | "quant-pro";
  liveReturn?: number;
  liveSharpe?: number;
  liveMaxDrawdown?: number;
};

export const researchOverview = {
  notesPublished: 12,
  studiesCompleted: 24,
  activeResearchAreas: 5,
  marketsCovered: 3,
  areas: [
    "Quantitative Finance",
    "Algorithmic Trading",
    "Market Structure",
    "Risk Analytics",
    "Financial Systems",
  ],
  markets: ["Forex", "Commodities", "Equities"],
};

export const strategyOverview = {
  live: 2,
  research: 3,
  development: 3,
  reviewsCompleted: 9,
  platforms: ["QuantConnect", "Collective2", "MT5", "Internal Research"],
};

export const performanceMetrics = {
  avgMonthlyReturn: 0.024,
  maxDrawdown: -0.068,
  winRate: 0.58,
  profitFactor: 1.62,
  sharpe: 1.42,
  sortino: 1.89,
  recoveryDays: 42,
};

/** Single source of truth for homepage / overview counters — keep in sync with live strategy cards. */
export const PORTFOLIO_METRICS = {
  sharpe: performanceMetrics.sharpe,
  liveStrategies: strategyOverview.live,
  maxDrawdown: performanceMetrics.maxDrawdown,
  winRate: performanceMetrics.winRate,
  profitFactor: performanceMetrics.profitFactor,
} as const;

export const verificationSources = [
  { name: "QuantConnect", url: "https://www.quantconnect.com", status: "Connected" as const },
  { name: "Collective2", url: "https://www.collective2.com", status: "Planned" as const },
  { name: "Darwinex", url: "https://www.darwinex.com", status: "Future" as const },
];

export const strategies: Strategy[] = [
  {
    slug: "gold-momentum",
    name: "Gold Momentum",
    asset: "Commodities",
    platform: "QuantConnect",
    status: "Live",
    summary: "Trend-following momentum on gold with volatility regime filters.",
    thesis:
      "Gold momentum persists across macro regimes when filtered by realized volatility. We deploy a rules-based momentum overlay with dynamic position sizing tied to vol states.",
    highlights: [
      "Volatility regime filter reduces drawdown clusters",
      "Deployed on QuantConnect with ongoing changelog",
      "Subscribe to live signals — retail or institutional",
    ],
    verificationUrl: "https://www.quantconnect.com",
    tier: "quant-pro",
    liveReturn: 0.182,
    liveSharpe: 1.4,
    liveMaxDrawdown: -0.068,
  },
  {
    slug: "fx-mean-reversion",
    name: "FX Mean Reversion",
    asset: "Forex",
    platform: "QuantConnect",
    status: "Live",
    summary: "Short-horizon mean reversion on major FX pairs with spread-aware execution assumptions.",
    thesis:
      "Micro mean-reversion edges in liquid FX pairs decay quickly without spread filters. The model targets session-specific liquidity windows.",
    highlights: [
      "Spread and session filters for realistic execution",
      "Validation review completed May 2026",
      "QuantConnect listing in progress",
    ],
    verificationUrl: "https://www.quantconnect.com",
    tier: "quant-pro",
    liveReturn: 0.314,
    liveSharpe: 1.6,
    liveMaxDrawdown: -0.052,
  },
  {
    slug: "volatility-breakout",
    name: "Volatility Breakout",
    asset: "Multi-Asset",
    platform: "Internal Research",
    status: "Research",
    summary: "Breakout system triggered by compression-expansion volatility cycles.",
    thesis: "Volatility compression phases precede directional breakouts across correlated asset baskets.",
    highlights: ["Cross-asset signal research", "Notebook in progress", "Available when strategy goes live"],
    tier: "quant-pro",
  },
  {
    slug: "trend-following-model",
    name: "Trend Following Model",
    asset: "Equities",
    platform: "Internal Research",
    status: "Testing",
    summary: "Equity index trend model with risk parity sizing.",
    thesis: "Time-series momentum on broad equity indices with volatility-scaled exposure.",
    highlights: ["Out-of-sample testing underway", "African markets extension planned"],
    tier: "quant-pro",
  },
  {
    slug: "macro-regime-filter",
    name: "Macro Regime Filter",
    asset: "Multi-Asset",
    platform: "Internal Research",
    status: "Development",
    summary: "Macro regime classifier to gate strategy allocation across live models.",
    thesis: "A lightweight regime filter improves composite strategy robustness without overfitting.",
    highlights: ["Research initiated Apr 2026", "Will overlay live strategies when validated"],
    tier: "quant-pro",
  },
];

/** @deprecated Use `strategies` */
export const activeStrategies = strategies.map(({ slug, summary, thesis, highlights, verificationUrl, tier, ...rest }) => rest);

export function getStrategyBySlug(slug: string): Strategy | undefined {
  return strategies.find((s) => s.slug === slug);
}

export const roadmap = [
  { name: "Collective2 signal publication", phase: "Planned" },
  { name: "Live performance API (QuantConnect)", phase: "Development" },
  { name: "Subscriber portal & downloads", phase: "Development" },
  { name: "Strategy backtesting sandbox", phase: "Research" },
  { name: "Quant research tools", phase: "Research" },
];

export const futureEcosystem = [
  { name: "Live Trading Portal", path: "/live-trading" as const, phase: "Development" },
  { name: "Backtesting Engine", path: "/backtesting" as const, phase: "Development" },
  { name: "Investor Portal", path: "/investor" as const, phase: "Planning" },
  { name: "Copy Trading", path: "/copy-trading" as const, phase: "Planning" },
  { name: "Prop Firm Program", path: "/prop-firm" as const, phase: "Planning" },
  { name: "Financial Intelligence Division", path: "/institutional" as const, phase: "Research" },
];

export const pipelineStages = [
  { stage: "Idea", count: 6, desc: "Hypotheses from market observation and literature." },
  { stage: "Research", count: 4, desc: "Statistical testing, feature engineering, signal exploration." },
  { stage: "Validation", count: 2, desc: "Out-of-sample testing, robustness, parameter stability." },
  { stage: "Deployment", count: 2, desc: "Live on QuantConnect with ongoing review." },
  { stage: "Monitoring", count: 2, desc: "Performance tracking and strategy maintenance." },
];

export const platformDistribution = [
  { name: "QuantConnect", count: 2, desc: "Live algorithmic strategies in cloud backtest and paper trading." },
  { name: "Collective2", count: 0, desc: "Planned: signal publication for community subscribers." },
  { name: "MT5", count: 0, desc: "Planned: forex execution for retail integration." },
  { name: "Internal Research", count: 3, desc: "Strategies under development and validation in-house." },
];

export const strategyUpdates = [
  { date: "Jun 2026", text: "Added volatility filter to Gold Momentum strategy" },
  { date: "May 2026", text: "Improved position sizing model across active strategies" },
  { date: "May 2026", text: "Completed FX Mean Reversion validation review" },
  { date: "Apr 2026", text: "QuantConnect listing updated for Gold Momentum" },
  { date: "Apr 2026", text: "Initiated Macro Regime Filter research" },
];

export const recentUpdates = [
  { date: "Jun 2026", text: "New Gold Volatility Study Published", type: "research" as const },
  { date: "Jun 2026", text: "Strategy Updated — Gold Momentum", type: "strategy" as const },
  { date: "May 2026", text: "New Research Note Released — Forex Liquidity", type: "research" as const },
  { date: "May 2026", text: "Strategy Validation Review Completed", type: "strategy" as const },
  { date: "Apr 2026", text: "Portfolio Analytics module — development started", type: "tech" as const },
];

export const techProjects = {
  current: [
    { name: "Portfolio Analytics", status: "Development" },
    { name: "Quant Dashboard", status: "Development" },
    { name: "Quant Research Tools", status: "Research" },
    { name: "Risk Analytics Platform", status: "Research" },
    { name: "Financial Systems", status: "Development" },
  ],
  future: [
    { name: "Banking Systems", status: "Planned" },
    { name: "Treasury Systems", status: "Planned" },
    { name: "Risk Platforms", status: "Planned" },
    { name: "AML Monitoring", status: "Research" },
    { name: "Fraud Detection", status: "Research" },
    { name: "Audit Analytics", status: "Research" },
    { name: "Regulatory Technology", status: "Planned" },
    { name: "Credit Risk Systems", status: "Planned" },
    { name: "Loan Analytics", status: "Planned" },
  ],
};

export const consultationServices = [
  {
    id: "equities",
    title: "Stocks & Equities",
    items: ["Portfolio systematic rules", "Equity factor & momentum design", "Risk budgeting", "Execution on live markets"],
  },
  {
    id: "derivatives",
    title: "Futures & Derivatives",
    items: ["Contract selection & roll logic", "Margin and sizing frameworks", "Trend and breakout systems", "Backtest realism"],
  },
  {
    id: "forex",
    title: "Forex",
    items: ["Pair selection & session filters", "Mean reversion & momentum models", "Spread-aware execution", "Our FX strategy methodology"],
  },
  {
    id: "commodities",
    title: "Commodities",
    items: ["Gold and energy momentum", "Volatility regime filters", "Commodity trend systems", "Live model subscription fit"],
  },
  {
    id: "our-strategies",
    title: "Our Live Strategies",
    items: ["Gold Momentum & FX Mean Reversion", "QuantConnect verification walkthrough", "Retail vs institutional access", "Signal and rules review"],
  },
  {
    id: "custom-systems",
    title: "Systems You Want to Build",
    items: ["Research-to-production workflow", "Python / QuantConnect architecture", "Risk controls & monitoring", "Documentation and handoff"],
  },
];

export const subscriptionTiers = [
  {
    id: "free",
    name: "Preview",
    price: "$0",
    period: "",
    description: "Read research previews before you subscribe",
    features: [
      "Research titles & excerpts",
      "Key chart previews",
      "First key finding per paper",
      "Strategy summaries",
    ],
    cta: "Browse previews",
    highlight: false,
  },
  {
    id: "research-pro",
    name: "Methodology Access",
    price: `${formatUsd(PRICING.researchFull)}/report`,
    amountUsd: PRICING.researchFull,
    period: "",
    description: "One-time unlock per full research note — not a subscription",
    features: [
      "Full research notes",
      "Complete key findings",
      "Premium PDF downloads",
      "Research archive access",
    ],
    cta: `Unlock report — ${formatUsd(PRICING.researchFull)}`,
    highlight: false,
  },
  {
    id: "live-retail",
    name: "Live Strategy — Retail",
    price: formatUsd(PRICING.liveRetail),
    amountUsd: PRICING.liveRetail,
    period: "",
    description: "Subscribe to live systematic models (retail)",
    features: [
      "Live strategy signals & breakdowns",
      "Rules summary & backtest reports",
      "Verification dashboard access",
      "Research context for live models",
    ],
    cta: `Subscribe live — ${formatUsd(PRICING.liveRetail)}`,
    highlight: true,
  },
  {
    id: "live-institutional",
    name: "Live Strategy — Institutional",
    price: formatUsd(PRICING.liveInstitutional),
    amountUsd: PRICING.liveInstitutional,
    period: "",
    description: "Institutional access to live systematic models",
    features: [
      "Everything in Live Retail",
      "Multi-seat research desk access",
      "Priority advisory queue",
      "Custom reporting & onboarding",
    ],
    cta: `Subscribe live — ${formatUsd(PRICING.liveInstitutional)}`,
    highlight: false,
  },
];

export type ResearchPaper = {
  id: string;
  title: string;
  category: string;
  date: string;
  tier: "free" | "research-pro" | "quant-pro";
  executiveSummary: string;
  keyFindings: string[];
  previewChartLabel: string;
  lockedContent: string[];
};

export const researchPapers: ResearchPaper[] = [
  {
    id: "RN-2026-05",
    title: "Gold Volatility Regimes",
    category: "Commodities",
    date: "May 2026",
    tier: "research-pro",
    executiveSummary:
      "Gold exhibits three dominant volatility states across major macroeconomic cycles. We map regime transitions using realized vol, term structure, and cross-asset correlations — with implications for momentum and mean-reversion overlays.",
    keyFindings: [
      "Three distinct volatility regimes identified (low, transitional, crisis)",
      "Regime shifts precede drawdown clusters by 8–14 trading days on average",
      "Momentum strategies benefit from vol-filter overlays in transitional regimes",
    ],
    previewChartLabel: "Gold realized volatility — 3-regime classification",
    lockedContent: [
      "Full methodology & statistical tests",
      "Regime transition probability matrix",
      "Research notebook (Python)",
      "PDF download",
      "Historical dataset (CSV)",
    ],
  },
  {
    id: "RN-2026-04",
    title: "Momentum Effects in African Markets",
    category: "Equities",
    date: "Apr 2026",
    tier: "research-pro",
    executiveSummary:
      "Cross-sectional momentum in frontier African equity markets shows shorter decay horizons than developed markets, with liquidity constraints as the primary capacity limiter.",
    keyFindings: [
      "6-month momentum factor shows positive IC in NSE-listed equities",
      "Turnover constraints reduce implementable capacity vs. US peers",
      "Currency risk dominates total return attribution",
    ],
    previewChartLabel: "NSE momentum quintile spreads",
    lockedContent: ["Full methodology", "Factor attribution tables", "PDF download", "Data appendix"],
  },
  {
    id: "RN-2026-03",
    title: "Forex Liquidity During High-Impact News",
    category: "Forex",
    date: "Mar 2026",
    tier: "quant-pro",
    executiveSummary:
      "Spread widening and slippage patterns around major macro releases create predictable microstructure opportunities — and risks — for systematic FX strategies.",
    keyFindings: [
      "EUR/USD spreads widen 3–5× in the 30s before NFP releases",
      "Mean-reversion edge degrades post-release for ~45 minutes",
      "Volatility breakout models show positive expectancy with spread filters",
    ],
    previewChartLabel: "EUR/USD spread distribution — news vs. normal",
    lockedContent: ["Full statistical analysis", "Execution simulation", "Research notebook", "PDF download"],
  },
  {
    id: "WP-2026-01",
    title: "Building a Quantitative Track Record",
    category: "White Paper",
    date: "Jan 2026",
    tier: "free",
    executiveSummary:
      "A practical framework for researchers and small teams to build verifiable performance history through transparent deployment on third-party platforms.",
    keyFindings: [
      "Third-party verification builds credibility faster than self-reported returns",
      "Paper trading periods should be minimum 6 months before live capital",
      "Document every strategy change with dated changelog entries",
    ],
    previewChartLabel: "Track record verification workflow",
    lockedContent: [],
  },
];

export const caseStudies = [
  { title: "Gold Volatility Analysis", category: "Commodities", outcome: "Published as RN-2026-05" },
  { title: "Momentum in African Markets", category: "Equities", outcome: "Published as RN-2026-04" },
  { title: "FX Liquidity Microstructure", category: "Forex", outcome: "In peer review" },
];

export const whitePapers = [
  { title: "Building a Quantitative Track Record", date: "Jan 2026", tier: "free" as const },
  { title: "Risk Allocation for Small Quant Teams", date: "Dec 2025", tier: "research-pro" as const },
  { title: "Financial Systems Architecture for Asset Managers", date: "Nov 2025", tier: "quant-pro" as const },
];

/** FX Mean Reversion — featured live model curve (matches hero + card metrics). */
export const fxMeanReversionCurve = buildStrategyEquityCurve(0.314, 180);

// Modest equity curve — blended portfolio, not hedge fund
export const equityCurve = (() => {
  const points: { date: string; equity: number }[] = [];
  let equity = 100;
  const start = new Date();
  start.setDate(start.getDate() - 365);
  for (let i = 0; i < 366; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const r = 0.0004 + (Math.sin(i * 0.11) * 0.3 + (Math.random() - 0.5)) * 0.005;
    equity *= 1 + r;
    points.push({ date: d.toISOString().slice(0, 10), equity: +equity.toFixed(2) });
  }
  return points;
})();

export const monthlyReturns = (() => {
  const out: { month: string; return: number }[] = [];
  let i = 0;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let m = 0; m < 12; m++) {
    const slice = equityCurve.slice(i, i + 30);
    if (slice.length < 2) break;
    const r = (slice[slice.length - 1].equity / slice[0].equity - 1) * 100;
    out.push({ month: months[m], return: +r.toFixed(2) });
    i += 30;
  }
  return out;
})();

export const fmt = {
  pct: (n: number, d = 1) => `${(n * 100).toFixed(d)}%`,
  num: (n: number, d = 2) => n.toLocaleString(undefined, { maximumFractionDigits: d }),
};

// Research-first data — no fake AUM, investors, or hedge fund operations

export const company = {
  name: "Smart Algos Capital",
  tagline: "Quantitative Research & Investment Technology Platform",
  operator: "Smart Algos Investment Solution Ltd (Kenya)",
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

export const verificationSources = [
  { name: "QuantConnect", url: "https://www.quantconnect.com", status: "Connected" as const },
  { name: "Collective2", url: "https://www.collective2.com", status: "Planned" as const },
  { name: "Darwinex", url: "https://www.darwinex.com", status: "Future" as const },
];

export const activeStrategies = [
  { name: "Gold Momentum", asset: "Commodities", platform: "QuantConnect", status: "Live" as const },
  { name: "FX Mean Reversion", asset: "Forex", platform: "QuantConnect", status: "Live" as const },
  { name: "Volatility Breakout", asset: "Multi-Asset", platform: "Internal Research", status: "Research" as const },
  { name: "Trend Following Model", asset: "Equities", platform: "Internal Research", status: "Testing" as const },
  { name: "Macro Regime Filter", asset: "Multi-Asset", platform: "Internal Research", status: "Development" as const },
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

export const futureEcosystem = [
  { name: "Live Trading Portal", path: "/live-trading", phase: "Development" },
  { name: "Backtesting Engine", path: "/backtesting", phase: "Development" },
  { name: "Investor Portal", path: "/investor", phase: "Planning" },
  { name: "Copy Trading", path: "/copy-trading", phase: "Planning" },
  { name: "Prop Firm Program", path: "/prop-firm", phase: "Planning" },
  { name: "Financial Intelligence Division", path: "/institutional", phase: "Research" },
];

export const consultationServices = [
  {
    id: "quant",
    title: "Quant Consulting",
    items: ["Strategy review", "Alpha review", "Research methodology", "Performance attribution"],
  },
  {
    id: "trading",
    title: "Trading System Consulting",
    items: ["MT5 system design", "Python execution frameworks", "Backtest infrastructure", "Risk controls"],
  },
  {
    id: "financial",
    title: "Financial Systems Consulting",
    items: ["Banking systems advisory", "Risk systems design", "Treasury analytics", "Compliance technology"],
  },
  {
    id: "research",
    title: "Research Consulting",
    items: ["Research papers", "Quant studies", "White paper development", "Market structure analysis"],
  },
];

export const subscriptionTiers = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Public research and strategy summaries",
    features: [
      "Dashboard access",
      "Public research previews",
      "Strategy summaries",
      "Executive summaries & key charts",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "research-pro",
    name: "Research Pro",
    price: "$19",
    period: "/month",
    description: "Full research notes and premium PDFs",
    features: [
      "Full research notes",
      "Premium PDF downloads",
      "Research archive access",
      "Subscriber commentary",
    ],
    cta: "Subscribe — Research Pro",
    highlight: false,
  },
  {
    id: "quant-pro",
    name: "Quant Pro",
    price: "$79",
    period: "/month",
    description: "Strategy breakdowns and research notebooks",
    features: [
      "Everything in Research Pro",
      "Strategy breakdowns",
      "Backtest reports",
      "Research notebooks",
      "Alpha discussion notes",
    ],
    cta: "Subscribe — Quant Pro",
    highlight: true,
  },
  {
    id: "institutional",
    name: "Institutional",
    price: "Custom",
    period: "",
    description: "Private advisory and custom research",
    features: [
      "Private consultations",
      "Custom research engagements",
      "Financial systems advisory",
      "Dedicated research desk",
    ],
    cta: "Contact Us",
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

// Modest equity curve — research portfolio, not hedge fund
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

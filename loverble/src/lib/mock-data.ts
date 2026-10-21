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
  /** Public-facing scan fields (no proprietary rules). */
  timeframe?: string;
  instruments?: string;
  holdingPeriod?: string;
  riskControls?: string;
  /** ISO-ish display date when status is Live */
  liveSince?: string;
  changelog?: { date: string; text: string }[];
  verificationUrl?: string;
  tier: "free" | "quant-pro";
  liveReturn?: number;
  liveSharpe?: number;
  liveMaxDrawdown?: number;
};

export const researchOverview = {
  notesPublished: 1,
  studiesCompleted: 4,
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
  { name: "QuantConnect", url: "https://www.quantconnect.com", status: "Listing pending" as const },
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
    summary: "Daily gold futures/ETF momentum with a realized-vol regime filter and capped leverage.",
    thesis:
      "Gold momentum persists across macro regimes when filtered by realized volatility. We deploy a rules-based momentum overlay with dynamic position sizing tied to vol states.",
    timeframe: "Daily bars",
    instruments: "Gold futures / liquid gold ETF proxies",
    holdingPeriod: "Multi-day to multi-week",
    riskControls: "Vol-scaled sizing · max position cap · regime filter off-switch",
    liveSince: "Apr 2026",
    highlights: [
      "Volatility regime filter reduces drawdown clusters",
      "Deployed on QuantConnect — public listing URL pending",
      "Changelog maintained for every rule change",
    ],
    changelog: [
      { date: "Jun 2026", text: "Added volatility filter overlay" },
      { date: "Apr 2026", text: "Initial live deploy on QuantConnect (listing not public yet)" },
    ],
    verificationUrl: "https://www.quantconnect.com",
    tier: "quant-pro",
  },
  {
    slug: "fx-mean-reversion",
    name: "FX Mean Reversion",
    asset: "Forex",
    platform: "QuantConnect",
    status: "Live",
    summary: "Intraday mean reversion on major FX pairs with spread and session filters.",
    thesis:
      "Micro mean-reversion edges in liquid FX pairs decay quickly without spread filters. The model targets session-specific liquidity windows.",
    timeframe: "Intraday (session windows)",
    instruments: "Major FX pairs (e.g. EUR/USD, GBP/USD)",
    holdingPeriod: "Minutes to hours",
    riskControls: "Spread filter · session gate · per-trade risk limit",
    liveSince: "May 2026",
    highlights: [
      "Spread and session filters for realistic execution",
      "Validation review completed May 2026",
      "QuantConnect listing pending",
    ],
    changelog: [
      { date: "May 2026", text: "Validation review completed" },
      { date: "Apr 2026", text: "Live deploy started — public listing pending" },
    ],
    verificationUrl: "https://www.quantconnect.com",
    tier: "quant-pro",
  },
  {
    slug: "volatility-breakout",
    name: "Volatility Breakout",
    asset: "Multi-Asset",
    platform: "Internal Research",
    status: "Research",
    summary: "Compression–expansion breakout research across correlated asset baskets.",
    thesis: "Volatility compression phases precede directional breakouts across correlated asset baskets.",
    timeframe: "Daily",
    instruments: "Cross-asset basket (research)",
    holdingPeriod: "Days to weeks (research)",
    riskControls: "Under design — not deployed",
    highlights: ["Cross-asset signal research", "Notebook in progress", "Not for sale until validated"],
    tier: "quant-pro",
  },
  {
    slug: "trend-following-model",
    name: "Trend Following Model",
    asset: "Equities",
    platform: "Internal Research",
    status: "Testing",
    summary: "Equity index trend with volatility-scaled exposure; out-of-sample testing underway.",
    thesis: "Time-series momentum on broad equity indices with volatility-scaled exposure.",
    timeframe: "Daily / weekly",
    instruments: "Broad equity indices",
    holdingPeriod: "Weeks to months",
    riskControls: "Vol targeting · risk-parity style sizing (testing)",
    highlights: ["Out-of-sample testing underway", "African markets extension planned"],
    tier: "quant-pro",
  },
  {
    slug: "macro-regime-filter",
    name: "Macro Regime Filter",
    asset: "Multi-Asset",
    platform: "Internal Research",
    status: "Development",
    summary: "Lightweight macro regime classifier to gate allocation across live models.",
    thesis: "A lightweight regime filter improves composite strategy robustness without overfitting.",
    timeframe: "Weekly / monthly features",
    instruments: "Macro + cross-asset inputs",
    holdingPeriod: "Overlay (gates other models)",
    riskControls: "Designed as an allocation gate, not a standalone book",
    highlights: ["Research initiated Apr 2026", "Will overlay live strategies when validated"],
    tier: "quant-pro",
  },
];

/** Derived from `strategies` so catalog counts always match the cards. */
export const strategyOverview = {
  live: strategies.filter((s) => s.status === "Live").length,
  research: strategies.filter((s) => s.status === "Research").length,
  testing: strategies.filter((s) => s.status === "Testing").length,
  development: strategies.filter((s) => s.status === "Development").length,
  platforms: ["QuantConnect", "Collective2", "MT5", "Internal Research"] as const,
};

/** Single source of truth for homepage / overview counters — keep in sync with live strategy cards. */
export const PORTFOLIO_METRICS = {
  sharpe: performanceMetrics.sharpe,
  liveStrategies: strategyOverview.live,
  maxDrawdown: performanceMetrics.maxDrawdown,
  winRate: performanceMetrics.winRate,
  profitFactor: performanceMetrics.profitFactor,
} as const;

/** @deprecated Use `strategies` */
export const activeStrategies = strategies.map(({ slug, summary, thesis, highlights, verificationUrl, tier, ...rest }) => rest);

export function getStrategyBySlug(slug: string): Strategy | undefined {
  return strategies.find((s) => s.slug === slug);
}

export const roadmap = [
  { name: "Collective2 signal publication", phase: "Planned" },
  { name: "Live performance API (QuantConnect)", phase: "Development" },
  { name: "Client portal & downloads", phase: "Live" },
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

/** Public pipeline — names from the catalog only (no inflated idea counts). */
export const pipelineStages = [
  {
    stage: "Research",
    desc: "Statistical testing and signal exploration.",
    strategySlugs: ["volatility-breakout"] as const,
  },
  {
    stage: "Validation",
    desc: "Out-of-sample testing and robustness checks.",
    strategySlugs: ["trend-following-model"] as const,
  },
  {
    stage: "Development",
    desc: "Early build and architecture.",
    strategySlugs: ["macro-regime-filter"] as const,
  },
  {
    stage: "Deployed",
    desc: "Running on QuantConnect — public listing URLs pending.",
    strategySlugs: ["gold-momentum", "fx-mean-reversion"] as const,
  },
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
  { date: "Jan 2026", text: "Free white paper live — Building a Quantitative Track Record", type: "research" as const },
  { date: "Jun 2026", text: "Strategy changelog — Gold Momentum vol filter", type: "strategy" as const },
  { date: "May 2026", text: "FX Mean Reversion — validation review completed", type: "strategy" as const },
  { date: "Apr 2026", text: "Research pipeline — African equity momentum investigation started", type: "research" as const },
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
    items: [
      "A written rule sketch for entries, exits, and position sizing",
      "How to test a factor or momentum idea without overfitting",
      "A simple risk budget you can implement in a spreadsheet",
    ],
  },
  {
    id: "derivatives",
    title: "Futures & Derivatives",
    items: [
      "Contract and roll choices that match your capital",
      "Margin-aware sizing checklist",
      "Backtest assumptions that survive live costs",
    ],
  },
  {
    id: "forex",
    title: "Forex",
    items: [
      "Session and spread filters for a short-horizon idea",
      "Mean-reversion vs momentum fit for your pairs",
      "How we think about FX Mean Reversion (high level)",
    ],
  },
  {
    id: "commodities",
    title: "Commodities",
    items: [
      "Vol-regime framing for gold momentum",
      "Position caps and off-switches you can state clearly",
      "Whether a commodity book fits your constraints",
    ],
  },
  {
    id: "our-strategies",
    title: "Our Live Strategies",
    items: [
      "What Gold Momentum and FX Mean Reversion actually do",
      "How to read a third-party track record when listings go live",
      "What access looks like after a desk review (not a signal feed yet)",
    ],
  },
  {
    id: "custom-systems",
    title: "Systems You Want to Build",
    items: [
      "A research-to-paper-trade roadmap for your idea",
      "Python / QuantConnect architecture outline",
      "Monitoring and changelog habits that keep you honest",
    ],
  },
];

/** Desk hosting — one person until a named team page exists. */
export const strategyDeskHost = {
  title: "Research desk host",
  org: company.operator,
  blurb:
    "Sessions are hosted by the Smart Algos Capital research desk — currently one researcher, not a multi-person advisory team. Educational discussion only; we do not manage your money.",
};

export const subscriptionTiers = [
  {
    id: "free",
    name: "Preview",
    price: "$0",
    period: "",
    description: "Read research previews before you subscribe",
    features: [
      "Research titles & excerpts",
      "Published notes (free text)",
      "Pipeline titles (not for sale)",
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
  slug: string;
  title: string;
  category: string;
  type: "Research note" | "White paper";
  date: string;
  /** Target publish window for pipeline items */
  expectedDate?: string;
  tier: "free" | "research-pro" | "quant-pro";
  published: boolean;
  executiveSummary: string;
  /** Published findings or open research questions (never unverified numbers for drafts). */
  keyFindings: string[];
  previewChartLabel?: string;
  lockedContent: string[];
  readingMinutes?: number;
  /** Expanded article sections for published notes */
  sections?: { heading: string; paragraphs: string[] }[];
  /** Public path under /research-files/ once the notebook is uploaded. */
  downloadUrl?: string;
};

export const FREE_NOTE_SLUG = "building-a-quantitative-track-record";

export const researchPapers: ResearchPaper[] = [
  {
    id: "WP-2026-01",
    slug: FREE_NOTE_SLUG,
    title: "Building a Quantitative Track Record",
    category: "Methodology",
    type: "White paper",
    date: "Jan 2026",
    tier: "free",
    published: true,
    readingMinutes: 8,
    executiveSummary:
      "A practical framework for researchers and small teams to build verifiable performance history through transparent deployment on third-party platforms — before raising outside capital or selling signals.",
    keyFindings: [
      "Third-party verification builds credibility faster than self-reported returns",
      "Paper-trade at least six months before risking meaningful capital",
      "Document every strategy change with a dated changelog",
    ],
    lockedContent: [],
    sections: [
      {
        heading: "Why verification beats screenshots",
        paragraphs: [
          "Allocators and peers discount self-hosted equity curves. A live or paper track on a platform that timestamps trades (for example QuantConnect) lets others reproduce your process without trusting a PNG.",
          "Start with one strategy, one market, and one clear rule set. Breadth without a verifiable spine looks like marketing.",
        ],
      },
      {
        heading: "A minimum viable track record",
        paragraphs: [
          "1) Freeze the strategy specification (entry, exit, sizing, costs).",
          "2) Run a paper or sim account for at least six months with realistic spreads and slippage.",
          "3) Publish a changelog: every parameter change gets a date and a reason.",
          "4) Separate backtest metrics from live/paper metrics — never blend them in one chart without labels.",
          "5) Link the public verification URL from your site; do not paste “illustrative” curves next to the word verified.",
        ],
      },
      {
        heading: "What we publish here",
        paragraphs: [
          "Smart Algo STS lists research as published only when a real notebook, PDF, or dataset is attached. Items without files sit in the pipeline — not for sale, and without fabricated charts or numeric claims.",
          "When a notebook ships, it will include method, data sources, limitations, and downloadable artifacts. Until then, treat pipeline titles as research questions under investigation.",
        ],
      },
      {
        heading: "Limitations",
        paragraphs: [
          "This note is educational methodology, not investment advice and not a promise of returns. Third-party platforms have their own fees, outages, and data quirks — read their terms.",
          "A short honest record is better than a long illustrative one. If our Track Record page has no live feed yet, we say so plainly rather than decorate the gap.",
        ],
      },
    ],
  },
  {
    id: "RN-2026-04",
    slug: "momentum-effects-in-african-markets",
    title: "Momentum Effects in African Markets",
    category: "Equities",
    type: "Research note",
    date: "Apr 2026",
    expectedDate: "Target H1 2026",
    tier: "research-pro",
    published: false,
    executiveSummary:
      "Open investigation: does cross-sectional momentum in frontier African equities (including NSE listings) show shorter decay and tighter capacity than developed-market peers once liquidity and FX are modeled?",
    keyFindings: [
      "Question: how does 6-month momentum IC behave on NSE names after costs?",
      "Question: how much does turnover and FX attribution cut implementable capacity?",
      "Deliverables planned: notebook, factor tables, data appendix",
    ],
    lockedContent: [],
  },
  {
    id: "RN-2026-05",
    slug: "gold-volatility-regimes",
    title: "Gold Volatility Regimes",
    category: "Commodities",
    type: "Research note",
    date: "May 2026",
    expectedDate: "Target mid-2026",
    tier: "research-pro",
    published: false,
    executiveSummary:
      "Open investigation: can realized-vol and term-structure features classify gold into stable regimes that usefully gate momentum vs mean-reversion overlays?",
    keyFindings: [
      "Question: how many regimes are stable out of sample?",
      "Question: do regime transitions lead drawdown clusters in our gold book?",
      "Deliverables planned: method note, transition matrix, Python notebook",
    ],
    lockedContent: [],
  },
  {
    id: "RN-2026-03",
    slug: "forex-liquidity-during-high-impact-news",
    title: "Forex Liquidity During High-Impact News",
    category: "Forex",
    type: "Research note",
    date: "Mar 2026",
    expectedDate: "Target 2026",
    tier: "quant-pro",
    published: false,
    executiveSummary:
      "Open investigation: how do spreads and slippage around scheduled macro releases (e.g. NFP) change short-horizon FX mean-reversion and breakout expectancy?",
    keyFindings: [
      "Question: magnitude and duration of EUR/USD spread widening into releases",
      "Question: which filters keep post-news edges after realistic costs?",
      "Deliverables planned: execution sim, stats pack, notebook",
    ],
    lockedContent: [],
  },
];

export function getPaperBySlug(slug: string): ResearchPaper | undefined {
  return researchPapers.find((paper) => paper.slug === slug);
}

/** Pipeline rows — titles match `researchPapers` (no separate case-study aliases). */
export const researchPipeline = researchPapers
  .filter((p) => !p.published)
  .map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    type: p.type,
    expectedDate: p.expectedDate ?? p.date,
    status: "In progress" as const,
  }));

/** Published white papers only — no unlinkable stubs. */
export const whitePapers = researchPapers
  .filter((p) => p.published && p.type === "White paper")
  .map((p) => ({ title: p.title, date: p.date, tier: p.tier, slug: p.slug }));

/** @deprecated Prefer researchPipeline — kept for any legacy imports. */
export const caseStudies = researchPipeline.map((p) => ({
  title: p.title,
  category: p.category,
  outcome: `${p.status} · ${p.expectedDate}`,
}));

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

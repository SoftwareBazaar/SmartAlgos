/** Real SPY Parabolic SAR research pack — metrics from backtest_report.json / QC summary. */

export const SPY_PSAR_SLUG = "spy-psar";

export type BacktestMetrics = {
  cagr: number;
  vol: number;
  sharpe: number;
  maxDrawdown: number;
  calmar: number;
  trades?: number;
  tradesPerYear?: number;
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
  timeInMarket?: number;
};

export type WindowRow = {
  id: string;
  label: string;
  note?: string;
  strategy: BacktestMetrics;
  benchmark: BacktestMetrics;
};

/** Primary published window (QC in-sample) + honest OOS / full / regime cuts. */
export const SPY_PSAR_WINDOWS: WindowRow[] = [
  {
    id: "qc",
    label: "QC window · Jan 2023 – Jul 2026",
    note: "In-sample — parameters tuned on this window",
    strategy: {
      cagr: 15.89,
      vol: 8.94,
      sharpe: 1.2,
      maxDrawdown: -6.8,
      calmar: 2.34,
      trades: 28,
      tradesPerYear: 8.0,
      winRate: 64.3,
      avgWin: 3.83,
      avgLoss: -1.69,
      timeInMarket: 65.7,
    },
    benchmark: {
      cagr: 22.5,
      vol: 15.15,
      sharpe: 1.12,
      maxDrawdown: -18.76,
      calmar: 1.2,
    },
  },
  {
    id: "oos",
    label: "Out-of-sample · 1993 – 2022",
    note: "Held out from parameter tuning",
    strategy: {
      cagr: 5.24,
      vol: 11.06,
      sharpe: 0.32,
      maxDrawdown: -31.6,
      calmar: 0.17,
      trades: 249,
      tradesPerYear: 8.3,
      winRate: 49.8,
      avgWin: 3.54,
      avgLoss: -2.28,
      timeInMarket: 62.3,
    },
    benchmark: {
      cagr: 9.5,
      vol: 18.94,
      sharpe: 0.46,
      maxDrawdown: -55.19,
      calmar: 0.17,
    },
  },
  {
    id: "full",
    label: "Full sample · 1993 – 2026",
    strategy: {
      cagr: 6.27,
      vol: 10.84,
      sharpe: 0.39,
      maxDrawdown: -31.6,
      calmar: 0.2,
      trades: 279,
      tradesPerYear: 8.3,
      winRate: 51.3,
      avgWin: 3.56,
      avgLoss: -2.23,
      timeInMarket: 62.9,
    },
    benchmark: {
      cagr: 10.87,
      vol: 18.54,
      sharpe: 0.52,
      maxDrawdown: -55.19,
      calmar: 0.2,
    },
  },
  {
    id: "bears",
    label: "Two bear markets · 2000 – 2009",
    strategy: {
      cagr: -0.53,
      vol: 12.79,
      sharpe: -0.19,
      maxDrawdown: -30.71,
      calmar: -0.02,
      trades: 83,
      tradesPerYear: 8.3,
      winRate: 42.2,
      timeInMarket: 57.1,
    },
    benchmark: {
      cagr: -1.01,
      vol: 22.44,
      sharpe: -0.05,
      maxDrawdown: -55.19,
      calmar: -0.02,
    },
  },
  {
    id: "bull",
    label: "Bull decade · 2010 – 2019",
    strategy: {
      cagr: 8.95,
      vol: 8.55,
      sharpe: 0.98,
      maxDrawdown: -13.91,
      calmar: 0.64,
      trades: 81,
      tradesPerYear: 8.1,
      winRate: 53.1,
      timeInMarket: 65.3,
    },
    benchmark: {
      cagr: 13.45,
      vol: 14.7,
      sharpe: 0.9,
      maxDrawdown: -19.35,
      calmar: 0.7,
    },
  },
  {
    id: "covid",
    label: "Covid + 2022 bear · 2020 – 2022",
    strategy: {
      cagr: 4.39,
      vol: 13.91,
      sharpe: 0.32,
      maxDrawdown: -18.78,
      calmar: 0.23,
      trades: 27,
      tradesPerYear: 9.0,
      winRate: 48.1,
      timeInMarket: 64.0,
    },
    benchmark: {
      cagr: 7.64,
      vol: 24.99,
      sharpe: 0.39,
      maxDrawdown: -33.72,
      calmar: 0.23,
    },
  },
];

/** QuantConnect overview strip from results.txt (same QC window deployment). */
export const SPY_PSAR_QC_OVERVIEW = {
  startEquity: 100_000,
  endEquity: 166_411.03,
  netProfitPct: 66.411,
  cagr: 15.57,
  maxDrawdown: -6.9,
  sharpe: 0.807,
  sortino: 0.784,
  winRate: 81,
  lossRate: 19,
  avgWin: 1.55,
  avgLoss: -1.75,
  totalOrders: 117,
  fees: 455.97,
  capacityUsd: 180_000_000,
  turnover: 8.64,
  beta: 0.377,
  alpha: 0.018,
  psr: 27.549,
};

export const SPY_PSAR_SIGNAL = {
  date: "2026-10-06",
  close: 780.08,
  sar: 753.25,
  signal: "LONG SPY",
  stopDistancePct: 3.44,
};

export const SPY_PSAR_DOWNLOADS = [
  {
    filename: "README.txt",
    label: "README",
    href: "/downloads/strategies/spy-psar/README.txt",
  },
  {
    filename: "backtest_spy_psar.py",
    label: "Python backtest",
    href: "/downloads/strategies/spy-psar/backtest_spy_psar.py",
  },
  {
    filename: "backtest_report.json",
    label: "Metrics (JSON)",
    href: "/downloads/strategies/spy-psar/backtest_report.json",
  },
  {
    filename: "backtest_report.txt",
    label: "Metrics (TXT)",
    href: "/downloads/strategies/spy-psar/backtest_report.txt",
  },
  {
    filename: "equity_curves.png",
    label: "Equity curves",
    href: "/downloads/strategies/spy-psar/equity_curves.png",
  },
] as const;

export const SPY_PSAR_EQUITY_IMG = "/strategies/spy-psar/equity_curves.png";

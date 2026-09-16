import { PRICING } from "@/lib/pricing";

export type StrategyFileProduct = {
  id: string;
  title: string;
  filename: string;
  summary: string;
  source: string;
};

const DISCLAIMER = `
# Smart Algos Capital — licensed research file
# Illustrative skeleton for subscribers. Not a live execution bot.
# Not investment advice. Past sample metrics are not a guarantee of future results.
# Capital stays in the client's own broker or prop account.
`.trim();

export const STRATEGY_FILE_PRODUCTS: StrategyFileProduct[] = [
  {
    id: "eurusd_mean_reversion_v2",
    title: "EUR/USD Short-Horizon Mean Reversion",
    filename: "eurusd_mean_reversion_v2.py",
    summary: "Research skeleton for a short-horizon FX mean-reversion ruleset.",
    source: `${DISCLAIMER}

"""EUR/USD short-horizon mean reversion — research skeleton."""

STRATEGY_ID = "eurusd_mean_reversion_v2"
ASSET = "EURUSD"
TIMEFRAME = "1min"

# Placeholder research parameters. Production values are issued after desk review.
LOOKBACK_BARS = 48
ENTRY_Z = 1.8
EXIT_Z = 0.4
MAX_HOLD_BARS = 12
HARD_STOP_PIPS = 18


def zscore(spread_series):
    """Return a rolling z-score. Replace with your data vendor's series."""
    raise NotImplementedError("Wire your market-data source before any live use.")


def generate_signals(spread_series):
    """Return illustrative long/flat/short labels — not a fill engine."""
    raise NotImplementedError("Signal generation is licensed separately from live routing.")
`,
  },
  {
    id: "xauusd_fomc_breakout",
    title: "Gold Momentum FOMC Window Logic",
    filename: "xauusd_fomc_breakout.py",
    summary: "Research skeleton for a gold momentum window around scheduled FOMC events.",
    source: `${DISCLAIMER}

"""XAU/USD FOMC-window momentum — research skeleton."""

STRATEGY_ID = "xauusd_fomc_breakout"
ASSET = "XAUUSD"
TIMEFRAME = "5min"

# Placeholder event window. Confirm calendar timestamps before any live use.
PRE_EVENT_MINUTES = 45
POST_EVENT_MINUTES = 90
BREAKOUT_ATR_MULT = 1.25
MAX_TRADES_PER_EVENT = 1


def event_window(calendar_row):
    """Return the research window around a scheduled FOMC timestamp."""
    raise NotImplementedError("Connect an economic calendar before any live use.")


def generate_signals(bars, calendar_row):
    """Return illustrative breakout labels — not a fill engine."""
    raise NotImplementedError("Signal generation is licensed separately from live routing.")
`,
  },
];

export const STRATEGY_FILE_PRICE_USD = PRICING.strategyFile;

export function getStrategyFileProduct(id: string | undefined | null): StrategyFileProduct | undefined {
  if (!id) return undefined;
  return STRATEGY_FILE_PRODUCTS.find((p) => p.id === id);
}

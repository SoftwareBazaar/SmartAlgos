import { useState } from "react";
import {
  SPY_PSAR_EQUITY_IMG,
  SPY_PSAR_QC_OVERVIEW,
  SPY_PSAR_SIGNAL,
  SPY_PSAR_WINDOWS,
  type BacktestMetrics,
  type WindowRow,
} from "@/lib/spy-psar-strategy";
function fmtPct(n: number, digits = 2) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function MetricTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down" | "neutral" | "gold";
}) {
  const color =
    tone === "up"
      ? "text-bull"
      : tone === "down"
        ? "text-bear"
        : tone === "gold"
          ? "text-gold"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-xl md:text-2xl font-semibold tabular-nums ${color}`}>{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

function MetricsGrid({ m, prefix }: { m: BacktestMetrics; prefix?: string }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricTile label={`${prefix ?? ""}CAGR`} value={fmtPct(m.cagr)} tone={m.cagr >= 0 ? "up" : "down"} />
      <MetricTile label="Sharpe" value={m.sharpe.toFixed(2)} tone={m.sharpe >= 1 ? "gold" : "neutral"} />
      <MetricTile
        label="Max drawdown"
        value={fmtPct(m.maxDrawdown)}
        tone="down"
      />
      <MetricTile label="Calmar" value={m.calmar.toFixed(2)} />
      {m.vol != null && <MetricTile label="Volatility" value={fmtPct(m.vol)} />}
      {m.winRate != null && <MetricTile label="Win rate" value={`${m.winRate.toFixed(1)}%`} tone="up" />}
      {m.trades != null && <MetricTile label="Trades" value={String(m.trades)} hint={m.tradesPerYear ? `${m.tradesPerYear}/yr` : undefined} />}
      {m.timeInMarket != null && <MetricTile label="Time in market" value={`${m.timeInMarket.toFixed(1)}%`} />}
    </div>
  );
}

function CompareTable({ row }: { row: WindowRow }) {
  const cols: { key: keyof BacktestMetrics; label: string; fmt: (n: number) => string }[] = [
    { key: "cagr", label: "CAGR", fmt: (n) => fmtPct(n) },
    { key: "sharpe", label: "Sharpe", fmt: (n) => n.toFixed(2) },
    { key: "maxDrawdown", label: "Max DD", fmt: (n) => fmtPct(n) },
    { key: "vol", label: "Vol", fmt: (n) => fmtPct(n) },
    { key: "calmar", label: "Calmar", fmt: (n) => n.toFixed(2) },
  ];
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground bg-card/40">
            <th className="px-3 py-2 font-medium">Series</th>
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(
            [
              ["PSAR ETF (QC rules)", row.strategy],
              ["SPY buy & hold", row.benchmark],
            ] as const
          ).map(([name, m]) => (
            <tr key={name} className="border-b border-border/40 last:border-0">
              <td className="px-3 py-2.5 font-medium text-foreground">{name}</td>
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-2.5 font-mono tabular-nums text-muted-foreground">
                  {c.fmt(m[c.key] as number)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpyPsarResults() {
  const [windowId, setWindowId] = useState(SPY_PSAR_WINDOWS[0].id);
  const active = SPY_PSAR_WINDOWS.find((w) => w.id === windowId) ?? SPY_PSAR_WINDOWS[0];
  const qc = SPY_PSAR_QC_OVERVIEW;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Verified research metrics</p>
            <h2 className="font-display text-2xl font-semibold mt-1">Backtest results</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-[70ch]">
              Parabolic SAR trend filter on daily SPY (park in T-bills when flat). Headline numbers below are from the
              QuantConnect window; tabs include out-of-sample and regime cuts.
            </p>
          </div>
          <div className="rounded-md border border-border/60 bg-card/30 px-3 py-2 text-xs text-muted-foreground">
            Signal {SPY_PSAR_SIGNAL.date}:{" "}
            <span className="text-bull font-medium">{SPY_PSAR_SIGNAL.signal}</span>
            <span className="mx-1.5">·</span>
            stop {SPY_PSAR_SIGNAL.stopDistancePct}%
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricTile label="Net profit" value={fmtPct(qc.netProfitPct, 2)} tone="up" hint={`$${qc.startEquity.toLocaleString()} → $${qc.endEquity.toLocaleString()}`} />
          <MetricTile label="CAGR" value={fmtPct(qc.cagr)} tone="up" />
          <MetricTile label="Sharpe" value={qc.sharpe.toFixed(3)} tone="gold" />
          <MetricTile label="Sortino" value={qc.sortino.toFixed(3)} />
          <MetricTile label="Max DD" value={fmtPct(qc.maxDrawdown)} tone="down" />
          <MetricTile label="Win rate" value={`${qc.winRate}%`} tone="up" hint={`${qc.totalOrders} orders`} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">Equity & exposure</h3>
          <p className="text-[11px] text-muted-foreground">Research figure · PSAR ETF vs buy & hold</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/20 overflow-hidden">
          <img
            src={SPY_PSAR_EQUITY_IMG}
            alt="SPY Parabolic SAR equity curves versus buy and hold"
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {SPY_PSAR_WINDOWS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setWindowId(w.id)}
              className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                windowId === w.id
                  ? "bg-gold text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        {active.note ? (
          <p className="text-xs text-gold/90 rounded-md border border-gold/25 bg-gold/5 px-3 py-2 max-w-[70ch]">
            {active.note}
          </p>
        ) : null}
        <MetricsGrid m={active.strategy} />
        <CompareTable row={active} />
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Fees (QC)</div>
          <div className="font-mono text-lg mt-1">${qc.fees.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. capacity</div>
          <div className="font-mono text-lg mt-1">${(qc.capacityUsd / 1e6).toFixed(0)}M</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Beta / Alpha</div>
          <div className="font-mono text-lg mt-1">
            {qc.beta} / {qc.alpha}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/30 p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Turnover</div>
          <div className="font-mono text-lg mt-1">{qc.turnover}%</div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground max-w-[70ch] leading-relaxed border-t border-border/50 pt-4">
        Educational backtest. The QC window is in-sample; OOS Sharpe (~0.32) and deep historical drawdowns show the
        strategy is not a free lunch. Not investment advice. Not a live verified listing until a public QuantConnect
        URL is attached.
      </p>
    </div>
  );
}

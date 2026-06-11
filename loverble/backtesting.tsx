import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { equityCurve, fmt } from "@/lib/mock-data";
import { Play } from "lucide-react";

export const Route = createFileRoute("/backtesting")({
  head: () => ({ meta: [{ title: "Backtesting Engine — Smart Algos Capital" }, { name: "description", content: "Tick-level backtesting across stocks, FX, futures, options, crypto and commodities." }] }),
  component: Backtesting,
});

const assets = ["Stocks", "ETFs", "Forex", "Futures", "Commodities", "Crypto", "Options"];
const advanced = ["Walk Forward", "Monte Carlo", "Regime Test", "Out-of-Sample", "Slippage Sim", "Transaction Cost"];

function Backtesting() {
  const data = equityCurve.slice(-365);
  return (
    <PageShell eyebrow="Backtesting Engine" title="Strategy Testing" description="Tick-level historical simulation across 7 asset classes with institutional-grade slippage and cost modelling."
      actions={<button className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"><Play className="h-4 w-4" /> Run Backtest</button>}>
      <div className="grid lg:grid-cols-4 gap-6">
        <SectionCard title="Configuration" className="lg:col-span-1">
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resolution</label>
              <select className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm">
                <option>Tick Data</option><option>1 Minute</option><option>5 Minute</option><option>Daily</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Asset Class</label>
              <select className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm">
                {assets.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date Range</label>
              <input type="text" defaultValue="2018-01-01 → 2026-01-01" className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Capital</label>
              <input type="text" defaultValue="$10,000,000" className="mt-1.5 w-full bg-background border border-border rounded-sm px-3 py-2 text-sm font-mono" />
            </div>
            <div className="pt-2">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Advanced</div>
              <div className="grid grid-cols-2 gap-1.5">
                {advanced.map((a) => (
                  <label key={a} className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" defaultChecked className="accent-gold" /><span>{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Net Profit" value="$3.84M" delta="+38.4%" accent="up" />
            <StatCard label="Sharpe" value="2.61" accent="up" />
            <StatCard label="Max DD" value="-8.2%" accent="down" />
            <StatCard label="Trades" value="14,284" hint="64.2% win rate" />
          </div>

          <SectionCard title="Equity Curve" subtitle="Backtest simulation · 2018 → 2026">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="bt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(0, 7)} minTickGap={60} />
                <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
                <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={2} fill="url(#bt)" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <div className="grid sm:grid-cols-3 gap-3">
            <button className="rounded-sm border border-border bg-card/30 px-4 py-3 text-sm hover:bg-card/50 transition">Download Equity Curve</button>
            <button className="rounded-sm border border-border bg-card/30 px-4 py-3 text-sm hover:bg-card/50 transition">Export Risk Report</button>
            <button className="rounded-sm border border-gold/40 text-gold bg-gold/5 px-4 py-3 text-sm hover:bg-gold/10 transition">Generate PDF</button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

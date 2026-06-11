import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { positions, allocation, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio Management — Smart Algos Capital" }, { name: "description", content: "Multi-asset portfolio management, allocation, position management and rebalancing." }] }),
  component: Portfolio,
});

const COLORS = ["oklch(0.78 0.13 85)", "oklch(0.65 0.15 220)", "oklch(0.72 0.18 155)", "oklch(0.65 0.22 25)", "oklch(0.70 0.15 290)", "oklch(0.60 0.12 60)", "oklch(0.55 0.10 180)", "oklch(0.50 0.05 90)"];

function Portfolio() {
  const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);
  return (
    <PageShell eyebrow="Portfolio Management" title="Multi-Asset Portfolio" description="Cross-asset positioning, allocation drift and rebalancing actions across the master fund.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Positions Open" value={positions.length.toString()} hint="Across 8 asset classes" />
        <StatCard label="Aggregate PnL" value={fmt.usd(totalPnL)} accent="up" delta="+1.42% today" />
        <StatCard label="Net Exposure" value="84%" hint="Long bias" />
        <StatCard label="Rebalance Drift" value="2.4%" hint="Trigger at 5%" accent="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Position Management" subtitle="All open positions · Live marks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="text-left py-2">Ticker</th><th className="text-left py-2">Asset</th><th className="text-left py-2">Side</th>
                <th className="text-right py-2">Qty</th><th className="text-right py-2">Entry</th><th className="text-right py-2">Mark</th>
                <th className="text-right py-2">PnL</th><th className="text-right py-2">Weight</th>
              </tr></thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.ticker} className="border-b border-border/40 hover:bg-card/30">
                    <td className="py-2.5 font-mono text-gold">{p.ticker}</td>
                    <td className="py-2.5 text-muted-foreground">{p.asset}</td>
                    <td className="py-2.5"><span className={`text-xs px-2 py-0.5 rounded ${p.side === "Long" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear"}`}>{p.side}</span></td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{p.qty.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono">{fmt.num(p.entry)}</td>
                    <td className="py-2.5 text-right font-mono">{fmt.num(p.mark)}</td>
                    <td className={`py-2.5 text-right font-mono ${p.pnl >= 0 ? "text-bull" : "text-bear"}`}>{p.pnl >= 0 ? "+" : ""}{fmt.usd(p.pnl)}</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{fmt.pct(p.weight, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Asset Allocation" subtitle="Target vs current">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {allocation.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
          <button className="w-full mt-4 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
            Rebalance Portfolio
          </button>
        </SectionCard>
      </div>
    </PageShell>
  );
}

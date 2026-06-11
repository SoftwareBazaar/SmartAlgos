import { createFileRoute, Link } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import {
  performanceMetrics, equityCurve, monthlyReturns, verificationSources, fmt,
} from "@/lib/mock-data";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { IllustrativeChartNote } from "@/components/illustrative-chart-note";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Smart Algos Capital" },
      { name: "description", content: "Actual strategy performance from verified third-party platforms." },
    ],
  }),
  component: Performance,
});

function Performance() {
  const data = equityCurve.slice(-365);

  return (
    <PageShell
      eyebrow="Verified Performance"
      title="Strategy Performance"
      description="Track actual strategy performance connected from QuantConnect, Collective2, and future Darwinex verification."
    >
      <SectionCard title="Equity Curve" subtitle="Composite of live strategies — verified sources">
        <IllustrativeChartNote />
        <ResponsiveContainer width="100%" height={360} className="mt-4">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="perf-eq" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
            <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(5)} minTickGap={40} />
            <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} />
            <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
            <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={2} fill="url(#perf-eq)" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Monthly Returns" subtitle="Month | Return">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyReturns}>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.70 0.02 90)" fontSize={11} />
              <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
              <Bar dataKey="return" radius={[4, 4, 0, 0]} fill="oklch(0.78 0.13 85)" />
            </BarChart>
          </ResponsiveContainer>
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                <th className="text-left py-2">Month</th>
                <th className="text-right py-2">Return</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {monthlyReturns.map((m) => (
                <tr key={m.month} className="border-b border-border/40">
                  <td className="py-2 font-sans text-muted-foreground">{m.month}</td>
                  <td className={`py-2 text-right ${m.return >= 0 ? "text-bull" : "text-bear"}`}>
                    {m.return >= 0 ? "+" : ""}{m.return.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Drawdown Analysis">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatCard label="Max Drawdown" value={fmt.pct(performanceMetrics.maxDrawdown)} accent="down" />
            <StatCard label="Recovery Time" value={`${performanceMetrics.recoveryDays}d`} hint="To prior peak" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-gold mb-3">Risk Metrics</div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Sharpe" value={performanceMetrics.sharpe.toFixed(2)} />
            <StatCard label="Sortino" value={performanceMetrics.sortino.toFixed(2)} />
            <StatCard label="Profit Factor" value={performanceMetrics.profitFactor.toFixed(2)} accent="up" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Verification" subtitle="Third-party performance verification" action={<ShieldCheck className="h-5 w-5 text-gold" />}>
        <div className="grid sm:grid-cols-3 gap-3">
          {verificationSources.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-sm border border-border bg-card/30 px-4 py-3 hover:border-gold/40 transition"
            >
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <span className={`text-[10px] uppercase tracking-wider ${s.status === "Connected" ? "text-bull" : "text-muted-foreground"}`}>
                  {s.status}
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Performance data will be progressively linked to live verification pages on each platform.
        </p>
      </SectionCard>
    </PageShell>
  );
}

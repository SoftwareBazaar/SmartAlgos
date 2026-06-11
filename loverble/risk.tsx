import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { equityCurve, fundMetrics, fmt } from "@/lib/mock-data";
import { AlertTriangle, Power } from "lucide-react";

export const Route = createFileRoute("/risk")({
  head: () => ({ meta: [{ title: "Risk Management — Smart Algos Capital" }, { name: "description", content: "VaR, drawdown monitoring, stress testing and kill switch system." }] }),
  component: Risk,
});

const drawdown = equityCurve.slice(-180).map((d, i, arr) => {
  const peak = Math.max(...arr.slice(0, i + 1).map((x) => x.equity));
  return { date: d.date, dd: ((d.equity - peak) / peak) * 100 };
});

const stressTests = [
  { scenario: "2008 GFC Replay", impact: -14.2 },
  { scenario: "COVID Mar 2020", impact: -9.1 },
  { scenario: "2022 Rate Shock", impact: -7.8 },
  { scenario: "Flash Crash 2010", impact: -4.2 },
  { scenario: "China Devaluation", impact: -3.1 },
  { scenario: "USD +10% Move", impact: -2.4 },
];

const correlationRadar = [
  { factor: "SPX", value: 0.42 },
  { factor: "VIX", value: 0.18 },
  { factor: "Gold", value: 0.24 },
  { factor: "USD", value: 0.31 },
  { factor: "Oil", value: 0.16 },
  { factor: "10Y UST", value: 0.28 },
];

function Risk() {
  return (
    <PageShell eyebrow="Risk Management" title="Risk Command Center" description="VaR, drawdown, exposure controls, correlation analysis and the master kill switch."
      actions={<button className="inline-flex items-center gap-2 rounded-sm border border-bear/40 bg-bear/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-bear hover:bg-bear/20 transition"><Power className="h-4 w-4" /> Arm Kill Switch</button>}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="VaR (95%, 1d)" value="0.79%" hint="Of allocated risk capital" accent="neutral" />
        <StatCard label="VaR (99%, 1d)" value="1.28%" hint="Of allocated risk capital" accent="neutral" />

        <StatCard label="Current Drawdown" value="-1.8%" hint="From peak Jan 22" accent="down" />
        <StatCard label="Max DD (12M)" value={fmt.pct(fundMetrics.maxDrawdown)} hint="Limit: -10%" accent="down" />
        <StatCard label="Gross Exposure" value="167%" hint="Limit: 200%" />
        <StatCard label="Net Exposure" value="84%" hint="Limit: ±120%" />
        <StatCard label="Beta to SPX" value={fundMetrics.beta.toFixed(2)} hint="Target: <0.5" accent="up" />
        <StatCard label="Liquidity Score" value="A+" hint="98% < 1d to liquidate" accent="up" />
      </div>

      <div className="surface-card rounded-lg p-4 flex items-start gap-3 border-l-2 border-l-gold">
        <AlertTriangle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-sm">2 active risk alerts</div>
          <div className="text-xs text-muted-foreground mt-1">Crypto exposure approaching 7% soft limit (currently 6.4%) · Correlation between BTCUSD and TSLA exceeded 0.7 threshold.</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Drawdown Curve" subtitle="180 days · From peak equity">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={drawdown}>
              <defs>
                <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.22 25)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.65 0.22 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
              <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(5)} minTickGap={40} />
              <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(v) => `${v.toFixed(1)}%`} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} formatter={(v: number) => `${v.toFixed(2)}%`} />
              <Area type="monotone" dataKey="dd" stroke="oklch(0.65 0.22 25)" strokeWidth={2} fill="url(#dd)" />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Factor Correlation" subtitle="Trailing 60d">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={correlationRadar}>
              <PolarGrid stroke="oklch(0.30 0.04 252 / 0.5)" />
              <PolarAngleAxis dataKey="factor" tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 11 }} />
              <PolarRadiusAxis stroke="oklch(0.70 0.02 90)" fontSize={10} domain={[0, 1]} />
              <Radar dataKey="value" stroke="oklch(0.78 0.13 85)" fill="oklch(0.78 0.13 85)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Stress Test Scenarios" subtitle="Estimated portfolio impact under historical replays">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stressTests.map((s) => (
            <div key={s.scenario} className="flex items-center justify-between rounded-sm border border-border bg-card/30 px-4 py-3">
              <span className="text-sm">{s.scenario}</span>
              <span className="font-mono text-sm text-bear">{s.impact.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}

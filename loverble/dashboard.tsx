import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { QuantBackground } from "@/components/quant-background";
import { FutureEcosystem } from "@/components/future-ecosystem";
import {
  researchOverview, strategyOverview, performanceMetrics,
  equityCurve, recentUpdates, techProjects, company, fmt,
} from "@/lib/mock-data";
import { FileText, FlaskConical, Cpu, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Smart Algos Capital" },
      { name: "description", content: "Research overview, strategy status, and performance metrics — no inflated claims." },
    ],
  }),
  component: Dashboard,
});

function statusColor(s: string) {
  if (s === "Development") return "bg-primary/15 text-primary";
  if (s === "Research") return "bg-gold/15 text-gold";
  return "bg-muted/30 text-muted-foreground";
}

function Dashboard() {
  const data = equityCurve.slice(-180);

  return (
    <div className="relative">
      <QuantBackground />
      <div className="relative">
        <PageShell
          eyebrow="Live Overview"
          title="Dashboard"
          description={`What is happening now at ${company.name}. Real research output and verified strategy data — not fake AUM or hedge fund operations.`}
        >
          <SectionCard title="Research Overview" subtitle="Published work and active research areas">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard label="Research Notes Published" value={String(researchOverview.notesPublished)} />
              <StatCard label="Strategy Studies Completed" value={String(researchOverview.studiesCompleted)} />
              <StatCard label="Active Research Areas" value={String(researchOverview.activeResearchAreas)} />
              <StatCard label="Markets Covered" value={String(researchOverview.marketsCovered)} hint={researchOverview.markets.join(" · ")} />
            </div>
            <div className="flex flex-wrap gap-2">
              {researchOverview.areas.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded border border-border bg-card/40 text-muted-foreground">{r}</span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Strategy Overview" subtitle="Live, research, and development pipeline">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard label="Live Strategies" value={String(strategyOverview.live)} hint="QuantConnect" accent="up" />
              <StatCard label="Research Strategies" value={String(strategyOverview.research)} />
              <StatCard label="Under Development" value={String(strategyOverview.development)} />
              <StatCard label="Strategy Reviews" value={String(strategyOverview.reviewsCompleted)} hint="Trailing 6 months" />
            </div>
            <div className="flex flex-wrap gap-2">
              {strategyOverview.platforms.map((p) => (
                <span key={p} className="text-xs px-2.5 py-1 rounded border border-border bg-card/40 text-muted-foreground">{p}</span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Performance Overview" subtitle="From verified strategy platforms — progressively connected">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Avg Monthly Return" value={fmt.pct(performanceMetrics.avgMonthlyReturn)} accent="up" />
              <StatCard label="Max Drawdown" value={fmt.pct(performanceMetrics.maxDrawdown)} accent="down" />
              <StatCard label="Win Rate" value={fmt.pct(performanceMetrics.winRate, 0)} />
              <StatCard label="Profit Factor" value={performanceMetrics.profitFactor.toFixed(2)} accent="up" />
            </div>
            <ResponsiveContainer width="100%" height={280} className="mt-6">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="dash-eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(5)} minTickGap={40} />
                <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
                <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={2} fill="url(#dash-eq)" name="Strategy composite" />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Technology & Systems Development" subtitle={`Current projects — ${company.operator}`}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {techProjects.current.map((s) => (
                <div key={s.name} className="rounded-sm border border-border bg-card/30 p-4">
                  <Cpu className="h-4 w-4 text-gold mb-2" />
                  <div className="text-sm font-medium">{s.name}</div>
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Updates">
            <div className="space-y-2">
              {recentUpdates.map((u, i) => (
                <div key={i} className="flex items-start gap-3 rounded-sm border border-border/60 bg-card/30 px-4 py-3">
                  {u.type === "research" ? <FileText className="h-4 w-4 text-gold mt-0.5" /> : u.type === "strategy" ? <FlaskConical className="h-4 w-4 text-gold mt-0.5" /> : <Cpu className="h-4 w-4 text-gold mt-0.5" />}
                  <div className="flex-1 text-sm">{u.text}</div>
                  <span className="text-xs text-muted-foreground font-mono">{u.date}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="border-t border-border pt-8">
            <FutureEcosystem />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4">
            <Activity className="h-3.5 w-3.5 text-gold" />
            {company.name} is a quantitative research and investment technology firm. The hedge fund vision is part of the roadmap — not something we pretend already exists.
          </div>
        </PageShell>
      </div>
    </div>
  );
}

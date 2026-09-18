import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { equityCurve, fmt } from "@/lib/mock-data";
import { fetchCapitalPerformance } from "@/lib/performance-api";
import { ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { IllustrativeChartNote } from "@/components/illustrative-chart-note";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Smart Algos Capital" },
      { name: "description", content: "Strategy performance from verified third-party platforms." },
    ],
  }),
  component: Performance,
});

function Performance() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["capital-performance"],
    queryFn: fetchCapitalPerformance,
    staleTime: 5 * 60 * 1000,
  });

  const metrics = data?.metrics;
  const monthlyReturns = data?.monthlyReturns ?? [];
  const verificationSources = data?.verificationSources ?? [];
  const strategies = data?.strategies ?? [];
  const illustrative = data?.illustrative ?? true;
  const chartData = equityCurve.slice(-365);

  return (
    <PageShell
      eyebrow="Verified Performance"
      title="Strategy Performance"
      description="Track records connected from QuantConnect and partner platforms."
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading performance data…
        </div>
      )}
      {isError && (
        <p className="text-sm text-bear">Could not load API performance config — showing illustrative fallback.</p>
      )}

      <SectionCard title="Equity Curve" subtitle={illustrative ? "Illustrative composite — pending live QC feed" : "Live composite from verified sources"}>
        {illustrative && <IllustrativeChartNote />}
        <ResponsiveContainer width="100%" height={360} className="mt-4">
          <AreaChart data={chartData}>
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

      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Avg Monthly Return" value={fmt.pct(metrics.avgMonthlyReturn)} accent="up" />
          <StatCard label="Max Drawdown" value={fmt.pct(metrics.maxDrawdown)} accent="down" />
          <StatCard label="Win Rate" value={fmt.pct(metrics.winRate, 0)} />
          <StatCard label="Sharpe" value={metrics.sharpe.toFixed(2)} accent="up" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Monthly Returns" subtitle="Configured summary — update via CAPITAL_* env vars">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyReturns}>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.70 0.02 90)" fontSize={11} />
              <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
              <Bar dataKey="return" radius={[4, 4, 0, 0]} fill="oklch(0.78 0.13 85)" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {metrics && (
          <SectionCard title="Risk metrics">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard label="Max Drawdown" value={fmt.pct(metrics.maxDrawdown)} accent="down" />
              <StatCard label="Recovery Time" value={`${metrics.recoveryDays}d`} hint="To prior peak" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Sharpe" value={metrics.sharpe.toFixed(2)} />
              <StatCard label="Sortino" value={metrics.sortino.toFixed(2)} />
              <StatCard label="Profit Factor" value={metrics.profitFactor.toFixed(2)} accent="up" />
            </div>
          </SectionCard>
        )}
      </div>

      {strategies.length > 0 && (
        <SectionCard title="Live strategies" subtitle="Click through to QuantConnect listings">
          <div className="space-y-3">
            {strategies.map((s) => (
              <div key={s.slug} className="flex flex-wrap items-center gap-4 rounded-sm border border-border/60 bg-card/30 p-4">
                <div className="flex-1 min-w-[180px]">
                  <Link to="/strategies/$slug" params={{ slug: s.slug }} className="font-medium text-sm hover:text-gold">
                    {s.name}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-1">{s.platform} · {s.status}</div>
                </div>
                {s.metrics && (
                  <div className="text-xs text-muted-foreground font-mono">
                    Sharpe {s.metrics.sharpe?.toFixed(2)} · MDD {((s.metrics.maxDrawdown ?? 0) * 100).toFixed(1)}%
                  </div>
                )}
                <a
                  href={s.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                >
                  {s.hasDirectLink ? "View listing" : "QuantConnect"} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

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
          Set <code className="text-gold">QC_GOLD_MOMENTUM_URL</code> and <code className="text-gold">QC_FX_MEAN_REVERSION_URL</code> in Vercel for direct strategy links.
        </p>
      </SectionCard>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import {
  strategies, pipelineStages, platformDistribution, strategyUpdates, strategyOverview,
} from "@/lib/mock-data";
import { Lightbulb, FlaskConical, CheckCircle2, Rocket, Activity, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/strategies")({
  head: () => ({
    meta: [
      { title: "Strategies — Smart Algos Capital" },
      { name: "description", content: "Systematic strategies we research, validate, and deploy — with verified track records." },
    ],
  }),
  component: StrategiesPage,
});

const tabs = ["All Strategies", "Research Pipeline", "Platforms", "Updates"] as const;
type Tab = (typeof tabs)[number];

const pipelineIcons = [Lightbulb, FlaskConical, CheckCircle2, Rocket, Activity];

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing") return "bg-gold/15 text-gold";
  if (s === "Research") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function StrategiesPage() {
  const [tab, setTab] = useState<Tab>("All Strategies");

  return (
    <PageShell
      eyebrow="Strategy Library"
      title="Strategies"
      description="Systematic strategies we develop and validate. Live models will link to QuantConnect listings once those URLs are published."
      actions={
        <Link
          to="/portal"
          className="inline-flex items-center justify-center min-h-12 px-5 py-2.5 bg-gold text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-soft transition-colors"
        >
          Open client portal
        </Link>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Strategies" value={String(strategyOverview.live)} hint="QuantConnect" accent="up" />
        <StatCard label="In Research" value={String(strategyOverview.research)} />
        <StatCard label="Under Development" value={String(strategyOverview.development)} />
        <StatCard label="Platforms" value="4" hint="QC · C2 · MT5 · Internal" />
      </div>

      <div className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Client & investor portal</div>
          <h2 className="font-display text-2xl font-semibold">Allocations, sandbox, and downloads</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Sign in to monitor client-owned prop accounts, run cloud backtests, and download unlocked strategy files.
            Non-custodial — capital stays in accounts you control.
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center min-h-12 px-5 py-2.5 bg-gold text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-soft transition-colors shrink-0"
        >
          Enter portal
        </Link>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${tab === t ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "All Strategies" && (
          <SectionCard title="Strategy catalog" subtitle="Click a strategy for thesis, status, and verification links">
            <div className="space-y-3">
              {strategies.map((s) => (
                <Link
                  key={s.slug}
                  to="/strategies/$slug"
                  params={{ slug: s.slug }}
                  className="group flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card/30 p-4 hover:border-gold/40 transition"
                >
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-display text-base font-semibold group-hover:text-gold transition">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.summary}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.asset}</div>
                  <div className="text-xs text-muted-foreground">{s.platform}</div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                </Link>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "Research Pipeline" && (
          <SectionCard title="Research Pipeline" subtitle="Idea → Research → Validation → Deployment → Monitoring">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pipelineStages.map((p, i) => {
                const Icon = pipelineIcons[i];
                return (
                  <div key={p.stage} className="rounded-sm border border-border bg-card/30 p-5">
                    <Icon className="h-5 w-5 text-gold mb-3" />
                    <div className="font-mono text-2xl font-semibold">{p.count}</div>
                    <div className="font-display text-sm font-semibold mt-1">{p.stage}</div>
                    <div className="text-xs text-muted-foreground mt-1.5">{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {tab === "Platforms" && (
          <SectionCard title="Platform distribution" subtitle="Where strategies are deployed or planned">
            <div className="space-y-3">
              {platformDistribution.map((p) => (
                <div key={p.name} className="flex flex-wrap items-center gap-4 rounded-sm border border-border/60 bg-card/30 p-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-display text-base font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xl font-semibold">{p.count}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">strategies</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "Updates" && (
          <SectionCard title="Recent strategy updates" subtitle="Improvement logs and deployment changes">
            <div className="space-y-2">
              {strategyUpdates.map((u, i) => (
                <div key={i} className="flex items-start gap-3 rounded-sm border border-border/60 bg-card/30 px-4 py-3">
                  <Activity className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div className="flex-1 text-sm">{u.text}</div>
                  <span className="text-xs text-muted-foreground font-mono">{u.date}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
    </PageShell>
  );
}

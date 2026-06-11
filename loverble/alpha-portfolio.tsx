import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import {
  activeStrategies, pipelineStages, platformDistribution, strategyUpdates, strategyOverview,
} from "@/lib/mock-data";
import { Lightbulb, FlaskConical, CheckCircle2, Rocket, Activity } from "lucide-react";

export const Route = createFileRoute("/alpha-portfolio")({
  head: () => ({
    meta: [
      { title: "Alpha Portfolio — Smart Algos Capital" },
      { name: "description", content: "Showcase of our strategy portfolio — not a WorldQuant clone." },
    ],
  }),
  component: AlphaPortfolio,
});

const tabs = ["Active Strategies", "Research Pipeline", "Platform Distribution", "Recent Updates"] as const;
type Tab = (typeof tabs)[number];

const pipelineIcons = [Lightbulb, FlaskConical, CheckCircle2, Rocket, Activity];

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing") return "bg-gold/15 text-gold";
  if (s === "Research") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function AlphaPortfolio() {
  const [tab, setTab] = useState<Tab>("Active Strategies");

  return (
    <PageShell
      eyebrow="Strategy Portfolio"
      title="Alpha Portfolio"
      description="Our strategy portfolio — researched, validated, and deployed. We showcase alphas we develop; we do not run a factor factory."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Strategies" value={String(strategyOverview.live)} hint="QuantConnect" accent="up" />
        <StatCard label="In Research" value={String(strategyOverview.research)} />
        <StatCard label="Under Development" value={String(strategyOverview.development)} />
        <StatCard label="Platforms" value="4" hint="QC · C2 · MT5 · Internal" />
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

      {tab === "Active Strategies" && (
        <SectionCard title="Active Strategies" subtitle="Gold Momentum, FX Mean Reversion, and research pipeline">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Asset Class</th>
                  <th className="text-left py-2">Platform</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeStrategies.map((s) => (
                  <tr key={s.name} className="border-b border-border/40 hover:bg-card/30">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-muted-foreground">{s.asset}</td>
                    <td className="py-3 text-muted-foreground">{s.platform}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === "Research Pipeline" && (
        <SectionCard title="Research Pipeline" subtitle="Idea → Research → Validation → Deployment → Monitoring">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pipelineStages.map((p, i) => {
              const Icon = pipelineIcons[i];
              return (
                <div key={p.stage} className="rounded-sm border border-border bg-card/30 p-5 relative">
                  {i < pipelineStages.length - 1 && (
                    <span className="hidden lg:block absolute -right-3 top-1/2 text-muted-foreground">↓</span>
                  )}
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

      {tab === "Platform Distribution" && (
        <SectionCard title="Platform Distribution" subtitle="Where strategies are deployed or planned">
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

      {tab === "Recent Updates" && (
        <SectionCard title="Recent Strategy Updates" subtitle="Improvement logs and deployment changes">
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

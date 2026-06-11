import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { useState } from "react";
import { Lightbulb, FlaskConical, CheckCircle2, Activity, Check, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/alpha-factory")({
  head: () => ({ meta: [
    { title: "Strategy Marketplace — Smart Algos Capital" },
    { name: "description", content: "Subscribe to quantitative strategies developed by Smart Algos Capital. Signals, professional access and institutional licensing." },
  ] }),
  component: AlphaPortfolio,
});

const tabs = ["Subscriptions", "Active Strategies", "Strategy Performance", "Research Pipeline", "Strategy Access & Distribution"] as const;
type Tab = typeof tabs[number];

const strategies = [
  { name: "Gold Momentum Strategy", platform: "QuantConnect", status: "Live", asset: "Commodities", access: "Paid" },
  { name: "FX Mean Reversion", platform: "QuantConnect", status: "Live", asset: "Forex", access: "Paid" },
  { name: "Volatility Breakout", platform: "Internal Research", status: "Testing", asset: "Forex", access: "Preview" },
  { name: "Multi-Factor Equity Model", platform: "Internal Research", status: "Development", asset: "Equities", access: "Preview" },
  { name: "Gold Volatility Filter", platform: "Internal Research", status: "Research", asset: "Commodities", access: "Locked" },
];

const pipeline = [
  { stage: "Idea Generation", count: 6, desc: "New hypotheses sourced from market observation and literature." },
  { stage: "Research", count: 4, desc: "Statistical testing, feature engineering, signal exploration." },
  { stage: "Validation", count: 2, desc: "Out-of-sample testing, robustness checks, parameter stability." },
  { stage: "Live Monitoring", count: 2, desc: "Deployed on QuantConnect with ongoing performance review." },
];

const platforms = [
  { name: "QuantConnect", count: 2, desc: "Live algorithmic strategies in cloud backtest and paper trading.", cta: "Subscribe" },
  { name: "Internal Research", count: 3, desc: "Strategies under development and validation in-house.", cta: "Request Access" },
  { name: "Collective2", count: 0, desc: "Planned: signal publication for community subscribers.", cta: "Join Waitlist" },
  { name: "MT5", count: 0, desc: "Planned: forex execution for retail integration.", cta: "Join Waitlist" },
  { name: "Prop Firm Deployment", count: 0, desc: "Future: capital allocation through partner prop firms.", cta: "Join Waitlist" },
];

const updates = [
  { date: "Jun 2026", text: "Added Gold Volatility Filter to momentum strategy" },
  { date: "May 2026", text: "Improved position sizing model across active strategies" },
  { date: "May 2026", text: "New regime detection research initiated" },
  { date: "Apr 2026", text: "Strategy performance review completed" },
  { date: "Apr 2026", text: "QuantConnect listing updated for Gold Momentum" },
];

const tiers = [
  {
    name: "Signals",
    price: "$200",
    period: "/month",
    tagline: "Trade alerts from our live strategies",
    features: [
      "Real-time signals from 2 live strategies",
      "Entry, exit and position sizing",
      "Email + Telegram delivery",
      "Monthly performance report",
    ],
    cta: "Subscribe to Signals",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$500",
    period: "/month",
    tagline: "Full strategy logic + monthly research",
    features: [
      "Everything in Signals",
      "Full strategy logic & parameters",
      "Backtest code (QuantConnect / Python)",
      "Monthly 1-on-1 strategy review",
      "Early access to new strategies",
    ],
    cta: "Subscribe Professional",
    highlight: true,
  },
  {
    name: "Institutional",
    price: "Custom",
    period: "",
    tagline: "White-label licensing & co-development",
    features: [
      "All strategies, white-label rights",
      "Custom strategy development",
      "Dedicated research desk",
      "Direct execution integration",
      "Bespoke risk & reporting",
    ],
    cta: "Request Institutional Access",
    highlight: false,
  },
];

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function accessBadge(a: string) {
  if (a === "Paid") return <span className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-gold">Subscribers</span>;
  if (a === "Preview") return <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary">Preview · Free</span>;
  return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-muted/30 text-muted-foreground"><Lock className="h-2.5 w-2.5" /> Locked</span>;
}

function AlphaPortfolio() {
  const [tab, setTab] = useState<Tab>("Subscriptions");

  const subscribe = (name: string) => {
    toast.info(`${name} — checkout coming soon`, {
      description: "Payments are being set up. Join the waitlist via Contact in the meantime.",
    });
  };

  return (
    <PageShell
      eyebrow="Strategy Marketplace"
      title="Strategy Marketplace"
      description="Subscribe to quantitative strategies developed by Smart Algos Capital. Signals, professional access and institutional licensing — all backed by transparent research."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Subscription Tiers" value="3" hint="Signals · Pro · Institutional" />
        <StatCard label="Live Strategies" value="2" hint="On QuantConnect" accent="up" />
        <StatCard label="In Research" value="3" hint="Testing & development" />
        <StatCard label="Starting From" value="$200" hint="per month" />
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

      {tab === "Subscriptions" && (
        <SectionCard title="Subscription Tiers" subtitle="Monetize our research at the level that fits you">
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-lg border p-6 flex flex-col ${t.highlight ? "border-gold bg-gold/5" : "border-border bg-card/30"}`}
              >
                {t.highlight && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">Most Popular</div>
                )}
                <div className="font-display text-xl font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.tagline}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">{t.price}</span>
                  <span className="text-sm text-muted-foreground">{t.period}</span>
                </div>
                <ul className="mt-5 space-y-2 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribe(t.name)}
                  className={`mt-6 w-full rounded-sm px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${t.highlight ? "bg-gold text-primary-foreground hover:bg-gold-soft" : "border border-gold/60 text-gold hover:bg-gold/10"}`}
                >
                  {t.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 text-center">
            All subscriptions provide research-based strategy access. Past performance does not guarantee future results.
          </p>
        </SectionCard>
      )}

      {tab === "Active Strategies" && (
        <SectionCard title="Active Strategies" subtitle="Strategy overview is free. Full logic and signals require a subscription.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Strategy</th>
                  <th className="text-left py-2">Asset Class</th>
                  <th className="text-left py-2">Platform</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-center py-2">Access</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s) => (
                  <tr key={s.name} className="border-b border-border/40 hover:bg-card/30">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-muted-foreground">{s.asset}</td>
                    <td className="py-3 text-muted-foreground">{s.platform}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="py-3 text-center">{accessBadge(s.access)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === "Strategy Performance" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Avg Monthly Return" value="2.4%" hint="Live strategies, trailing 6m" accent="up" />
            <StatCard label="Max Drawdown" value="-6.8%" hint="Worst observed" accent="down" />
            <StatCard label="Win Rate" value="58%" hint="Trade-weighted" />
            <StatCard label="Live Track Record" value="9 mo" hint="Since deployment" />
          </div>
          <SectionCard title="Recent Strategy Updates" subtitle="Maintenance, research notes and deployment changes">
            <div className="space-y-2">
              {updates.map((u, i) => (
                <div key={i} className="flex items-start gap-3 rounded-sm border border-border/60 bg-card/30 px-4 py-3">
                  <Activity className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div className="flex-1 text-sm">{u.text}</div>
                  <span className="text-xs text-muted-foreground font-mono">{u.date}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      {tab === "Research Pipeline" && (
        <SectionCard title="Research Pipeline" subtitle="Structured strategy development process">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipeline.map((p, i) => {
              const Icon = [Lightbulb, FlaskConical, CheckCircle2, Activity][i];
              return (
                <div key={p.stage} className="rounded-sm border border-border bg-card/30 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-5 w-5 text-gold" />
                    <span className="font-mono text-2xl font-semibold">{p.count}</span>
                  </div>
                  <div className="font-display text-base font-semibold">{p.stage}</div>
                  <div className="text-xs text-muted-foreground mt-1.5">{p.desc}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {tab === "Strategy Access & Distribution" && (
        <SectionCard title="Strategy Access & Distribution" subtitle="Where strategies are deployed, listed, or planned — subscribe or join the waitlist.">
          <div className="space-y-3">
            {platforms.map((p) => (
              <div key={p.name} className="flex flex-wrap items-center gap-4 rounded-sm border border-border/60 bg-card/30 p-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-display text-base font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-semibold">{p.count}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">strategies</div>
                </div>
                <button
                  onClick={() => subscribe(p.name)}
                  className="rounded-sm border border-gold/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition"
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}

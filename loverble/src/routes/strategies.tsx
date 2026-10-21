import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell, SectionCard } from "@/components/page-shell";
import {
  strategies, pipelineStages, platformDistribution, strategyUpdates, getStrategyBySlug,
  type StrategyStatus,
} from "@/lib/mock-data";
import { hasDirectVerificationLink } from "@/lib/strategy-links";
import { Activity, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/strategies")({
  head: () => ({
    meta: [
      { title: "Strategies — Smart Algos Capital" },
      {
        name: "description",
        content:
          "Systematic strategies we research, validate, and deploy. Verification links appear when QuantConnect listings are public.",
      },
    ],
  }),
  component: StrategiesPage,
});

const sections = [
  { id: "catalog", label: "Catalog" },
  { id: "pipeline", label: "Pipeline" },
  { id: "platforms", label: "Platforms" },
  { id: "updates", label: "Changelog" },
] as const;

const STATUS_FILTERS = ["All", "Live", "Testing", "Research", "Development"] as const;
const MARKET_FILTERS = ["All", "Commodities", "Forex", "Equities", "Multi-Asset"] as const;

function statusTone(status: StrategyStatus, verified: boolean) {
  if (status === "Live") {
    return verified
      ? "bg-bull/15 text-bull border-bull/30"
      : "bg-muted/40 text-muted-foreground border-border";
  }
  if (status === "Testing") return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  if (status === "Research") return "bg-gold/15 text-gold border-gold/30";
  if (status === "Development") return "bg-primary/15 text-primary border-primary/30";
  return "bg-muted/30 text-muted-foreground border-border";
}

function statusLabel(status: StrategyStatus, verified: boolean) {
  if (status === "Live" && !verified) return "Deployed · link pending";
  return status;
}

function StrategiesPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [marketFilter, setMarketFilter] = useState<(typeof MARKET_FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      strategies.filter((s) => {
        if (statusFilter !== "All" && s.status !== statusFilter) return false;
        if (marketFilter !== "All" && s.asset !== marketFilter) return false;
        return true;
      }),
    [statusFilter, marketFilter],
  );

  const lastUpdated = strategyUpdates[0]?.date ?? "—";

  return (
    <PageShell
      eyebrow="Strategy library"
      title="Strategies"
      description="Systematic models we research and deploy. Public QuantConnect verification links appear in the catalog when listings are published — until then, Deployed does not mean independently verified."
    >
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground border-b border-border pb-4">
        <span>
          <span className="uppercase tracking-wider text-[10px] text-muted-foreground/80">Platforms</span>{" "}
          <span className="text-foreground">QuantConnect · Collective2 · MetaTrader 5 · Internal</span>
        </span>
        <span>
          <span className="uppercase tracking-wider text-[10px] text-muted-foreground/80">Last changelog</span>{" "}
          <span className="text-foreground">{lastUpdated}</span>
        </span>
        <span>
          <span className="uppercase tracking-wider text-[10px] text-muted-foreground/80">Verification</span>{" "}
          <span className="text-foreground">Pending public QC listings</span>
        </span>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-border" aria-label="On this page">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-gold border-b-2 border-transparent hover:border-gold/40 -mb-px outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="catalog" className="scroll-mt-24">
        <SectionCard title="Strategy catalog" subtitle="Open a row for thesis, universe, and verification status">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    statusFilter === f ? "bg-gold text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "Live" ? "Deployed" : f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {MARKET_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setMarketFilter(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    marketFilter === f ? "bg-secondary text-foreground border border-gold/40" : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Strategy</th>
                  <th className="py-2 pr-3 font-medium">Market</th>
                  <th className="py-2 pr-3 font-medium">Platform</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Live since</th>
                  <th className="py-2 font-medium">Verification</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const verified = hasDirectVerificationLink(s.slug);
                  return (
                    <tr key={s.slug} className="border-b border-border/50 hover:bg-card/40">
                      <td className="py-3 pr-3 align-top">
                        <Link
                          to="/strategies/$slug"
                          params={{ slug: s.slug }}
                          className="font-display font-semibold text-foreground hover:text-gold outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
                        >
                          {s.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          {s.timeframe && `${s.timeframe} · `}
                          {s.holdingPeriod}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5 max-w-sm line-clamp-2">{s.summary}</p>
                      </td>
                      <td className="py-3 pr-3 align-top text-muted-foreground whitespace-nowrap">{s.asset}</td>
                      <td className="py-3 pr-3 align-top text-muted-foreground whitespace-nowrap">{s.platform}</td>
                      <td className="py-3 pr-3 align-top">
                        <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusTone(s.status, verified)}`}>
                          {statusLabel(s.status, verified)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 align-top text-muted-foreground whitespace-nowrap">
                        {s.liveSince ?? "—"}
                      </td>
                      <td className="py-3 align-top">
                        {verified ? (
                          <a
                            href={s.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                          >
                            QC listing <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map((s) => {
              const verified = hasDirectVerificationLink(s.slug);
              return (
                <Link
                  key={s.slug}
                  to="/strategies/$slug"
                  params={{ slug: s.slug }}
                  className="block rounded-lg border border-border bg-card/30 p-4 hover:border-gold/40 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display font-semibold">{s.name}</div>
                    <span className={`shrink-0 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${statusTone(s.status, verified)}`}>
                      {statusLabel(s.status, verified)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{s.summary}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <span>{s.asset}</span>
                    <span>{s.platform}</span>
                    <span>{s.timeframe ?? "—"}</span>
                    <span>Since {s.liveSince ?? "—"}</span>
                    <span className="col-span-2">Verification: {verified ? "QC listing" : "Pending"}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">No strategies match these filters.</p>
          )}
        </SectionCard>
      </section>

      <section id="pipeline" className="scroll-mt-24">
        <SectionCard title="Research pipeline" subtitle="Catalog models by stage — internal idea backlog stays private">
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineStages.map((p, i) => (
              <li key={p.stage} className="rounded-sm border border-border bg-card/30 p-5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Step {i + 1}
                </div>
                <div className="font-display text-sm font-semibold">{p.stage}</div>
                <p className="text-xs text-muted-foreground mt-1.5">{p.desc}</p>
                <ul className="mt-3 space-y-1">
                  {p.strategySlugs.map((slug) => {
                    const strat = getStrategyBySlug(slug);
                    return (
                      <li key={slug}>
                        <Link
                          to="/strategies/$slug"
                          params={{ slug }}
                          className="text-xs text-gold hover:underline"
                        >
                          {strat?.name ?? slug}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </SectionCard>
      </section>

      <section id="platforms" className="scroll-mt-24">
        <SectionCard
          title="Platforms"
          subtitle="Where strategies are deployed or planned — QuantConnect, Collective2, MetaTrader 5, and internal research"
        >
          <div className="space-y-3">
            {platformDistribution.map((p) => (
              <div key={p.name} className="flex flex-wrap items-center gap-4 border-b border-border/50 pb-3 last:border-0">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-display text-base font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-semibold">{p.count}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">in catalog</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section id="updates" className="scroll-mt-24">
        <SectionCard title="Changelog" subtitle="Dated strategy changes — credibility over marketing">
          <div className="space-y-2">
            {strategyUpdates.map((u, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border/50 pb-3 last:border-0">
                <Activity className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <div className="flex-1 text-sm">{u.text}</div>
                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{u.date}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <div className="rounded-2xl border border-border bg-card/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Account access</div>
          <h2 className="font-display text-xl font-semibold">Client portal</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            Sign in for unlocked downloads and sandbox tools. Non-custodial — capital stays in accounts you control.
            Educational research and tools only; not a licensed investment adviser.
          </p>
        </div>
        <Link
          to="/portal"
          className="inline-flex items-center justify-center min-h-12 px-5 py-2.5 border border-gold/40 text-gold font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-gold/10 transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Enter portal
        </Link>
      </div>
    </PageShell>
  );
}

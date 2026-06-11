import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { getStrategyBySlug } from "@/lib/mock-data";
import { getStrategyVerificationUrl, hasDirectVerificationLink } from "@/lib/strategy-links";
import { ExternalLink, ArrowLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/strategies/$slug")({
  loader: ({ params }) => {
    const strategy = getStrategyBySlug(params.slug);
    if (!strategy) throw notFound();
    return strategy;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Strategy"} — Smart Algos Capital` },
      { name: "description", content: loaderData?.summary ?? "" },
    ],
  }),
  component: StrategyDetail,
});

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing" || s === "Research") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function StrategyDetail() {
  const strategy = Route.useLoaderData();

  return (
    <PageShell
      eyebrow="Strategy"
      title={strategy.name}
      description={strategy.summary}
      actions={
        <Link
          to="/strategies"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All strategies
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded border border-border bg-card/40">{strategy.asset}</span>
        <span className="text-xs px-2.5 py-1 rounded border border-border bg-card/40">{strategy.platform}</span>
        <span className={`text-xs px-2.5 py-1 rounded ${statusColor(strategy.status)}`}>{strategy.status}</span>
      </div>

      <SectionCard title="Thesis" subtitle="High-level strategy rationale">
        <p className="text-sm text-muted-foreground leading-relaxed">{strategy.thesis}</p>
      </SectionCard>

      <SectionCard title="Highlights">
        <ul className="space-y-2">
          {strategy.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </SectionCard>

      {strategy.status === "Live" && (
        <SectionCard title="Verification" subtitle="Third-party track record">
          <a
            href={getStrategyVerificationUrl(strategy.slug, strategy.verificationUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2.5 text-sm text-gold hover:bg-gold/10 transition"
          >
            {hasDirectVerificationLink(strategy.slug) ? "View QuantConnect listing" : `View on ${strategy.platform}`}{" "}
            <ExternalLink className="h-4 w-4" />
          </a>
          {!hasDirectVerificationLink(strategy.slug) && (
            <p className="text-xs text-muted-foreground mt-3">
              Set <code className="text-gold">QC_GOLD_MOMENTUM_URL</code> or <code className="text-gold">QC_FX_MEAN_REVERSION_URL</code> in Vercel for a direct listing link.
            </p>
          )}
        </SectionCard>
      )}

      {strategy.tier === "quant-pro" && (
        <SectionCard title="Full breakdown" subtitle="Quant Pro subscribers">
          <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold/5 p-4">
            <Lock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                Full rules summary, backtest report, and research notebook are available on the Quant Pro plan.
              </p>
              <Link to="/research" className="mt-3 inline-flex text-sm text-gold hover:underline">
                View subscription tiers →
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/performance"
          className="rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-card transition"
        >
          See performance
        </Link>
        <Link
          to="/consultation"
          className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
        >
          Book strategy review
        </Link>
      </div>
    </PageShell>
  );
}

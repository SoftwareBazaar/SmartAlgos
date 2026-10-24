import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { getStrategyBySlug, type Strategy } from "@/lib/mock-data";
import { getStrategyVerificationUrl, hasDirectVerificationLink } from "@/lib/strategy-links";
import { SPY_PSAR_SLUG } from "@/lib/spy-psar-strategy";
import { SpyPsarResults } from "@/components/strategies/spy-psar-results";
import { StrategyDownloadGate } from "@/components/strategies/strategy-download-gate";
import { ExternalLink, ArrowLeft, Download, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { hasLiveAccess } from "@/lib/subscription-access";

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
      { property: "og:title", content: `${loaderData?.name ?? "Strategy"} — Smart Algos Capital` },
      { property: "og:description", content: loaderData?.summary ?? "" },
      {
        property: "og:url",
        content: `https://www.smartalgosts.com/strategies/${loaderData?.slug ?? ""}`,
      },
    ],
  }),
  component: StrategyDetail,
});

function statusTone(strategy: Strategy, verified: boolean) {
  if (strategy.status === "Live") {
    return verified ? "bg-bull/15 text-bull" : "bg-muted/40 text-muted-foreground";
  }
  if (strategy.status === "Testing") return "bg-sky-500/15 text-sky-300";
  if (strategy.status === "Research") return "bg-gold/15 text-gold";
  return "bg-primary/15 text-primary";
}

function StrategyDetail() {
  const strategy = Route.useLoaderData() as Strategy;
  const { tier } = useSubscription();
  const liveUnlocked = hasLiveAccess(tier);
  const verified = hasDirectVerificationLink(strategy.slug);
  const statusText =
    strategy.status === "Live" && !verified ? "Deployed · verification link pending" : strategy.status;
  const isSpyFree = strategy.slug === SPY_PSAR_SLUG;

  return (
    <PageShell
      eyebrow="Strategy"
      title={strategy.name}
      description={strategy.summary}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {isSpyFree && (
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-sm bg-gold px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <Download className="h-3.5 w-3.5" /> Download pack
            </a>
          )}
          <Link
            to="/strategies"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All strategies
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded border border-border bg-card/40">{strategy.asset}</span>
        <span className="text-xs px-2.5 py-1 rounded border border-border bg-card/40">{strategy.platform}</span>
        <span className={`text-xs px-2.5 py-1 rounded ${statusTone(strategy, verified)}`}>{statusText}</span>
        {strategy.tier === "free" && (
          <span className="text-xs px-2.5 py-1 rounded border border-gold/40 text-gold">Free download</span>
        )}
        {strategy.liveSince && (
          <span className="text-xs px-2.5 py-1 rounded border border-border text-muted-foreground">
            Live since {strategy.liveSince}
          </span>
        )}
      </div>

      {isSpyFree && <StrategyDownloadGate />}

      <SectionCard title="Thesis" subtitle="High-level strategy rationale">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[70ch]">{strategy.thesis}</p>
      </SectionCard>

      <SectionCard title="Universe & frequency" subtitle="What professionals scan for — not the rule book">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Timeframe</dt>
            <dd className="mt-1 text-foreground">{strategy.timeframe ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Instruments</dt>
            <dd className="mt-1 text-foreground">{strategy.instruments ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Holding period</dt>
            <dd className="mt-1 text-foreground">{strategy.holdingPeriod ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk controls</dt>
            <dd className="mt-1 text-foreground">{strategy.riskControls ?? "—"}</dd>
          </div>
        </dl>
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

      {isSpyFree ? (
        <SectionCard title="Research results" subtitle="Published metrics · IS / OOS / regime windows">
          <SpyPsarResults />
        </SectionCard>
      ) : (
        <SectionCard title="Backtest vs live" subtitle="Kept separate on purpose">
          <p className="text-sm text-muted-foreground max-w-[70ch] leading-relaxed">
            {strategy.status === "Live"
              ? "This model is deployed. We will not publish blended backtest/live curves here. When a public QuantConnect listing exists, that link is the source of truth for live or paper performance."
              : "This model is not live. Any research numbers stay in notebooks until a published note or listing exists — nothing on this page is a verified track record."}
          </p>
        </SectionCard>
      )}

      {strategy.status === "Live" && (
        <SectionCard title="Verification" subtitle="Third-party track record">
          {verified ? (
            <a
              href={getStrategyVerificationUrl(strategy.slug, strategy.verificationUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2.5 text-sm text-gold hover:bg-gold/10 transition"
            >
              View QuantConnect listing <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground max-w-[70ch]">
              <p>
                Public QuantConnect listing URL is not published yet. The platform home link below is not a strategy
                verification page.
              </p>
              <a
                href="https://www.quantconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-gold hover:underline"
              >
                QuantConnect <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </SectionCard>
      )}

      {strategy.changelog && strategy.changelog.length > 0 && (
        <SectionCard title="Changelog" subtitle="Dated strategy changes">
          <ul className="space-y-2">
            {strategy.changelog.map((c) => (
              <li key={c.date + c.text} className="flex gap-3 text-sm border-b border-border/40 pb-2 last:border-0">
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{c.date}</span>
                <span className="text-muted-foreground">{c.text}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {strategy.status === "Live" && !liveUnlocked && (
        <SectionCard title="Access" subtitle="After a desk review">
          <div className="flex items-start gap-3 rounded-sm border border-gold/30 bg-gold/5 p-4">
            <Lock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                We are not selling a live signal feed yet. Book a desk session if you want a review or licensed file.
              </p>
              <Link
                to="/consultation"
                className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-gold text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
              >
                Book a desk session
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      {strategy.status === "Live" && liveUnlocked && (
        <SectionCard title="Subscriber access" subtitle="Rules summary and research context">
          <p className="text-sm text-muted-foreground">
            Your access is active. Full breakdown delivery via the portal is rolling out — check your account for updates.
          </p>
        </SectionCard>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          to="/performance"
          className="rounded-sm border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-card transition"
        >
          Track record status
        </Link>
        <Link
          to="/consultation"
          className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
        >
          Book a desk
        </Link>
      </div>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, FlaskConical, FileText, Brain } from "lucide-react";
import { strategies, company, getStrategyBySlug, strategyOverview } from "@/lib/mock-data";
import { SPY_PSAR_SLUG } from "@/lib/spy-psar-strategy";
import { HeroCinematic } from "@/components/hero-cinematic";
import { MotionHeroText } from "@/components/motion-reveal";
import { formatUsd, PRICING } from "@/lib/pricing";
import { PremiumBento } from "@/components/premium/premium-bento";
import { PremiumPricingShowcase } from "@/components/premium/premium-pricing";
import { StrategySpotlight } from "@/components/premium/strategy-spotlight";
import { HeroProofChart } from "@/components/premium/hero-proof-chart";
import { CountUpStat } from "@/components/premium/count-up-stat";
import { ShimmerButton } from "@/components/premium/shimmer-button";
import { MiniEquityStrip } from "@/components/premium/mini-equity-strip";
import { AdvisoryDeskSection } from "@/components/premium/advisory-desk";
import { ResearchLibrarySection } from "@/components/research-library-section";
import { CustomQuantSection } from "@/components/custom-quant-section";
import { CapitalDeskSection } from "@/components/capital-desk-section";
import { BacktestEngineSection } from "@/components/backtest-engine-section";

const featuredFree = getStrategyBySlug(SPY_PSAR_SLUG);
const featuredLive = getStrategyBySlug("fx-mean-reversion");

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${company.name} — Quantitative Research & Systematic Strategies` },
      { name: "description", content: "Quantitative research, systematic strategies, and verified performance. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
    ],
  }),
  component: Landing,
});

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing" || s === "Research") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function Landing() {
  const liveStrategies = strategies.filter((s) => s.status === "Live");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="hero-container relative pt-28 pb-10 md:pb-16 overflow-hidden bg-dominant">
        <HeroCinematic />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <MotionHeroText>
              <div className="hero-header-block">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-secondary-surface/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-bull" />
                  </span>
                  Research first · QuantConnect listings in progress
                </div>
                <p className="font-mono text-gold text-sm md:text-base font-semibold">
                  Free pack · {featuredFree?.name ?? "SPY Parabolic SAR"} · Sharpe{" "}
                  {featuredFree?.liveSharpe?.toFixed(2) ?? "1.20"}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Plus deployed models · QC listings pending
                </p>
                <h1 className="mt-4 font-display text-hero-display gold-headline-shimmer">
                  Research and strategies you can independently verify
                </h1>
                <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
                  <span className="text-foreground font-medium">{company.name}</span> publishes a free SPY research pack with real backtest metrics, and deploys live models like{" "}
                  {featuredLive?.name ?? "FX Mean Reversion"} — track records when listings are public, not marketing curves.
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{company.operator}</p>
              </div>
              <div className="hero-cta-group mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 max-w-lg">
                <ShimmerButton
                  to="/strategies/$slug"
                  params={{ slug: SPY_PSAR_SLUG }}
                  hash="download"
                  variant="primary"
                  className="btn-primary w-full sm:w-auto min-h-12"
                >
                  <Download className="h-4 w-4" /> Free strategy pack
                </ShimmerButton>
                <ShimmerButton to="/strategies" variant="outline" className="btn-secondary w-full sm:w-auto min-h-12">
                  View all strategies <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Email unlock · Python + metrics · No curve-fitting theatre
              </p>
            </MotionHeroText>
            <MotionHeroText>
              <div className="hero-chart chart-container hidden lg:block">
                <HeroProofChart />
              </div>
            </MotionHeroText>
          </div>
        </div>
      </section>

      <section className="hero-metrics-grid border-y border-border bg-secondary-surface/80">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat
            label="Live strategies"
            value={strategyOverview.live}
            hint="In catalog — QC listings pending"
          />
          <CountUpStat
            label="In research"
            value={strategyOverview.research}
            hint="Active investigations"
          />
          <CountUpStat
            label="Testing"
            value={strategyOverview.testing}
            hint="Out-of-sample / paper"
          />
          <CountUpStat
            label="Development"
            value={strategyOverview.development}
            hint="Early build"
          />
        </div>
      </section>

      <section className="lg:hidden px-6 py-8 bg-dominant">
        <div className="chart-container">
          <HeroProofChart />
        </div>
      </section>

      <section id="strategies" className="py-20 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Strategies</div>
              <h2 className="font-display text-section-title text-3xl md:text-4xl">Free pack and live models</h2>
              <p className="mt-2 text-muted-foreground max-w-lg">
                Download the published SPY research pack, then review deployed FX and gold models. Verified returns appear when QuantConnect listings are public.
              </p>
            </div>
            <Link to="/strategies" className="text-sm text-gold hover:underline cursor-pointer">
              Full catalog →
            </Link>
          </div>

          {featuredFree && (
            <Link
              to="/strategies/$slug"
              params={{ slug: featuredFree.slug }}
              hash="download"
              className="mb-6 flex flex-col lg:flex-row lg:items-center gap-5 rounded-xl border border-gold/40 bg-secondary-surface/70 p-5 md:p-7 hover:border-gold/60 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Free research pack</p>
                <h3 className="font-display text-2xl font-semibold">{featuredFree.name}</h3>
                <p className="text-sm text-muted-foreground max-w-[65ch]">{featuredFree.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-5 shrink-0">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sharpe</div>
                  <div className="font-mono text-2xl font-semibold text-gold tabular-nums">
                    {featuredFree.liveSharpe?.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CAGR</div>
                  <div className="font-mono text-2xl font-semibold text-bull tabular-nums">
                    +{((featuredFree.liveReturn ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Max DD</div>
                  <div className="font-mono text-2xl font-semibold text-bear tabular-nums">
                    {((featuredFree.liveMaxDrawdown ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  <Download className="h-3.5 w-3.5" /> View & download
                </span>
              </div>
            </Link>
          )}

          <StrategySpotlight
            strategies={liveStrategies}
            statusColor={statusColor}
          />
        </div>
      </section>

      <MiniEquityStrip />

      <section className="py-20 border-t border-border bg-secondary-surface/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">How it works</div>
            <h2 className="font-display text-section-title text-3xl md:text-4xl">Research → Strategies → Subscribe</h2>
          </div>
          <PremiumBento
            items={[
              { icon: FileText, title: "Research", items: ["Free previews", `${formatUsd(PRICING.researchFull)}/report unlock`, "Notebooks & PDF archive"], link: "/research" },
              { icon: FlaskConical, title: "Strategies", items: ["Live models — $149.99 retail", "Institutional — $499.99", "QuantConnect verification"], link: "/strategies" },
              { icon: Brain, title: "Strategy Desk", items: ["Free 20-min intro", "Launch deep-dive pricing", "Stocks · Futures · FX · Commodities"], link: "/consultation" },
            ]}
          />
        </div>
      </section>

      <ResearchLibrarySection />
      <CustomQuantSection />
      <PremiumPricingShowcase />
      <CapitalDeskSection />
      <BacktestEngineSection />
      <AdvisoryDeskSection />
    </div>
  );
}

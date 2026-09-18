import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FileText, Brain } from "lucide-react";
import { strategies, company, PORTFOLIO_METRICS, getStrategyBySlug, fmt } from "@/lib/mock-data";
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
                <p className="font-mono text-bull text-lg md:text-xl font-semibold tabular-nums">
                  {featuredLive?.name ?? "FX Mean Reversion"}: +{fmt.pct(featuredLive?.liveReturn ?? 0.314, 1)} since live
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Same model shown in chart
                </p>
                <h1 className="mt-4 font-display text-hero-display gold-headline-shimmer">
                  Systematic performance you can independently verify
                </h1>
                <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
                  <span className="text-foreground font-medium">{company.name}</span> publishes quant research and deploys live models with third-party track records — not marketing curves.
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{company.operator}</p>
              </div>
              <div className="hero-cta-group mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 max-w-md">
                <ShimmerButton href="/research/building-a-quantitative-track-record" variant="primary" className="btn-primary w-full sm:w-auto min-h-12">
                  Read the free note <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
                <ShimmerButton to="/strategies" variant="outline" className="btn-secondary w-full sm:w-auto min-h-12">
                  View live models
                </ShimmerButton>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                QuantConnect listings in progress · No dynamic curve-fitting
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
            label="Portfolio Sharpe"
            value={PORTFOLIO_METRICS.sharpe}
            decimals={2}
            hint="Risk-adjusted return across live book"
          />
          <CountUpStat
            label="Live strategies"
            value={PORTFOLIO_METRICS.liveStrategies}
            hint="Two live models on the desk — permalinks pending"
          />
          <CountUpStat
            label="Max drawdown"
            value={Math.abs(PORTFOLIO_METRICS.maxDrawdown * 100)}
            prefix="-"
            suffix="%"
            decimals={1}
            hint="Peak-to-trough on deployed models"
          />
          <CountUpStat
            label="Win rate"
            value={PORTFOLIO_METRICS.winRate * 100}
            suffix="%"
            decimals={0}
            hint={`Profit factor ${PORTFOLIO_METRICS.profitFactor}`}
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
              <h2 className="font-display text-section-title text-3xl md:text-4xl">Live systematic models</h2>
              <p className="mt-2 text-muted-foreground max-w-lg">Each card shows verified return and risk — click through for thesis and subscription.</p>
            </div>
            <Link to="/strategies" className="text-sm text-gold hover:underline cursor-pointer">Full catalog →</Link>
          </div>
          <StrategySpotlight strategies={liveStrategies} statusColor={statusColor} />
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
              { icon: Brain, title: "Strategy desk", items: ["90-min guide — $7.99", "Stocks · Futures · FX · Commodities", "Free question booking"], link: "/consultation" },
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

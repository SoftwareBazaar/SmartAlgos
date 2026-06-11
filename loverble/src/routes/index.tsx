import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FileText, Brain } from "lucide-react";
import { strategyOverview, strategies, company, performanceMetrics, getStrategyBySlug, fmt } from "@/lib/mock-data";
import { DonateButton } from "@/components/donate-button";
import { HeroCinematic } from "@/components/hero-cinematic";
import { MotionHeroText } from "@/components/motion-reveal";
import { formatUsd, PRICING } from "@/lib/pricing";
import { PremiumBento } from "@/components/premium/premium-bento";
import { PremiumPricingShowcase } from "@/components/premium/premium-pricing";
import { StrategySpotlight } from "@/components/premium/strategy-spotlight";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";
import { HeroProofChart } from "@/components/premium/hero-proof-chart";
import { CountUpStat } from "@/components/premium/count-up-stat";
import { ShimmerButton } from "@/components/premium/shimmer-button";
import { StickyNav } from "@/components/premium/sticky-nav";
import { MiniEquityStrip } from "@/components/premium/mini-equity-strip";
import { AdvisoryDeskSection } from "@/components/premium/advisory-desk";
import { BrandLogo } from "@/components/brand-logo";

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

const nav = [
  { label: "Research", to: "/research" },
  { label: "Strategies", to: "/strategies" },
  { label: "Performance", to: "/performance" },
  { label: "Consultation", to: "/consultation" },
  { label: "About", to: "/about" },
] as const;

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
      <StickyNav>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3 md:py-4">
          <Link to="/" className="flex items-center cursor-pointer shrink-0">
            <BrandLogo variant="nav" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-foreground transition duration-200 cursor-pointer">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/consultation" className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition duration-200 cursor-pointer">
              Book Desk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </StickyNav>

      <section className="relative min-h-[92vh] pt-28 pb-16 md:pb-20 overflow-hidden flex items-center bg-dominant">
        <HeroCinematic />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <MotionHeroText>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-secondary-surface/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-bull" />
                </span>
                Independently verified · QuantConnect
              </div>
              <p className="font-mono text-bull text-lg md:text-xl font-semibold tabular-nums">
                {featuredLive?.name ?? "FX Mean Reversion"}: +{fmt.pct(featuredLive?.liveReturn ?? 0.314, 1)} since live
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Same model shown in chart →
              </p>
              <h1 className="mt-4 font-display text-hero-display gold-headline-shimmer">
                Systematic performance you can verify
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
                <span className="text-foreground font-medium">{company.name}</span> publishes quant research and deploys live models with third-party track records — not marketing curves.
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{company.operator}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ShimmerButton to="/strategies" variant="primary">
                  View live models <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
                <ShimmerButton to="/research" variant="outline">
                  Research library
                </ShimmerButton>
              </div>
            </MotionHeroText>
            <MotionHeroText>
              <HeroProofChart />
            </MotionHeroText>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary-surface/80">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat
            label="Portfolio Sharpe"
            value={performanceMetrics.sharpe}
            decimals={2}
            hint="Risk-adjusted return across live book"
          />
          <CountUpStat
            label="Live strategies"
            value={strategyOverview.live}
            hint="Both independently verified on QuantConnect"
          />
          <CountUpStat
            label="Max drawdown"
            value={Math.abs(performanceMetrics.maxDrawdown * 100)}
            suffix="%"
            decimals={1}
            hint="Peak-to-trough on deployed models"
          />
          <CountUpStat
            label="Win rate"
            value={performanceMetrics.winRate * 100}
            suffix="%"
            decimals={0}
            hint={`Profit factor ${performanceMetrics.profitFactor}`}
          />
        </div>
      </section>

      <section className="py-20">
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
              { icon: Brain, title: "Strategy desk", items: ["Quant advisory sessions", "System design review", "Implementation guidance"], link: "/consultation" },
            ]}
          />
        </div>
      </section>

      <PremiumPricingShowcase />

      <AdvisoryDeskSection />

      <footer className="border-t-2 border-border bg-dominant mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            <div className="max-w-sm">
              <BrandLogo variant="footer" className="opacity-90" />
              <p className="text-sm text-muted-foreground mt-2">{company.operator}</p>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Quantitative research and systematic strategies. Performance figures reference third-party verification where noted; past results are not indicative of future returns.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-muted-foreground hover:text-gold transition cursor-pointer">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hairline my-8" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">© 2026 {company.operator}. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-4">
              <span>Not investment advice · Kenya</span>
              <DonateButton footer />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

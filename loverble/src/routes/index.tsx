import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FileText, Brain, Building2 } from "lucide-react";
import { strategyOverview, strategies, company, performanceMetrics } from "@/lib/mock-data";
import { DonateButton } from "@/components/donate-button";
import { HeroCinematic } from "@/components/hero-cinematic";
import { MotionHeroText } from "@/components/motion-reveal";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { PremiumBento } from "@/components/premium/premium-bento";
import { PremiumPricingShowcase } from "@/components/premium/premium-pricing";
import { StrategySpotlight } from "@/components/premium/strategy-spotlight";
import { GlowCard } from "@/components/premium/glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";
import { HeroProofChart } from "@/components/premium/hero-proof-chart";
import { CountUpStat } from "@/components/premium/count-up-stat";
import { ShimmerButton } from "@/components/premium/shimmer-button";
import { StickyNav } from "@/components/premium/sticky-nav";
import { MiniEquityStrip } from "@/components/premium/mini-equity-strip";

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
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-gold text-primary-foreground">
              <span className="font-display text-lg font-bold">S</span>
            </div>
            <div>
              <div className="font-display text-base font-semibold leading-none">SMART ALGOS</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">Capital</div>
            </div>
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
                FX Mean Reversion: +31.4% since live
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
              { icon: FileText, title: "Research", items: ["Free previews", "Methodology access", "Notebooks & PDF archive"], link: "/research" },
              { icon: FlaskConical, title: "Strategies", items: ["Live models — $149.99 retail", "Institutional — $499.99", "QuantConnect verification"], link: "/strategies" },
              { icon: Brain, title: "Strategy desk", items: ["Quant advisory sessions", "System design review", "Implementation guidance"], link: "/consultation" },
            ]}
          />
        </div>
      </section>

      <PremiumPricingShowcase />

      <section className="py-20 border-t border-border bg-dominant">
        <div className="max-w-[1400px] mx-auto px-6">
          <MotionReveal className="max-w-xl mx-auto">
            <MotionItem>
              <GlowCard accent className="p-8">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Strategy desk</div>
                <h2 className="font-display text-section-title text-2xl md:text-3xl">Book a quant advisory session</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  30-minute strategy review with our research desk. Session fee {formatUsd(PRICING.consultation)} secures your slot via Paystack.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Live strategy subscriptions ({formatUsd(PRICING.liveRetail)} retail / {formatUsd(PRICING.liveInstitutional)} institutional) include ongoing model access and verification.
                </p>
                <div className="mt-6">
                  <CheckoutForm
                    productType="consultation"
                    productId="consultation"
                    amountUsd={PRICING.consultation}
                    label={`Book session — ${formatUsd(PRICING.consultation)} via Paystack`}
                  />
                </div>
                <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
                  View advisory services →
                </Link>
              </GlowCard>
            </MotionItem>
          </MotionReveal>
        </div>
      </section>

      <footer className="border-t border-border bg-secondary-surface/60">
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="font-display text-sm font-semibold">{company.operator}</div>
              <p className="text-xs text-muted-foreground mt-2">Quantitative research & systematic strategies</p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-gold transition cursor-pointer">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="hairline my-6" />
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© 2026 {company.operator}</span>
            <DonateButton footer />
          </div>
        </div>
      </footer>
    </div>
  );
}

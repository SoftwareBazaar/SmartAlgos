import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, Download, FlaskConical, FileText, Brain, Shield, Wallet } from "lucide-react";
import { strategies, company, getStrategyBySlug, strategyOverview } from "@/lib/mock-data";
import { SPY_PSAR_SLUG } from "@/lib/spy-psar-strategy";
import { MotionHeroText } from "@/components/motion-reveal";
import { formatUsd, PRICING } from "@/lib/pricing";
import { PremiumBento } from "@/components/premium/premium-bento";
import { PremiumPricingShowcase } from "@/components/premium/premium-pricing";
import { StrategySpotlight } from "@/components/premium/strategy-spotlight";
import { HeroTelemetry } from "@/components/premium/hero-telemetry";
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
      { title: `${company.name} — Financial Systems & Quantitative Research` },
      {
        name: "description",
        content:
          "Enterprise financial technology and transparent quantitative research. Operated by Smart Algos Investment Solution Ltd (Kenya).",
      },
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
      <section className="hero-container relative pt-24 pb-14 md:pb-20 overflow-hidden bg-dominant">
        <div className="relative z-10 max-w-[1160px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <MotionHeroText>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-gold mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_14px_rgb(245_158_11_/_0.7)]" />
                FINANCIAL TECHNOLOGY · SYSTEMATIC RESEARCH
              </div>
              <h1 className="font-display text-hero-display text-foreground">
                Next-generation
                <br />
                <span className="hero-title-accent">financial systems</span>
                <br />
                <span className="text-white">&amp; quantitative architecture.</span>
              </h1>
              <p className="mt-5 text-base text-muted-foreground max-w-xl leading-relaxed">
                Modern financial infrastructure and transparent quantitative research, designed for institutions and
                teams building for what&apos;s next.
              </p>
              <div className="hero-cta-group mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 max-w-lg">
                <ShimmerButton to="/systems" variant="primary" className="btn-primary w-full sm:w-auto min-h-12">
                  Explore financial systems <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
                <ShimmerButton to="/strategies" variant="outline" className="btn-secondary w-full sm:w-auto min-h-12">
                  Visit the quant lab <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
              </div>
              <p className="mt-4 text-[10px] text-muted-foreground">Technology and research. Not financial advice.</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{company.operator}</p>
            </MotionHeroText>
            <MotionHeroText>
              <div className="hidden lg:block">
                <HeroTelemetry />
              </div>
            </MotionHeroText>
          </div>
        </div>
      </section>

      <section className="lg:hidden px-6 py-8 bg-dominant">
        <HeroTelemetry />
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">ONE PLATFORM · TWO DISCIPLINES</p>
              <h2 className="mt-2 font-display text-section-title text-2xl md:text-4xl">Technology for the real world.</h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              Practical financial software and careful quantitative work, under one roof.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <article className="surface-card rounded-[var(--radius)] p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">PILLAR 01</span>
              </div>
              <h3 className="font-display text-xl font-semibold">Enterprise financial systems</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Core ledgers, member and loan workflows, payment connections, and operational controls for financial
                institutions.
              </p>
              <div className="mt-5 mb-6 flex flex-wrap gap-2">
                {["Core banking", "Payment rails", "Risk & compliance"].map((t) => (
                  <span key={t} className="rounded-full border border-border px-2.5 py-1 text-[9px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <Link to="/systems" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore financial systems <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
            <article className="surface-card rounded-[var(--radius)] p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">PILLAR 02</span>
              </div>
              <h3 className="font-display text-xl font-semibold">Quantitative research lab</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Systematic strategy research, reproducible backtests, and a transparent approach to verification and
                risk.
              </p>
              <div className="mt-5 mb-6 flex flex-wrap gap-2">
                {["Strategy research", "Backtesting", "Risk frameworks"].map((t) => (
                  <span key={t} className="rounded-full border border-border px-2.5 py-1 text-[9px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
              <Link to="/strategies" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore the quant lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section-muted py-16 md:py-20">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">CAPABILITIES</p>
              <h2 className="mt-2 font-display text-section-title text-2xl md:text-4xl">
                From operating systems to research systems.
              </h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              Start with the problem your team is solving. Scope and delivery depend on your requirements.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <section className="surface-card rounded-[var(--radius)] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[9px] tracking-wider text-muted-foreground">FINANCIAL SYSTEMS</p>
                  <h3 className="font-display text-base font-semibold">Infrastructure that connects.</h3>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <article className="sm:col-span-2 grid sm:grid-cols-[1fr_0.8fr] gap-3 rounded-lg border border-border bg-black/25 p-3.5 bg-gradient-to-br from-gold/10 to-transparent">
                  <div>
                    <p className="font-mono text-[8px] text-muted-foreground">01 · ARCHITECTURE</p>
                    <h4 className="mt-1 text-xs font-semibold">Core banking &amp; ledger</h4>
                    <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                      Member, deposit, loan, and account workflows built around clear operating rules.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-black/30 px-2 py-2 font-mono text-[7px] text-gold-soft">
                    <span className="rounded border border-gold/25 px-1.5 py-1">MEMBERS</span>
                    <i className="h-px w-2 bg-gold" />
                    <span className="rounded border border-gold/25 px-1.5 py-1">LEDGER</span>
                    <i className="h-px w-2 bg-gold" />
                    <span className="rounded border border-gold/25 px-1.5 py-1">REPORTS</span>
                  </div>
                </article>
                <article className="rounded-lg border border-border bg-black/25 p-3.5">
                  <Wallet className="h-5 w-5 text-gold mb-2" />
                  <p className="font-mono text-[8px] text-muted-foreground">02 · CONNECTIVITY</p>
                  <h4 className="mt-1 text-xs font-semibold">Payments &amp; open banking</h4>
                  <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                    Integration planning for mobile money, cards, and banking interfaces.
                  </p>
                </article>
                <article className="rounded-lg border border-border bg-black/25 p-3.5">
                  <Shield className="h-5 w-5 text-gold mb-2" />
                  <p className="font-mono text-[8px] text-muted-foreground">03 · CONTROLS</p>
                  <h4 className="mt-1 text-xs font-semibold">Risk &amp; compliance</h4>
                  <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                    Identity, monitoring, compliance, and operational safeguards.
                  </p>
                </article>
              </div>
              <Link to="/systems" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore financial systems <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>

            <section className="surface-card rounded-[var(--radius)] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-mono text-[9px] tracking-wider text-muted-foreground">QUANTITATIVE RESEARCH</p>
                  <h3 className="font-display text-base font-semibold">Research that shows its work.</h3>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <article className="sm:col-span-2 grid sm:grid-cols-[1fr_0.8fr] gap-3 rounded-lg border border-border bg-black/25 p-3.5 bg-gradient-to-br from-gold/10 to-transparent">
                  <div>
                    <p className="font-mono text-[8px] text-muted-foreground">01 · METHODOLOGY</p>
                    <h4 className="mt-1 text-xs font-semibold">Strategy research</h4>
                    <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                      Testable hypotheses, documented data, and a transparent research process.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-black/30 px-2 py-2 font-mono text-[7px] text-gold-soft">
                    <span className="rounded border border-gold/25 px-1.5 py-1">HYPOTHESIS</span>
                    <i className="h-px w-2 bg-gold" />
                    <span className="rounded border border-gold/25 px-1.5 py-1">TEST</span>
                    <i className="h-px w-2 bg-gold" />
                    <span className="rounded border border-gold/25 px-1.5 py-1">REVIEW</span>
                  </div>
                </article>
                <article className="rounded-lg border border-border bg-black/25 p-3.5">
                  <Code2 className="h-5 w-5 text-gold mb-2" />
                  <p className="font-mono text-[8px] text-muted-foreground">02 · REPRODUCIBILITY</p>
                  <h4 className="mt-1 text-xs font-semibold">Transparent testing</h4>
                  <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                    Make assumptions, costs, and out-of-sample checks easy to inspect.
                  </p>
                </article>
                <article className="rounded-lg border border-border bg-black/25 p-3.5">
                  <FileText className="h-5 w-5 text-gold mb-2" />
                  <p className="font-mono text-[8px] text-muted-foreground">03 · EVIDENCE</p>
                  <h4 className="mt-1 text-xs font-semibold">Risk &amp; verification</h4>
                  <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                    Document exposure controls and the evidence status of each result.
                  </p>
                </article>
              </div>
              <Link to="/strategies" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore the research lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </div>
        </div>
      </section>

      <section className="section-muted py-16">
        <div className="max-w-[1160px] mx-auto px-6 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] text-gold">A CLEAR STARTING POINT</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">Find the right conversation.</h2>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed max-w-md">
              Choose the challenge that best describes your team. We&apos;ll help you take it from there.
            </p>
          </div>
          <div className="grid gap-2.5">
            <Link
              to="/consultation"
              search={{ track: "systems" }}
              className="rounded-[var(--radius)] border border-border bg-card/60 px-4 py-4 hover:border-gold hover:bg-navy-light transition"
            >
              <span className="font-mono text-[9px] text-muted-foreground">For banks, SACCOs &amp; fintech teams</span>
              <strong className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold">
                Plan your financial architecture <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
              </strong>
            </Link>
            <Link
              to="/consultation"
              search={{ track: "quant" }}
              className="rounded-[var(--radius)] border border-border bg-card/60 px-4 py-4 hover:border-gold hover:bg-navy-light transition"
            >
              <span className="font-mono text-[9px] text-muted-foreground">For researchers, funds &amp; trading teams</span>
              <strong className="mt-2 flex items-center justify-between gap-3 text-sm font-semibold">
                Discuss strategy engineering <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
              </strong>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-[1160px] mx-auto px-6 grid md:grid-cols-[0.7fr_1.1fr_auto] gap-6 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] text-gold">BUILT AROUND TRUST</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Clear by design.</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We distinguish research from verified performance and concepts from production integrations.
            Payment-security and custody claims require verification; we do not hold client funds.
          </p>
          <Link to="/performance" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft whitespace-nowrap">
            Read our verification policy <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="hero-metrics-grid border-y border-border bg-secondary-surface/80">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CountUpStat label="Live strategies" value={strategyOverview.live} hint="In catalog — QC listings pending" />
          <CountUpStat label="In research" value={strategyOverview.research} hint="Active investigations" />
          <CountUpStat label="Testing" value={strategyOverview.testing} hint="Out-of-sample / paper" />
          <CountUpStat label="Development" value={strategyOverview.development} hint="Early build" />
        </div>
      </section>

      <section id="strategies" className="py-20 scroll-mt-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Strategies</div>
              <h2 className="font-display text-section-title text-3xl md:text-4xl">Free pack and live models</h2>
              <p className="mt-2 text-muted-foreground max-w-lg">
                Download the published SPY research pack, then review deployed FX and gold models. Verified returns
                appear when QuantConnect listings are public.
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
                  <Download className="h-3.5 w-3.5" /> View &amp; download
                </span>
              </div>
            </Link>
          )}

          <StrategySpotlight strategies={liveStrategies} statusColor={statusColor} />
          {featuredLive && (
            <p className="mt-4 text-xs text-muted-foreground">
              Featured live model: {featuredLive.name} — QC listing pending.
            </p>
          )}
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
              {
                icon: FileText,
                title: "Research",
                items: ["Free previews", `${formatUsd(PRICING.researchFull)}/report unlock`, "Notebooks & PDF archive"],
                link: "/research",
              },
              {
                icon: FlaskConical,
                title: "Strategies",
                items: ["Live models — $149.99 retail", "Institutional — $499.99", "QuantConnect verification"],
                link: "/strategies",
              },
              {
                icon: Brain,
                title: "Strategy Desk",
                items: ["Free 20-min intro", "Systems or quant tracks", "Architecture & research reviews"],
                link: "/consultation",
              },
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

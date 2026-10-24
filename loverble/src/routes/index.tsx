import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { company } from "@/lib/mock-data";
import { MotionHeroText } from "@/components/motion-reveal";
import { HeroTelemetry } from "@/components/premium/hero-telemetry";
import { ShimmerButton } from "@/components/premium/shimmer-button";

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

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="hero-container relative pt-24 pb-12 md:pb-16 overflow-hidden bg-dominant">
        <div className="relative z-10 max-w-[1160px] mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <MotionHeroText>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-gold mb-4">
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
              <p className="mt-4 text-sm md:text-[15px] text-muted-foreground max-w-lg leading-relaxed">
                Engineering resilient core banking software for banks and SACCOs, alongside verifiable systematic
                trading models.
              </p>
              <div className="hero-cta-group mt-7 flex flex-col sm:flex-row gap-3 max-w-xl">
                <ShimmerButton
                  to="/systems"
                  variant="primary"
                  className="btn-primary w-full sm:w-auto min-h-11 px-5 text-[11px]"
                >
                  Explore financial systems <ArrowRight className="h-3.5 w-3.5" />
                </ShimmerButton>
                <ShimmerButton
                  to="/strategies"
                  variant="outline"
                  className="btn-secondary w-full sm:w-auto min-h-11 px-5 text-[11px]"
                >
                  Visit the quant lab <ArrowRight className="h-3.5 w-3.5" />
                </ShimmerButton>
              </div>
              <p className="mt-4 text-[10px] text-muted-foreground">Technology and research. Not financial advice.</p>
            </MotionHeroText>
            <MotionHeroText>
              <div className="hidden lg:block">
                <HeroTelemetry />
              </div>
            </MotionHeroText>
          </div>
        </div>
      </section>

      <section className="lg:hidden px-6 pb-8 bg-dominant">
        <HeroTelemetry />
      </section>

      <section className="py-14 md:py-16 border-t border-border/40">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-[0.12em] text-gold">TWO DOORS · ONE PLATFORM</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold tracking-tight">
              Choose your workspace.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Bank and SACCO teams enter financial systems. Researchers and traders enter the quant lab. Details live on
              each door — not on this page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Link
              to="/systems"
              className="group surface-card rounded-[var(--radius)] p-7 border border-border hover:border-gold/50 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <BookOpen className="h-5 w-5" />
                </span>
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">DOOR 01</span>
              </div>
              <h3 className="font-display text-xl font-semibold group-hover:text-gold transition-colors">
                Enterprise financial systems
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  Core banking &amp; SACCO ledgers
                </li>
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  Payments, M-Pesa &amp; open banking
                </li>
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  AML/KYC risk &amp; compliance modules
                </li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                Explore financial systems <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              to="/strategies"
              className="group surface-card rounded-[var(--radius)] p-7 border border-border hover:border-gold/50 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <FlaskConical className="h-5 w-5" />
                </span>
                <span className="font-mono text-[9px] tracking-wider text-muted-foreground">DOOR 02</span>
              </div>
              <h3 className="font-display text-xl font-semibold group-hover:text-gold transition-colors">
                Quantitative strategies lab
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  Live FX, SPY &amp; gold models
                </li>
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  Research packs, metrics &amp; subscriptions
                </li>
                <li className="flex gap-2">
                  <span className="text-gold mt-1">—</span>
                  QuantConnect verification when listings go public
                </li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                Enter quant lab <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="rounded-[var(--radius)] border border-border/70 bg-secondary-surface/40 px-5 py-5 md:px-7 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] tracking-[0.14em] text-gold">OPERATED BY</p>
              <p className="mt-1 text-sm font-medium text-foreground">{company.operator}</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xl leading-relaxed">
                Non-custodial by design. We distinguish research from verified performance. Educational technology and
                research — not investment advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/about"
                className="inline-flex min-h-10 items-center rounded-[var(--radius)] border border-border px-4 text-xs font-semibold hover:border-gold/50 hover:text-gold transition"
              >
                About
              </Link>
              <Link
                to="/consultation"
                className="inline-flex min-h-10 items-center rounded-[var(--radius)] bg-gold px-4 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
              >
                Strategy desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

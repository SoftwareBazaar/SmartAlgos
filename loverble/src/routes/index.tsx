import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, FlaskConical, Shield, Wallet, LineChart, Code2 } from "lucide-react";
import { company } from "@/lib/mock-data";
import { MotionHeroText } from "@/components/motion-reveal";
import { HeroTelemetry } from "@/components/premium/hero-telemetry";
import { CinematicSpotlight } from "@/components/premium/cinematic-spotlight";
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
        <CinematicSpotlight />
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

      <section className="py-16 md:py-20 border-t border-border/40 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 0%, rgb(245 158 11 / 0.08), transparent 45%), radial-gradient(ellipse at 80% 100%, rgb(245 158 11 / 0.05), transparent 40%)",
          }}
        />
        <div className="relative max-w-[1160px] mx-auto px-6">
          <div className="mb-10 max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.14em] text-gold">TWO DOORS · ONE PLATFORM</p>
            <h2 className="mt-3 font-display text-[1.75rem] md:text-[2.15rem] font-semibold tracking-tight leading-snug">
              Choose your workspace.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Bank and SACCO teams enter financial systems. Researchers and traders enter the quant lab. Each door opens
              to its own catalog, tools, and desk path.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Door 01 */}
            <Link
              to="/systems"
              className="group relative flex flex-col min-h-[420px] overflow-hidden rounded-2xl border border-border/80 bg-[#0d121c] outline-none transition duration-300 hover:border-gold/45 hover:shadow-[0_24px_80px_rgb(0_0_0_/_0.45),0_0_48px_rgb(245_158_11_/_0.06)] focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgb(245_158_11_/_0.12),transparent_55%)]" />
              <div className="pointer-events-none absolute -right-8 top-10 h-40 w-40 rounded-full border border-gold/10 opacity-60 group-hover:opacity-100 transition" />
              <div className="relative flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-grid h-12 w-12 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold shadow-[0_0_24px_rgb(245_158_11_/_0.12)]">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-gold/80">DOOR 01</span>
                </div>
                <p className="mt-6 font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                  FOR BANKS · SACCOs · FINTECH
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight group-hover:text-gold transition-colors">
                  Enterprise financial systems
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Modular core ledgers, payment connectivity, and compliance controls scoped to institutional operating
                  models.
                </p>

                <div className="mt-6 grid gap-2.5">
                  {[
                    { icon: BookOpen, label: "SpreadShield · deposit retention" },
                    { icon: Wallet, label: "ReconGuard · payment switch recon" },
                    { icon: Shield, label: "GuarantorGraph · SACCO credit risk" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-black/25 px-3 py-2.5"
                    >
                      <row.icon className="h-3.5 w-3.5 shrink-0 text-gold" />
                      <span className="text-xs text-foreground/90">{row.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex items-center justify-between border-t border-border/50">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
                    Explore financial systems
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="font-mono text-[8px] tracking-wider text-muted-foreground">B2B · ARCHITECTURE</span>
                </div>
              </div>
            </Link>

            {/* Door 02 */}
            <Link
              to="/strategies"
              className="group relative flex flex-col min-h-[420px] overflow-hidden rounded-2xl border border-border/80 bg-[#0d121c] outline-none transition duration-300 hover:border-gold/45 hover:shadow-[0_24px_80px_rgb(0_0_0_/_0.45),0_0_48px_rgb(245_158_11_/_0.06)] focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgb(245_158_11_/_0.12),transparent_55%)]" />
              <div className="pointer-events-none absolute -left-8 bottom-16 h-40 w-40 rounded-full border border-gold/10 opacity-60 group-hover:opacity-100 transition" />
              <div className="relative flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-grid h-12 w-12 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold shadow-[0_0_24px_rgb(245_158_11_/_0.12)]">
                    <FlaskConical className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-gold/80">DOOR 02</span>
                </div>
                <p className="mt-6 font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
                  FOR RESEARCHERS · FUNDS · TRADERS
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight group-hover:text-gold transition-colors">
                  Quantitative strategies lab
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Live models, research packs, subscriptions, backtest sandbox, and custom quant engineering — in one
                  workspace.
                </p>

                <div className="mt-6 grid gap-2.5">
                  {[
                    { icon: LineChart, label: "Live FX, SPY & gold models" },
                    { icon: Code2, label: "Subscriptions, sandbox & hire-a-quant" },
                    { icon: Shield, label: "QuantConnect verification when public" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-black/25 px-3 py-2.5"
                    >
                      <row.icon className="h-3.5 w-3.5 shrink-0 text-gold" />
                      <span className="text-xs text-foreground/90">{row.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex items-center justify-between border-t border-border/50">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
                    Enter quant lab
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="font-mono text-[8px] tracking-wider text-muted-foreground">RESEARCH · ACCESS</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1160px] mx-auto px-6">
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#141b27] to-[#0b0f17] px-6 py-7 md:px-9 md:py-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgb(245_158_11_/_0.08),transparent_50%)]" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <p className="font-mono text-[9px] tracking-[0.14em] text-gold">OPERATED BY</p>
                <p className="mt-2 text-base font-semibold text-foreground">{company.operator}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Non-custodial by design. We distinguish research from verified performance. Educational technology and
                  research — not investment advice.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/about"
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-xs font-semibold tracking-wide hover:border-gold/50 hover:text-gold transition"
                >
                  About
                </Link>
                <Link
                  to="/consultation"
                  className="inline-flex min-h-11 items-center rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
                >
                  Book a desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

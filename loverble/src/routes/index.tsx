import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FileText, LineChart, Brain, Activity, Building2 } from "lucide-react";
import {
  researchOverview, strategyOverview, strategies, company,
} from "@/lib/mock-data";
import { DonateButton } from "@/components/donate-button";
import { HeroCinematic } from "@/components/hero-cinematic";
import { MotionHeroText, MotionItem, MotionReveal } from "@/components/motion-reveal";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";

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
      <nav className="fixed top-0 inset-x-0 z-50 glass-nav">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
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
              <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-foreground transition">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <DonateButton compact />
            <Link to="/consultation" className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
              Book Consultation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[92vh] pt-32 pb-20 overflow-hidden flex items-center bg-dominant">
        <HeroCinematic />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full">
          <MotionHeroText className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-secondary-surface/80 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Quantitative Research · Systematic Strategies
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight text-foreground">
              {company.name}
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gold font-display">{company.tagline}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {company.operator}
            </p>
            <p className="mt-8 text-lg text-secondary-foreground/90 max-w-2xl leading-relaxed">
              We publish quantitative research, develop systematic strategies, and build a verifiable track record — sold through research subscriptions and advisory.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/strategies" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition duration-200 cursor-pointer">
                View Strategies <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/research" className="inline-flex items-center gap-2 rounded-sm border border-gold/35 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition duration-200 cursor-pointer">
                Research Library
              </Link>
              <Link to="/performance" className="inline-flex items-center gap-2 rounded-sm border border-border bg-secondary-surface/60 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-secondary-foreground hover:bg-card transition duration-200 cursor-pointer">
                Performance
              </Link>
            </div>
          </MotionHeroText>
        </div>
      </section>

      <section className="border-y border-border bg-secondary-surface/80">
        <MotionReveal className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["Research Notes", researchOverview.notesPublished],
            ["Strategy Studies", researchOverview.studiesCompleted],
            ["Live Strategies", strategyOverview.live],
            ["Markets Covered", researchOverview.marketsCovered],
          ].map(([label, value]) => (
            <MotionItem key={label as string}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
              <div className="mt-2 font-display text-3xl font-semibold text-foreground">{value}</div>
            </MotionItem>
          ))}
        </MotionReveal>
      </section>

      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Strategies</div>
              <h2 className="font-display text-4xl font-semibold">Live systematic models</h2>
              <p className="mt-2 text-muted-foreground">Researched, validated, and deployed with third-party verification.</p>
            </div>
            <Link to="/strategies" className="text-sm text-gold hover:underline">Full catalog →</Link>
          </div>
          <MotionReveal className="grid md:grid-cols-2 gap-4">
            {liveStrategies.map((s) => (
              <MotionItem key={s.slug}>
                <Link
                  to="/strategies/$slug"
                  params={{ slug: s.slug }}
                  className="surface-card rounded-lg p-6 hover:border-gold/40 transition duration-200 block cursor-pointer h-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                  <div className="mt-3 text-xs text-muted-foreground">{s.asset} · {s.platform}</div>
                </Link>
              </MotionItem>
            ))}
          </MotionReveal>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-secondary-surface/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">How it works</div>
            <h2 className="font-display text-4xl font-semibold">Research → Strategies → Subscribe</h2>
          </div>
          <MotionReveal className="grid md:grid-cols-3 gap-5">
            {[
              { icon: FileText, t: "Research", items: ["Free previews", "Full reports — $10", "Methodology & notebooks"], link: "/research" },
              { icon: FlaskConical, t: "Strategies", items: ["Live models — $149.99 retail", "Institutional — $499.99", "Third-party verification"], link: "/strategies" },
              { icon: Brain, t: "Advisory", items: [`Consultation — ${formatUsd(PRICING.consultation)}`, "Strategy review", "System design"], link: "/consultation" },
            ].map(({ icon: Icon, t, items, link }) => (
              <MotionItem key={t}>
              <Link to={link} className="surface-card rounded-lg p-7 hover:border-gold/30 transition duration-200 block cursor-pointer h-full">
                <Icon className="h-7 w-7 text-gold mb-5" />
                <h3 className="font-display text-xl font-semibold">{t}</h3>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-gold/70" />{i}
                    </li>
                  ))}
                </ul>
              </Link>
              </MotionItem>
            ))}
          </MotionReveal>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-dominant">
        <div className="max-w-[1400px] mx-auto px-6">
          <MotionReveal className="max-w-xl mx-auto rounded-lg border border-gold/20 bg-secondary-surface/90 p-8">
            <MotionItem>
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Advisory</div>
            <h2 className="font-display text-3xl font-semibold">Book Consultation</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pay {formatUsd(PRICING.consultation)} via Paystack — then schedule your session with our research desk.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Strategy review, trading system design, and quantitative research advisory for systematic traders.
            </p>
            <div className="mt-6">
              <CheckoutForm
                productType="consultation"
                productId="consultation"
                amountUsd={PRICING.consultation}
                label={`Pay ${formatUsd(PRICING.consultation)} via Paystack`}
              />
            </div>
            <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
              View all consultation services →
            </Link>
            </MotionItem>
          </MotionReveal>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <LineChart className="h-8 w-8 text-gold mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold">Verified performance</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Track records connected progressively from QuantConnect and partner platforms — not self-reported marketing curves.
          </p>
          <Link to="/performance" className="mt-6 inline-flex items-center gap-2 text-sm text-gold hover:underline">
            View performance <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card/30">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-8">
            <div>
              <div className="font-display text-base font-semibold">SMART ALGOS CAPITAL</div>
              <p className="text-sm text-muted-foreground mt-2">{company.operator}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Platform</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {nav.map((item) => (
                  <li key={item.to}><Link to={item.to} className="hover:text-gold transition">{item.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Roadmap</div>
              <p className="text-sm text-muted-foreground">
                <Link to="/about" hash="roadmap" className="hover:text-gold transition">View our roadmap</Link> — subscriber portal, Collective2 signals, and live performance API.
              </p>
            </div>
          </div>
          <div className="hairline mb-6" />
          <div className="flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-gold" /> Research First · Verified Performance</span>
            <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> © 2026 {company.operator}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

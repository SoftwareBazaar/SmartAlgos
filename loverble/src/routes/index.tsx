import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, FileText, LineChart, Brain, Activity, Building2 } from "lucide-react";
import {
  researchOverview, strategyOverview, strategies, company,
} from "@/lib/mock-data";
import { DonateButton } from "@/components/donate-button";

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
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
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
            <Link to="/research" className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
              View Research <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gold mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Quantitative Research · Systematic Strategies
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
              {company.name}
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gold font-display">{company.tagline}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {company.operator}
            </p>
            <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              We publish quantitative research, develop systematic strategies, and build a verifiable track record — sold through research subscriptions and advisory.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/strategies" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
                View Strategies <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/research" className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
                Research Library
              </Link>
              <Link to="/performance" className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-card transition">
                Performance
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ["Research Notes", researchOverview.notesPublished],
            ["Strategy Studies", researchOverview.studiesCompleted],
            ["Live Strategies", strategyOverview.live],
            ["Markets Covered", researchOverview.marketsCovered],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
              <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </div>
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
          <div className="grid md:grid-cols-2 gap-4">
            {liveStrategies.map((s) => (
              <Link
                key={s.slug}
                to="/strategies/$slug"
                params={{ slug: s.slug }}
                className="surface-card rounded-lg p-6 hover:border-gold/40 transition block"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                <div className="mt-3 text-xs text-muted-foreground">{s.asset} · {s.platform}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-card/20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">How it works</div>
            <h2 className="font-display text-4xl font-semibold">Research → Strategies → Subscribe</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: FileText, t: "Research", items: ["Free previews", "Research Pro — full notes", "Quant Pro — notebooks & breakdowns"], link: "/research" },
              { icon: FlaskConical, t: "Strategies", items: ["Live strategy catalog", "Verification links", "Pipeline transparency"], link: "/strategies" },
              { icon: Brain, t: "Advisory", items: ["Strategy review", "System design", "Implementation help"], link: "/consultation" },
            ].map(({ icon: Icon, t, items, link }) => (
              <Link key={t} to={link} className="surface-card rounded-lg p-7 hover:border-gold/30 transition block">
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
            ))}
          </div>
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

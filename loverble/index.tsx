import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowRight, FlaskConical, FileText, Cpu, Shield, Building2, LineChart, Brain, Activity } from "lucide-react";
import {
  equityCurve, researchOverview, strategyOverview, activeStrategies,
  company, techProjects,
} from "@/lib/mock-data";
import { DonateButton } from "@/components/donate-button";
import { FutureEcosystem } from "@/components/future-ecosystem";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${company.name} — Quantitative Research & Investment Technology` },
      { name: "description", content: "Quantitative research, strategy development, and financial systems. Operated by Smart Algos Investment Solution Ltd (Kenya)." },
    ],
  }),
  component: Landing,
});

const ranges = { "1M": 30, "3M": 90, "6M": 180, "YTD": 250, "All": 365 } as const;
type RKey = keyof typeof ranges;

const services = [
  { icon: FlaskConical, t: "Quantitative Research", items: ["Strategy Research", "Market Studies", "White Papers", "Research Notes"] },
  { icon: Brain, t: "Consultation Services", items: ["Quant Strategy Development", "Trading System Design", "Performance Analytics", "Financial Technology Advisory"] },
  { icon: Cpu, t: "Financial Systems Development", items: ["Risk Analytics", "Banking Analytics", "Treasury Systems", "Compliance Technology"] },
];

function statusColor(s: string) {
  if (s === "Live") return "bg-bull/15 text-bull";
  if (s === "Testing" || s === "Research") return "bg-gold/15 text-gold";
  if (s === "Development") return "bg-primary/15 text-primary";
  return "bg-muted/30 text-muted-foreground";
}

function Landing() {
  const [range, setRange] = useState<RKey>("YTD");
  const data = equityCurve.slice(-ranges[range]);

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
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
            <Link to="/performance" className="text-muted-foreground hover:text-foreground transition">Performance</Link>
            <Link to="/alpha-portfolio" className="text-muted-foreground hover:text-foreground transition">Alpha Portfolio</Link>
            <Link to="/research" className="text-muted-foreground hover:text-foreground transition">Research</Link>
            <Link to="/consultation" className="text-muted-foreground hover:text-foreground transition">Consultation</Link>
            <Link to="/technology" className="text-muted-foreground hover:text-foreground transition">Technology</Link>
          </div>
          <div className="flex items-center gap-2">
            <DonateButton compact />
            <Link to="/consultation" className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
              Book Consultation <ArrowRight className="h-3.5 w-3.5" />
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
              Quantitative Research · Investment Technology · Financial Systems
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight">
              {company.name}
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-gold font-display">{company.tagline}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Powered by {company.operator}
            </p>
            <p className="mt-8 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              We develop strategies, publish research, build financial technology, and create systems that support modern investment and financial institutions.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
                View Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/research" className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
                Research Library
              </Link>
              <Link to="/alpha-portfolio" className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-card transition">
                Alpha Portfolio
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
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Performance</div>
              <h2 className="font-display text-4xl font-semibold">Strategy performance tracking</h2>
              <p className="mt-2 text-muted-foreground">Connected progressively from QuantConnect and Collective2 — verified, not fabricated.</p>
            </div>
            <div className="flex gap-1 rounded-sm border border-border p-1 bg-card/40">
              {(Object.keys(ranges) as RKey[]).map((k) => (
                <button key={k} onClick={() => setRange(k)} className={`px-3 py-1.5 text-xs font-mono uppercase rounded-sm transition ${range === k ? "bg-gold text-primary-foreground" : "text-muted-foreground"}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div className="surface-card rounded-lg p-6">
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="landing-eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(5)} minTickGap={50} />
                <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
                <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={2} fill="url(#landing-eq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Alpha Portfolio</div>
              <h2 className="font-display text-4xl font-semibold">Active strategies</h2>
            </div>
            <Link to="/alpha-portfolio" className="text-sm text-gold hover:underline">Full portfolio →</Link>
          </div>
          <div className="surface-card rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card/50">
                <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="text-left px-5 py-3">Strategy</th>
                  <th className="text-left px-5 py-3">Asset</th>
                  <th className="text-left px-5 py-3">Platform</th>
                  <th className="text-right px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeStrategies.map((s) => (
                  <tr key={s.name} className="border-t border-border hover:bg-card/40 transition">
                    <td className="px-5 py-3 font-medium">{s.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.asset}</td>
                    <td className="px-5 py-3 text-muted-foreground">{s.platform}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-card/20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">Services</div>
            <h2 className="font-display text-4xl font-semibold">Research & advisory today</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, t, items }) => (
              <div key={t} className="surface-card rounded-lg p-7">
                <Icon className="h-7 w-7 text-gold mb-5" />
                <h3 className="font-display text-xl font-semibold">{t}</h3>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {items.map((i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-gold/70" />{i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Technology Division</div>
            <h2 className="font-display text-4xl font-semibold">Building financial systems</h2>
            <Link to="/technology" className="text-sm text-gold hover:underline mt-2 inline-block">View technology division →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {techProjects.current.map((p) => (
              <div key={p.name} className="surface-card rounded-lg p-5">
                <Cpu className="h-5 w-5 text-gold mb-2" />
                <div className="font-medium text-sm">{p.name}</div>
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-gradient-to-b from-card/10 to-background">
        <div className="max-w-[1400px] mx-auto px-6">
          <FutureEcosystem />
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="max-w-[1400px] mx-auto px-6 text-center max-w-3xl">
          <p className="font-display text-xl md:text-2xl leading-relaxed text-foreground">
            {company.name} is a quantitative research and investment technology firm.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We develop strategies, publish research, build financial technology, and create systems that support modern investment and financial institutions. The hedge fund vision is part of the roadmap — not something we pretend already exists.
          </p>
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
                {[["Dashboard", "/dashboard"], ["Research", "/research"], ["Consultation", "/consultation"], ["About", "/about"]].map(([l, u]) => (
                  <li key={u}><Link to={u} className="hover:text-gold transition">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Future Ecosystem</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[["Live Trading", "/live-trading"], ["Backtesting", "/backtesting"], ["Investor Portal", "/investor"]].map(([l, u]) => (
                  <li key={u}><Link to={u} className="hover:text-gold transition">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="hairline mb-6" />
          <div className="flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-gold" /> Research First · Performance Driven · Technology Focused</span>
            <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> © 2026 {company.operator}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

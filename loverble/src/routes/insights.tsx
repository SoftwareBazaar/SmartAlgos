import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: `Insights & Research — ${company.name}` },
      {
        name: "description",
        content:
          "Technical articles, research ideas, and practical notes on financial infrastructure and quantitative methods.",
      },
    ],
  }),
  component: InsightsPage,
});

const pipeline = [
  { when: "H1 2026", title: "African equities momentum", note: "Scoping · data availability review" },
  { when: "MID 2026", title: "Gold volatility regimes", note: "Planned · research question in development" },
] as const;

const articles = [
  {
    category: "FINTECH ENGINEERING",
    title: "Modernizing SACCO core ledgers with double-entry architecture",
    text: "A practical look at ledger foundations, posting workflows, and reconciliation for multi-branch institutions.",
    meta: "ENGINEERING NOTE · 6 MIN READ",
    href: "/finance",
  },
  {
    category: "QUANTITATIVE RESEARCH",
    title: "Building a verifiable quantitative track record",
    text: "Why transparent methodology and independent evidence matter when communicating systematic research.",
    meta: "RESEARCH NOTE · 8 MIN READ",
    href: "/performance",
  },
  {
    category: "QUANTITATIVE RESEARCH",
    title: "Session-aware FX fades",
    text: "A research note concept covering session liquidity, spread widening, and the assumptions needed for a reproducible fade study.",
    meta: "METHODOLOGY PREVIEW",
    href: "/strategies",
  },
  {
    category: "OPEN BANKING",
    title: "Designing safer payment API integrations",
    text: "Considerations for integration boundaries, idempotency, rate limits, and operational monitoring.",
    meta: "ENGINEERING NOTE · 7 MIN READ",
    href: "/systems",
  },
  {
    category: "MICROFINANCE",
    title: "Liquidity management for growing lenders",
    text: "Liquidity visibility, cash-flow forecasts, and operational reporting considerations for microfinance institutions.",
    meta: "SYSTEMS NOTE · 7 MIN READ",
    href: "/systems",
  },
  {
    category: "MARKET RESEARCH",
    title: "A repeatable process for research-stage strategies",
    text: "From hypothesis to reproducibility: documenting assumptions before discussing performance.",
    meta: "RESEARCH NOTE · 6 MIN READ",
    href: "/research",
  },
] as const;

function InsightsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-[780px] px-6 pt-20 pb-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.12em] text-gold">INSIGHTS &amp; RESEARCH</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-gold-deep leading-tight">
          Notes from the systems and research desk.
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          Technical articles, reproducible research ideas, and practical perspectives on financial infrastructure.
        </p>
      </header>

      <section className="py-12">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="surface-card grid md:grid-cols-[0.8fr_1.2fr] gap-6 items-center rounded-[var(--radius)] p-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">RESEARCH PIPELINE</p>
              <h2 className="mt-2 font-display text-lg font-semibold">What we&apos;re exploring next.</h2>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Roadmap topics are indicative and may change as research develops.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {pipeline.map((p) => (
                <div key={p.title} className="rounded-[var(--radius)] border border-border bg-black/25 p-3.5 grid gap-2">
                  <span className="font-mono text-[9px] text-gold">{p.when}</span>
                  <b className="text-xs font-semibold text-foreground">{p.title}</b>
                  <small className="text-[10px] text-muted-foreground leading-relaxed">{p.note}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Desk notes</h2>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/research" className="text-gold hover:text-gold-soft inline-flex items-center gap-1">
                Full research library <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to="/finance" className="text-gold hover:text-gold-soft inline-flex items-center gap-1">
                Decision Math <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Link
                key={a.title}
                to={a.href}
                className="surface-card flex min-h-[240px] flex-col rounded-[var(--radius)] p-5 hover:border-gold/40 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="font-mono text-[8px] tracking-[0.12em] text-gold">{a.category}</span>
                <h2 className="mt-4 font-display text-base font-semibold leading-snug">{a.title}</h2>
                <p className="mt-2 mb-4 text-xs text-muted-foreground leading-relaxed flex-1">{a.text}</p>
                <div className="mt-auto font-mono text-[8px] text-muted-foreground">{a.meta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

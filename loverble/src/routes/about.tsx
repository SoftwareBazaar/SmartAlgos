import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Code2, FlaskConical } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${company.name}` },
      {
        name: "description",
        content: `${company.name} brings financial systems thinking and quantitative research together. Operated by ${company.operator}.`,
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-[720px] px-6 pt-20 pb-2">
        <p className="font-mono text-[10px] tracking-[0.16em] text-gold">ABOUT</p>
        <h1 className="mt-3 font-display text-[1.85rem] md:text-[2.35rem] font-semibold tracking-tight leading-[1.2] text-foreground">
          Building trust into financial technology.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-[54ch]">
          Smart Algos brings financial systems thinking and quantitative research together — with clarity, careful
          engineering, and evidence-led decisions.
        </p>
      </header>

      <section className="py-12 md:py-14">
        <div className="mx-auto max-w-[1080px] px-6 space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-[#151c28] to-[#0b0f17] p-7 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_10%,rgb(245_158_11_/_0.1),transparent_42%)]" />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div className="max-w-2xl">
                <p className="font-mono text-[9px] tracking-[0.14em] text-gold">ORIGIN · JANUARY 2025</p>
                <h2 className="mt-3 font-display text-xl md:text-2xl font-semibold tracking-tight leading-snug">
                  Two complex disciplines. One shared need for trust.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  Institutions need systems they can understand and control. Research needs methods whose assumptions
                  can be examined. We build for both — financial software and systematic research.
                </p>
              </div>
              <div className="flex lg:flex-col items-center gap-3 text-gold font-mono text-[10px] tracking-[0.12em]">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-gold/35 bg-gold/[0.07] text-xl font-semibold tracking-tighter">
                  SA
                </span>
                <span className="text-muted-foreground">01 / 25</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <article className="rounded-xl border border-border/70 bg-card/30 p-6">
              <BookOpen className="h-4 w-4 text-gold" />
              <h3 className="mt-4 text-base font-semibold tracking-tight">Financial systems</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Double-entry ledgers, member and loan workflows, payment connectivity, reconciliation, and operational
                controls.
              </p>
            </article>
            <article className="rounded-xl border border-border/70 bg-card/30 p-6">
              <FlaskConical className="h-4 w-4 text-gold" />
              <h3 className="mt-4 text-base font-semibold tracking-tight">Quantitative research</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Documented assumptions, attention to costs and risk, and a clear line between illustrative results and
                independently verified evidence.
              </p>
            </article>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed max-w-3xl">
            Focus areas — not a claim of production banking deployments or verified investment performance.
          </p>
        </div>
      </section>

      <section className="section-muted py-14 md:py-16">
        <div className="mx-auto max-w-[1080px] px-6 grid lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.35fr)] gap-10 items-start">
          <aside className="rounded-2xl border border-border/70 bg-[#111827]/80 p-7 text-center">
            <span className="mx-auto grid h-[76px] w-[76px] place-items-center rounded-full border border-gold/40 bg-gold/[0.08] text-gold text-2xl font-bold tracking-tight">
              JW
            </span>
            <p className="mt-4 font-mono text-[8px] tracking-[0.14em] text-muted-foreground">
              WORLDQUANT RESEARCH CONSULTANT
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">John Wanyaga</h2>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Founder · quantitative researcher
            </p>
            <span className="mt-4 inline-flex rounded border border-border px-2 py-1 font-mono text-[8px] tracking-wider text-muted-foreground">
              EST. JANUARY 2025
            </span>
          </aside>

          <div className="space-y-4 pt-1">
            <p className="font-mono text-[9px] tracking-[0.14em] text-gold">EXECUTIVE SUMMARY</p>
            <h2 className="font-display text-xl md:text-[1.65rem] font-semibold tracking-tight leading-snug max-w-[28ch]">
              Quantitative research. Systematic trading. Financial systems.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[62ch]">
              John Wanyaga is a quantitative researcher, systematic trader, and financial systems architect. He serves
              as a <span className="text-foreground/90">Quantitative Research Consultant at WorldQuant</span> and
              founded Smart Algo STS.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[62ch]">
              Work spans FX, futures, ETFs, CFDs, and crypto research, alongside risk and operational technology for
              banks, SACCOs, and microfinance institutions.
            </p>
            <div className="pt-2 space-y-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">Focus</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-[62ch]">
                  Alpha research, backtesting and validation, portfolio risk, automated execution; credit contagion
                  modeling, IFRS 9 ECL, payment-switch reconciliation, and ALM.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">Technology</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-[62ch]">
                  Python, C++, SQL, Docker, Kubernetes, Redis, Kafka, PostgreSQL, REST/gRPC.
                </p>
              </div>
            </div>
            <p className="mt-2 border-l-2 border-gold pl-4 text-sm leading-relaxed text-foreground/85">
              <span className="text-gold font-medium">Principle —</span> make assumptions, methods, and evidence clear
              enough to examine.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-[800px] px-6">
          <article className="rounded-2xl border border-gold/30 bg-[#111827]/60 p-7 md:p-9">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
              <p className="font-mono text-[9px] tracking-[0.14em] text-gold">A NOTE ON COMMITMENT</p>
              <span className="font-mono text-[8px] tracking-wider text-muted-foreground">PRINCIPLES</span>
            </div>
            <h2 className="mt-6 font-display text-lg md:text-xl font-semibold tracking-tight">
              To partners and future collaborators,
            </h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Financial systems shape how people save, borrow, and transact. Quantitative models influence how capital
                is understood. Both deserve clear reasoning and honest limits.
              </p>
              <p>
                We commit to state assumptions, explain limitations, and separate a design preview from a tested,
                deployed service — earning confidence through the quality of the work.
              </p>
            </div>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-t border-border/60 pt-5">
              <span>
                <strong className="block text-sm font-semibold">John Wanyaga</strong>
                <span className="mt-1 block font-mono text-[9px] text-gold">Founder, Smart Algos</span>
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">Pride · Consistency · Trust</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section-muted py-14">
        <div className="mx-auto max-w-[1080px] px-6">
          <div className="mb-7 max-w-xl">
            <p className="font-mono text-[9px] tracking-[0.14em] text-gold">CAREER INTEREST</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold tracking-tight">
              People who care about getting the details right.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No open roles today. Express interest via the desk for future opportunities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="flex min-h-[200px] flex-col rounded-xl border border-border/70 bg-card/25 p-6">
              <Code2 className="h-4 w-4 text-gold" />
              <p className="mt-3 font-mono text-[8px] tracking-[0.12em] text-muted-foreground">QUANTITATIVE RESEARCH</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight">Researchers &amp; model developers</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                Python research, statistics, backtest methodology, multi-asset markets, and clear risk documentation.
              </p>
              <Link to="/strategies" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-soft">
                Quant lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
            <article className="flex min-h-[200px] flex-col rounded-xl border border-border/70 bg-card/25 p-6">
              <BookOpen className="h-4 w-4 text-gold" />
              <p className="mt-3 font-mono text-[8px] tracking-[0.12em] text-muted-foreground">FINANCIAL SYSTEMS</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight">Analysts &amp; systems consultants</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                Financial modelling, ledger reconciliation, liquidity analysis, payments architecture, and controls.
              </p>
              <Link to="/systems" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-soft">
                Financial systems <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-[1080px] px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl border border-border/80 bg-[#111827]/50 px-6 py-6 md:px-8">
            <div>
              <p className="font-mono text-[9px] tracking-[0.14em] text-gold">START A CONVERSATION</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">Bring a problem worth solving.</h2>
              <p className="mt-1 text-sm text-muted-foreground">Systems architecture or quantitative research — pick a track.</p>
            </div>
            <Link
              to="/consultation"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Book a desk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

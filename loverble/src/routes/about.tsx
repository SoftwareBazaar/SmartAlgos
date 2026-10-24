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
      <header className="mx-auto max-w-[780px] px-6 pt-20 pb-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.12em] text-gold">ABOUT SMART ALGOS</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-gold-deep leading-tight">
          Building trust into financial technology.
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          Smart Algos brings financial systems thinking and quantitative research together, with a focus on clarity,
          careful engineering, and evidence-led decisions.
        </p>
      </header>

      <section className="py-12">
        <div className="mx-auto max-w-[1160px] px-6 space-y-6">
          <div className="grid lg:grid-cols-[1fr_170px] gap-8 items-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-dominant p-8 md:p-12 relative">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_90%_10%,rgb(245_158_11_/_0.09),transparent_42%)]" />
            <div className="relative max-w-3xl">
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">OUR STARTING POINT · JANUARY 2025</p>
              <h2 className="mt-3 font-display text-2xl md:text-4xl font-semibold tracking-tight leading-snug">
                Two complex disciplines. One shared need for trust.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Financial organizations need systems that make their operations easier to understand and control.
                Quantitative research needs methods whose assumptions and evidence can be examined. Smart Algos was
                started to work on both challenges through financial software and systematic research.
              </p>
            </div>
            <div className="relative flex lg:flex-col items-center gap-3 text-gold font-mono text-[10px] tracking-[0.12em]">
              <span className="grid h-24 w-24 place-items-center rounded-full border border-gold/40 bg-gold/10 text-2xl font-semibold tracking-tighter shadow-[0_0_45px_rgb(245_158_11_/_0.08)]">
                SA
              </span>
              <i className="hidden lg:block w-px h-6 bg-gradient-to-b from-gold to-transparent" />
              <i className="lg:hidden h-px w-6 bg-gradient-to-r from-gold to-transparent" />
              <span>01 / 25</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <article className="surface-card rounded-[var(--radius)] p-6">
              <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                <BookOpen className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">Financial systems</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Explore practical design questions around double-entry ledgers, member and loan workflows, payment
                connectivity, reconciliation, and operational controls.
              </p>
              <span className="mt-5 inline-block font-mono text-[9px] tracking-wider text-muted-foreground">
                AREA OF FOCUS
              </span>
            </article>
            <article className="surface-card rounded-[var(--radius)] p-6">
              <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                <FlaskConical className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">Quantitative research</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Develop research ideas with documented assumptions, attention to costs and risk, and a clear distinction
                between illustrative results and independently verified evidence.
              </p>
              <span className="mt-5 inline-block font-mono text-[9px] tracking-wider text-muted-foreground">
                AREA OF FOCUS
              </span>
            </article>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            These describe areas of focus, not a claim that production banking integrations, live strategies, or
            verified investment performance are currently available.
          </p>
        </div>
      </section>

      <section className="section-muted py-16">
        <div className="mx-auto max-w-[1160px] px-6 grid lg:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.3fr)] gap-10 items-center">
          <div className="surface-card rounded-[var(--radius)] p-8 text-center grid justify-items-center gap-2 bg-[radial-gradient(ellipse_at_50%_12%,rgb(245_158_11_/_0.10),transparent_58%)]">
            <span className="grid h-22 w-22 h-[88px] w-[88px] place-items-center rounded-full border border-gold/45 bg-gold/10 text-gold text-3xl font-bold tracking-tighter mb-1">
              JW
            </span>
            <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
              WORLDQUANT RESEARCH CONSULTANT
            </span>
            <h2 className="font-display text-xl font-semibold">John Wanyaga</h2>
            <p className="text-[10px] text-muted-foreground">Founder, Smart Algo STS · Quantitative researcher</p>
            <span className="mt-2 inline-flex rounded border border-border px-2 py-1 font-mono text-[8px] tracking-wider text-muted-foreground">
              SMART ALGOS · EST. JANUARY 2025
            </span>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.12em] text-gold">EXECUTIVE SUMMARY</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
              Quantitative research. Systematic trading. Financial systems.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              John Wanyaga is a quantitative researcher, systematic trader, and financial systems architect specializing
              in alpha signal research, statistical modeling, and institutional risk infrastructure. He currently serves
              as a <strong className="text-foreground">Quantitative Research Consultant at WorldQuant</strong> and is
              the founder of Smart Algo STS.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              His work spans systematic research across FX, futures, ETFs, CFDs, and crypto, alongside financial risk and
              operational technology for banks, SACCOs, and microfinance institutions.
            </p>
            <h3 className="pt-2 text-sm font-semibold">Research &amp; engineering focus</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quantitative research, statistical arbitrage, strategy backtesting and out-of-sample validation, portfolio
              risk optimization, and automated execution; graph-based credit contagion modeling, IFRS 9 Expected Credit
              Loss (ECL), payment-switch reconciliation, and predictive Asset-Liability Management (ALM).
            </p>
            <h3 className="pt-1 text-sm font-semibold">Technology</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Python (NumPy, pandas, SciPy, scikit-learn, PyTorch), C++, SQL, Git, Linux, REST/gRPC, Docker, Kubernetes,
              Redis, Kafka, PostgreSQL, and pgvector.
            </p>
            <p className="mt-3 border-l-2 border-gold rounded-r-md bg-gold/5 px-4 py-3 text-sm leading-relaxed">
              <strong className="text-gold">Our principle:</strong> make assumptions, methods, and evidence clear enough
              to examine.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <article className="surface-card rounded-[var(--radius)] border-gold/40 p-8 md:p-10 bg-[radial-gradient(ellipse_at_0_0,rgb(245_158_11_/_0.055),transparent_54%)]">
            <div className="flex flex-wrap justify-between gap-3 pb-4 border-b border-border">
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">A NOTE ON OUR COMMITMENT</p>
              <span className="font-mono text-[9px] tracking-wider text-muted-foreground">OUR PRINCIPLES</span>
            </div>
            <div className="max-w-3xl mx-auto mt-8">
              <h2 className="font-display text-xl md:text-3xl font-semibold mb-5">
                To our partners and future collaborators,
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Financial systems shape how people save, borrow, transact, and make decisions. Quantitative models can
                influence how capital is understood and managed. Both deserve care, clear reasoning, and honest
                communication about what is—and is not—known.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Our commitment is to approach this work with pride, consistency, and respect for the trust it requires:
                to state assumptions, explain limitations, and distinguish a design or research preview from a tested,
                deployed service.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-border">
                <span>
                  <strong className="block text-sm">John Wanyaga</strong>
                  <small className="mt-1 block font-mono text-[9px] text-gold">Founder, Smart Algos</small>
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">Pride · Consistency · Trust</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section-muted py-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">CAREER INTEREST</p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
                People who care about getting the details right.
              </h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              We are not advertising open roles today. If you would like to express interest for future opportunities,
              use the desk form.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <article className="surface-card rounded-[var(--radius)] p-6 min-h-[220px] flex flex-col">
              <Code2 className="h-5 w-5 text-gold" />
              <span className="mt-3 font-mono text-[9px] tracking-wider text-muted-foreground">
                FUTURE INTEREST · QUANTITATIVE RESEARCH
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">Researchers &amp; model developers</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                Areas that may be relevant include Python-based research, statistics, backtest methodology, multi-asset
                markets, and clear risk documentation.
              </p>
              <Link to="/strategies" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore the quant lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
            <article className="surface-card rounded-[var(--radius)] p-6 min-h-[220px] flex flex-col">
              <BookOpen className="h-5 w-5 text-gold" />
              <span className="mt-3 font-mono text-[9px] tracking-wider text-muted-foreground">
                FUTURE INTEREST · FINANCIAL SYSTEMS
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">Financial analysts &amp; systems consultants</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                Potential areas of interest include financial modelling, ledger reconciliation, liquidity analysis,
                payments architecture, and operational controls.
              </p>
              <Link to="/systems" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-soft">
                Explore financial systems <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[var(--radius)] border border-border surface-card p-7">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">START A CONVERSATION</p>
              <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold">Bring a problem worth solving.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a financial systems or quantitative research discussion track.
              </p>
            </div>
            <Link
              to="/consultation"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-[var(--radius)] bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Visit the strategy desk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

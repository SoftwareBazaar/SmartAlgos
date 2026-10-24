import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Globe2, Shield, Wallet } from "lucide-react";
import { company } from "@/lib/mock-data";
import { SYSTEMS_ENGINES } from "@/lib/systems-engines";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: `Financial Systems — ${company.name}` },
      {
        name: "description",
        content:
          "Core banking and SACCO software concepts plus reference engines: SpreadShield, ReconGuard, and GuarantorGraph. Operated by Smart Algos Investment Solution Ltd (Kenya).",
      },
    ],
  }),
  component: SystemsPage,
});

const features = [
  {
    icon: BookOpen,
    title: "Core ledger & operations",
    description:
      "Double-entry postings, deposit and loan origination, interest accrual, and member-account balancing.",
    meta: "ARCHITECTURE",
  },
  {
    icon: Wallet,
    title: "Payments & open banking",
    description:
      "Integration patterns for M-Pesa gateways, card issuing, open banking APIs, and regional real-time settlement.",
    meta: "INTEGRATION DESIGN",
  },
  {
    icon: Shield,
    title: "Risk & compliance",
    description:
      "AML/KYC identity checks, anti-fraud transaction monitoring, operational controls, and regulatory reporting.",
    meta: "CONTROL FRAMEWORKS",
  },
] as const;

const deployments = [
  {
    icon: BookOpen,
    title: "SACCO & microfinance core",
    description:
      "A modular path from member onboarding and savings accounts through loan servicing, interest schedules, reconciliation, and audit-ready reports.",
  },
  {
    icon: Globe2,
    title: "Digital finance & neobank",
    description:
      "An integration-first path connecting account services to mobile money, card partners, settlement channels, and operational monitoring.",
  },
] as const;

function SystemsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto max-w-[720px] px-6 pt-20 pb-4">
        <p className="font-mono text-[10px] tracking-[0.14em] text-gold">FINANCIAL SYSTEMS</p>
        <h1 className="mt-3 font-display text-[1.85rem] md:text-[2.35rem] font-semibold tracking-tight leading-snug text-foreground">
          Cloud-native core banking &amp; SACCO software.
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-[54ch]">
          Modular financial technology for banks, SACCOs, microfinance institutions, and digital finance teams — with
          reference engines you can inspect before scoping a production build.
        </p>
      </header>

      {/* Integrated financial models */}
      <section id="engines" className="py-14 scroll-mt-24">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-gold">REFERENCE ENGINES</p>
              <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold tracking-tight">
                Financial models in the lab.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
                SpreadShield, ReconGuard, and GuarantorGraph — Python reference packs for deposit retention, payment
                switch reconciliation, and guarantor risk. Educational architecture previews, not production licences.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {SYSTEMS_ENGINES.map((engine, i) => (
              <Link
                key={engine.slug}
                to="/systems/$slug"
                params={{ slug: engine.slug }}
                className="group flex flex-col rounded-2xl border border-border/80 bg-[#0d121c] p-6 hover:border-gold/45 transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-gold">{engine.category}</span>
                  <span className="font-mono text-[9px] text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight group-hover:text-gold transition-colors">
                  {engine.name}{" "}
                  <span className="text-muted-foreground font-normal text-sm">{engine.version}</span>
                </h3>
                <p className="mt-1 text-xs text-gold/80">{engine.codename}</p>
                <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">{engine.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {engine.stack.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {engine.files.length} downloadable file{engine.files.length === 1 ? "" : "s"} · problem, flow, I/O
                </p>
                <span className="mt-4 inline-flex items-center justify-center gap-2 min-h-10 rounded-lg border border-gold/40 bg-gold/10 px-3 text-xs font-semibold uppercase tracking-wider text-gold group-hover:bg-gold group-hover:text-primary-foreground transition">
                  Open details &amp; download <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border/40">
        <div className="mx-auto max-w-[1160px] px-6 grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <article key={f.title} className="rounded-xl border border-border/70 bg-card/25 p-6">
              <span className="inline-grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-gold">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <span className="mt-5 inline-block font-mono text-[9px] tracking-wider text-muted-foreground">
                {f.meta}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-muted py-14">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-gold">ILLUSTRATIVE DEPLOYMENT PATTERNS</p>
              <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold tracking-tight">
                Designed around the institution.
              </h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              Example architecture paths — not customer case studies or claims of deployed production systems.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {deployments.map((d) => (
              <article key={d.title} className="rounded-xl border border-border/70 bg-card/25 p-6">
                <span className="inline-grid h-10 w-10 place-items-center rounded-lg border border-border bg-card text-gold">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted py-14">
        <div className="mx-auto max-w-[1160px] px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-gold">DESIGNED TO SCALE</p>
            <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold tracking-tight">
              Start with the institution, not the stack.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              Map the capabilities your team needs, then shape an implementation around your operating model,
              regulatory environment, and existing systems.
            </p>
            <Link
              to="/consultation"
              search={{ track: "systems" }}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Discuss your architecture <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl border border-border bg-black/45 p-5" aria-label="Illustrative modular systems diagram">
            {["Member & account services", "Ledger & operations", "Payments & reporting"].map((label, i) => (
              <div key={label}>
                <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5">
                  <span className="font-mono text-[10px] text-gold">0{i + 1}</span>
                  <b className="text-xs font-semibold">{label}</b>
                </div>
                {i < 2 && <i className="ml-6 block h-4 w-px bg-gradient-to-b from-border to-transparent" />}
              </div>
            ))}
            <p className="mt-4 font-mono text-[9px] text-muted-foreground">
              Illustrative architecture · scope depends on deployment
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-border/80 bg-[#111827]/50 p-7">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] text-gold">B2B ARCHITECTURE REVIEW</p>
              <h2 className="mt-2 text-lg md:text-xl font-semibold tracking-tight">
                Bring your requirements to the table.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use a desk session to discuss engines, integrations, and a practical path forward.
              </p>
            </div>
            <Link
              to="/consultation"
              search={{ track: "systems" }}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Book a desk review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

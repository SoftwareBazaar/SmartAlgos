import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Globe2, Shield, Wallet } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: `Financial Systems — ${company.name}` },
      {
        name: "description",
        content:
          "Cloud-native core banking and SACCO software concepts: ledgers, payments, open banking, and compliance frameworks. Operated by Smart Algos Investment Solution Ltd (Kenya).",
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
      <header className="mx-auto max-w-[780px] px-6 pt-20 pb-4 text-center">
        <p className="font-mono text-[10px] tracking-[0.12em] text-gold">FINANCIAL SYSTEMS</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-gold-deep leading-tight">
          Cloud-native core banking &amp; SACCO software.
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          Modular financial technology for banks, SACCOs, microfinance institutions, and digital finance teams—with
          regional integrations scoped to each deployment.
        </p>
      </header>

      <section className="py-16">
        <div className="mx-auto max-w-[1160px] px-6 grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <article key={f.title} className="surface-card rounded-[var(--radius)] p-6">
              <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <span className="mt-5 inline-block font-mono text-[9px] tracking-wider text-muted-foreground">
                {f.meta}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="section-muted py-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">ILLUSTRATIVE DEPLOYMENT PATTERNS</p>
              <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">Designed around the institution.</h2>
            </div>
            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              These are example architecture paths, not customer case studies or claims of deployed production systems.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {deployments.map((d) => (
              <article key={d.title} className="surface-card rounded-[var(--radius)] p-6">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[var(--radius)] border border-border bg-card text-gold">
                  <d.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.description}</p>
                <span className="mt-5 inline-block font-mono text-[9px] tracking-wider text-muted-foreground">
                  EXAMPLE ARCHITECTURE
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-muted py-16">
        <div className="mx-auto max-w-[1160px] px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] text-gold">DESIGNED TO SCALE</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold">
              Start with the institution, not the stack.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md">
              Map the capabilities your team needs, then shape an implementation around your operating model,
              regulatory environment, and existing systems.
            </p>
            <Link
              to="/consultation"
              search={{ track: "systems" }}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius)] bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Discuss your architecture <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            className="rounded-[var(--radius)] border border-border bg-black/45 p-5 space-y-0"
            aria-label="Illustrative modular systems diagram"
          >
            {["Member & account services", "Ledger & operations", "Payments & reporting"].map((label, i) => (
              <div key={label}>
                <div className="flex items-center gap-4 rounded-[var(--radius)] border border-border bg-card px-4 py-3.5">
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

      <section className="py-16">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[var(--radius)] border border-border surface-card p-7">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-gold">B2B ARCHITECTURE REVIEW</p>
              <h2 className="mt-2 font-display text-xl md:text-2xl font-semibold">Bring your requirements to the table.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use a desk session to discuss systems, integrations, and a practical path forward.
              </p>
            </div>
            <Link
              to="/consultation"
              search={{ track: "systems" }}
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-[var(--radius)] bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
            >
              Book a desk review <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

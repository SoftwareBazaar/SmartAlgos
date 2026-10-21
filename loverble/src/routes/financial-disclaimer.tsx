import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/financial-disclaimer")({
  head: () => ({
    meta: [
      { title: "Financial Disclaimer — Smart Algo STS" },
      {
        name: "description",
        content:
          "YMYL financial disclaimer covering non-advice scope, educational purpose, and calculation limits for Smart Algo STS.",
      },
      { property: "og:title", content: "Financial Disclaimer — Smart Algo STS" },
      {
        property: "og:url",
        content: "https://www.smartalgosts.com/financial-disclaimer",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/financial-disclaimer" }],
  }),
  component: FinancialDisclaimer,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function FinancialDisclaimer() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link
        to="/legal"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
          <AlertTriangle className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Financial Disclaimer</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Smart Algo STS · Effective Date: October 2026 ·{" "}
            <a
              href="https://www.smartalgosts.com"
              className="text-gold hover:underline"
            >
              www.smartalgosts.com
            </a>
          </p>
        </div>
      </div>

      <Block title="1. Educational & Analytical Purpose">
        <p>
          All algorithms, formulas, LaTeX equations, amortization schedules, data tables, and
          articles published on Smart Algo STS are provided strictly for{" "}
          <strong className="text-foreground">
            educational, quantitative research, and informational purposes
          </strong>
          .
        </p>
        <p>
          Smart Algo STS is a software engineering and financial intelligence platform,{" "}
          <strong className="text-foreground">
            not a certified financial planner (CFP), registered investment advisor (RIA),
            broker-dealer, or licensed debt counseling agency
          </strong>
          .
        </p>
      </Block>

      <Block title="2. No Individualized Professional Advice">
        <p>
          Published materials do not constitute personalized financial, investment, credit, legal,
          or tax advice. Financial scenarios involve inherent risk, and individual financial
          profiles vary significantly.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">Independent Verification:</strong> Users should
            evaluate strategies independently and consult with qualified, licensed financial
            advisors, CPAs, or legal professionals before executing debt liquidation, balance
            transfers, or mortgage accelerations.
          </li>
          <li>
            <strong className="text-foreground">Model Assumptions:</strong> Amortization schedules,
            interest savings, and payoff timelines depend on user-supplied variables, lender
            contract terms, and market interest rates that may change over time.
          </li>
        </ul>
      </Block>

      <Block title="3. Calculation Precision & Model Limits">
        <p>
          While Smart Algo STS strives for mathematical precision across all formulas and software
          tools:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Outputs are derived from mathematical algorithms and user-defined inputs.</li>
          <li>
            Real-world financial outcomes depend on individual lender terms, variable interest rate
            adjustments (e.g., SOFR index shifts), compounding conventions, fee structures, and
            credit approval parameters.
          </li>
          <li>
            Smart Algo STS makes no warranties regarding the complete accuracy or applicability of
            any calculated result.
          </li>
        </ul>
      </Block>

      <Block title="4. Advertising & Editorial Objectivity">
        <p>
          Smart Algo STS displays programmatic advertising (including Google AdSense) to fund open
          software development and operational maintenance.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong className="text-foreground">Algorithmic Objectivity:</strong> All mathematical
            formulas, rankings, and decision matrices are computed objectively based on quantitative
            logic.
          </li>
          <li>
            <strong className="text-foreground">Commercial Independence:</strong> Advertisements
            served on the site do not influence our quantitative proofs or research findings.
          </li>
        </ul>
      </Block>

      <Block title="5. Contact Information">
        <p>For legal or disclaimer inquiries:</p>
        <p>
          <strong className="text-foreground">Website:</strong>{" "}
          <a href="https://www.smartalgosts.com" className="text-gold hover:underline">
            www.smartalgosts.com
          </a>
        </p>
        <p className="pt-2">
          For trading and investment risk disclosures, see also our{" "}
          <Link to="/disclaimers" className="text-gold hover:underline">
            Disclaimers
          </Link>{" "}
          page.
        </p>
      </Block>
    </div>
  );
}

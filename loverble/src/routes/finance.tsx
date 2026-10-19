import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance Systems — Smart Algos Capital" },
      {
        name: "description",
        content:
          "Smart Algorithmic Financial Systems — educational notes on repayment math, credit dynamics, and practical finance models from Smart Algos Capital.",
      },
    ],
  }),
  component: Finance,
});

function Finance() {
  return (
    <PageShell
      eyebrow="Smart Algorithmic Financial Systems"
      title="Finance systems notes"
      description="Clear models of everyday financial mechanics — repayment schedules, interest decay, and decision math — separate from our quantitative research library."
    >
      <SectionCard title="Upcoming notes" subtitle="Day-1 article arrives next">
        <article className="rounded-lg border border-border/60 bg-card/30 p-5 md:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-gold" />
            <span>Day 1</span>
            <span>Coming soon</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Credit card minimum payment decay
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            How minimum-only repayment stretches payoff time and compounds interest — with a
            transparent decay model you can inspect. Full note and schema publish when the
            markdown file is ready.
          </p>
        </article>
      </SectionCard>

      <p className="text-xs text-muted-foreground">
        Educational systems content — not investment advice. Quant strategy notes live under{" "}
        <Link to="/research" className="text-gold hover:underline">
          Research
        </Link>
        .
      </p>
    </PageShell>
  );
}

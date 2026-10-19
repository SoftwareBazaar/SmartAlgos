import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { BookOpen } from "lucide-react";
import { listPublishedFinanceNotes } from "@/lib/finance-notes";

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
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/finance" }],
  }),
  component: Finance,
});

function Finance() {
  const notes = listPublishedFinanceNotes();

  return (
    <PageShell
      eyebrow="Smart Algorithmic Financial Systems"
      title="Finance systems notes"
      description="Clear models of everyday financial mechanics — repayment schedules, interest decay, and decision math — separate from our quantitative research library."
    >
      <SectionCard title="Published notes" subtitle={`${notes.length} live`}>
        <div className="space-y-4">
          {notes.map((note) => (
            <Link
              key={note.slug}
              to="/finance/$slug"
              params={{ slug: note.slug }}
              className="block rounded-lg border border-border/60 bg-card/30 p-5 md:p-6 space-y-3 hover:border-gold/40 transition-colors cursor-pointer"
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5 text-gold" />
                <span>Day {note.day}</span>
                <span>{note.date}</span>
                <span className="text-gold">Published</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">{note.shortTitle}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{note.description}</p>
            </Link>
          ))}
        </div>
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

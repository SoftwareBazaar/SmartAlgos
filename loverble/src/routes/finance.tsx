import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, Clock } from "lucide-react";
import { FinanceNotesSignup } from "@/components/finance/finance-notes-signup";
import { NoteThumb } from "@/components/finance/note-thumb";
import {
  FINANCE_CATEGORIES,
  financeNotePath,
  listPublishedFinanceNotes,
  type FinanceCategory,
  type FinanceNote,
} from "@/lib/finance-notes";

function noteTo(note: FinanceNote) {
  return note.region === "ke" ? ("/finance/ke/$slug" as const) : ("/finance/$slug" as const);
}

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Decision Math — Everyday Finance Models | Smart Algo STS" },
      {
        name: "description",
        content:
          "Clear quantitative models of credit, loans, and Kenya payroll/tax — with worked examples and plain-language takeaways.",
      },
      {
        property: "og:title",
        content: "Decision Math — Everyday Finance Models | Smart Algo STS",
      },
      {
        property: "og:description",
        content:
          "Payoff timelines, Kenya net salary, Fuliza, HELB, and more — rigorous models without the jargon wall.",
      },
      { property: "og:url", content: "https://www.smartalgosts.com/finance" },
      { property: "og:type", content: "website" },
      {
        property: "og:image",
        content: "https://www.smartalgosts.com/og/finance-decision-math.png",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/finance" }],
  }),
  component: Finance,
});

function MetaRow({ note }: { note: FinanceNote }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="text-gold font-medium">{note.category}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {note.readingMinutes} min read
      </span>
      <span aria-hidden>·</span>
      <span>{note.date}</span>
      {note.hasCalculator ? (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 text-gold/90">
            <Calculator className="h-3 w-3" /> Includes calculator
          </span>
        </>
      ) : null}
    </div>
  );
}

function Finance() {
  const notes = listPublishedFinanceNotes();
  const [filter, setFilter] = useState<(typeof FINANCE_CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return notes;
    return notes.filter((n) => n.category === filter);
  }, [filter, notes]);

  const featured = filtered[0] ?? notes[0];
  const grid = filtered.filter((n) => n.slug !== featured?.slug);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-20 md:pt-24 pb-16 space-y-12">
      <header className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-end">
        <div className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Decision math</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-[1.1] max-w-[18ch]">
            Everyday finance, modeled clearly
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-[70ch]">
            Payoff timelines, Kenya payroll and tax, and filing trade-offs — quantitative education
            for readers who want the numbers, not the sales pitch.
          </p>
        </div>
        <div className="rounded-xl border border-gold/25 bg-secondary-surface/80 p-5 md:p-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Get new notes by email</p>
          <p className="text-xs text-muted-foreground max-w-[40ch]">
            No spam — just new models when we publish them.
          </p>
          <FinanceNotesSignup />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {FINANCE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === cat
                ? "bg-gold text-primary-foreground"
                : "border border-border/70 text-muted-foreground hover:text-foreground hover:border-gold/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {featured ? (
        <Link
          to={featured.region === "ke" ? "/finance/ke/$slug" : "/finance/$slug"}
          params={{ slug: featured.slug }}
          className="group grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-8 rounded-xl border border-gold/30 bg-secondary-surface/60 p-5 md:p-7 hover:border-gold/50 transition-colors"
        >
          <NoteThumb category={featured.category} stats={featured.stats} />
          <div className="flex flex-col justify-center space-y-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Featured</p>
            <MetaRow note={featured} />
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground leading-snug group-hover:text-gold transition-colors">
              {featured.seoTitle}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[65ch]">
              {featured.cardBlurb}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {featured.stats.map((s) => (
                <span
                  key={s.label}
                  className="rounded-md border border-border/60 bg-card/40 px-2.5 py-1 text-xs"
                >
                  <span className="text-muted-foreground">{s.label}: </span>
                  <span className="text-gold font-semibold">{s.value}</span>
                </span>
              ))}
            </div>
          </div>
        </Link>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">All notes</h2>
        {grid.length === 0 && filter !== "All" ? (
          <p className="text-sm text-muted-foreground">No notes in {filter} yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground max-w-[70ch] border-t border-border/50 pt-6">
        Educational models only — not personalized financial, tax, or credit advice. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </p>
    </div>
  );
}

function NoteCard({ note }: { note: FinanceNote }) {
  return (
    <Link
      to={note.region === "ke" ? "/finance/ke/$slug" : "/finance/$slug"}
      params={{ slug: note.slug }}
      className="group flex flex-col rounded-xl border border-border/60 bg-card/20 overflow-hidden hover:border-gold/40 transition-colors"
      data-path={financeNotePath(note)}
    >
      <NoteThumb category={note.category as FinanceCategory} stats={note.stats} />
      <div className="flex flex-col flex-1 gap-2.5 p-4 md:p-5">
        <MetaRow note={note} />
        <h3 className="font-display text-lg font-semibold text-foreground leading-snug group-hover:text-gold transition-colors">
          {note.shortTitle}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[70ch] line-clamp-3">
          {note.cardBlurb}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {note.stats.map((s) => (
            <span
              key={s.label}
              className="rounded border border-border/50 px-2 py-0.5 text-[11px] text-gold font-medium"
            >
              {s.value}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

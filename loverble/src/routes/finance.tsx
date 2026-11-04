import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import { ArrowUpDown, Calculator, Clock, Search } from "lucide-react";
import { FinanceNotesSignup } from "@/components/finance/finance-notes-signup";
import { NoteThumb } from "@/components/finance/note-thumb";
import {
  FINANCE_CATEGORIES,
  financeNotePath,
  listPublishedFinanceNotes,
  type FinanceNote,
} from "@/lib/finance-notes";
import { cn } from "@/lib/utils";

type RegionFilter = "all" | "ke" | "us";
type SortMode = "newest" | "oldest" | "read";

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
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "627" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.smartalgosts.com/og/finance-decision-math.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/finance" }],
  }),
  component: Finance,
});

function Finance() {
  const notes = listPublishedFinanceNotes();
  const [filter, setFilter] = useState<(typeof FINANCE_CATEGORIES)[number]>("All");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");

  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ["shortTitle", "seoTitle", "cardBlurb", "category", "description"],
        threshold: 0.35,
      }),
    [notes],
  );

  const filtered = useMemo(() => {
    let list = notes;
    if (region === "ke") list = list.filter((n) => n.region === "ke");
    if (region === "us") list = list.filter((n) => n.region !== "ke");
    if (filter !== "All") list = list.filter((n) => n.category === filter);
    if (query.trim()) {
      list = fuse.search(query.trim()).map((r) => r.item).filter((n) => list.some((x) => x.slug === n.slug));
    }
    const sorted = [...list];
    if (sort === "oldest") sorted.sort((a, b) => a.day - b.day);
    else if (sort === "read") sorted.sort((a, b) => a.readingMinutes - b.readingMinutes);
    else sorted.sort((a, b) => b.day - a.day);
    return sorted;
  }, [notes, filter, region, query, sort, fuse]);

  const featured = filtered[0] ?? notes[0];
  const grid = filtered.filter((n) => n.slug !== featured?.slug);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pt-20 md:pt-24 pb-20">
      <header className="max-w-3xl space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Decision math</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-[1.12] tracking-tight">
          Everyday finance, modeled clearly
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[62ch]">
          Payoff timelines, Kenya payroll and tax, and filing trade-offs — quantitative education for readers who want
          the numbers, not the sales pitch.
        </p>
      </header>

      {featured ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-10"
        >
          <Link
            to={featured.region === "ke" ? "/finance/ke/$slug" : "/finance/$slug"}
            params={{ slug: featured.slug }}
            className="group grid md:grid-cols-2 md:items-stretch gap-0 overflow-hidden rounded-2xl border border-gold/30 bg-[#0d121c] hover:border-gold/50 transition-colors"
          >
            <NoteThumb
              src={featured.coverImage}
              alt=""
              priority
              fill
              className="rounded-none border-0"
            />
            <div className="flex flex-col justify-center gap-3 p-6 md:p-8 lg:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Featured</p>
              <MetaLine note={featured} />
              <h2 className="font-display text-2xl md:text-[1.85rem] font-semibold text-foreground leading-snug group-hover:text-gold transition-colors">
                {featured.seoTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 max-w-[58ch]">
                {featured.cardBlurb}
              </p>
              <p className="mt-1 inline-flex w-fit rounded-md border border-gold/35 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold">
                {featured.headlineFigure}
              </p>
            </div>
          </Link>
        </motion.div>
      ) : null}

      <div className="sticky top-16 z-20 mt-10 -mx-6 px-6 py-3 backdrop-blur-md bg-background/85 border-y border-border/50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FINANCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  filter === cat
                    ? "bg-gold text-primary-foreground"
                    : "border border-border/70 text-muted-foreground hover:text-foreground hover:border-gold/40",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border/70 p-0.5">
              {(
                [
                  ["all", "All"],
                  ["ke", "Kenya"],
                  ["us", "US"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRegion(id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    region === id ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="relative min-w-[180px] flex-1 sm:flex-none sm:w-52">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                className="w-full rounded-lg border border-border/70 bg-card/40 py-2 pl-8 pr-3 text-xs focus:outline-none focus:border-gold/50"
              />
            </label>
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/40 px-2.5 py-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="bg-transparent text-foreground focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="read">Shortest read</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">All notes</h2>
          <p className="text-xs text-muted-foreground">{filtered.length} published</p>
        </div>

        {grid.length === 0 && !featured ? (
          <p className="text-sm text-muted-foreground">No notes match these filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((note, i) => (
              <motion.div
                key={note.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.24) }}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="flex flex-col justify-between rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-[#0d121c] to-[#0d121c] p-5 md:p-6 min-h-[280px]"
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Newsletter</p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug">Get new notes by email</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  No spam — just new models when we publish them.
                </p>
              </div>
              <div className="mt-6">
                <FinanceNotesSignup />
              </div>
            </motion.div>
          </div>
        )}
      </section>

      <p className="mt-14 text-xs text-muted-foreground max-w-[70ch] border-t border-border/50 pt-6">
        Educational models only — not personalized financial, tax, or credit advice. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </p>
    </div>
  );
}

function MetaLine({ note }: { note: FinanceNote }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="text-gold font-medium">{note.region === "ke" ? "Kenya" : note.category}</span>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {note.readingMinutes} min read
      </span>
      <span aria-hidden>·</span>
      <span>{note.date}</span>
    </div>
  );
}

function NoteCard({ note }: { note: FinanceNote }) {
  return (
    <Link
      to={note.region === "ke" ? "/finance/ke/$slug" : "/finance/$slug"}
      params={{ slug: note.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/20 hover:border-gold/45 hover:shadow-[0_0_0_1px_rgb(245_158_11_/_0.15)] transition-all"
      data-path={financeNotePath(note)}
    >
      <NoteThumb src={note.coverImage} alt="" />
      <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5">
        <MetaLine note={note} />
        <h3 className="font-display text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-gold transition-colors">
          {note.shortTitle}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{note.cardBlurb}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <span className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold">
            {note.headlineFigure}
          </span>
          {note.hasCalculator ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calculator className="h-3 w-3 text-gold" /> Includes calculator
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

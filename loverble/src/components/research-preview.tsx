import { FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ResearchPaper } from "@/lib/mock-data";

/** Published research card — no placeholder charts. */
export function ResearchPreviewCard({ paper }: { paper: ResearchPaper }) {
  return (
    <article className="border-b border-border/60 pb-8 last:border-0 last:pb-0 max-w-[70ch]">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {paper.type}
        </span>
        <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {paper.category}
        </span>
        <span className="rounded-sm border border-gold/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
          {paper.tier === "free" ? "Free" : "Published"}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{paper.date}</span>
        {paper.readingMinutes != null && (
          <span className="text-[10px] text-muted-foreground">{paper.readingMinutes} min read</span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-gold mt-0.5 shrink-0" />
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold">{paper.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{paper.executiveSummary}</p>
          {paper.keyFindings[0] && (
            <p className="mt-3 text-sm text-foreground/90">
              <span className="text-gold text-[10px] uppercase tracking-wider mr-2">Key point</span>
              {paper.keyFindings[0]}
            </p>
          )}
          <Link
            to="/research/$slug"
            params={{ slug: paper.slug }}
            className="mt-4 inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-gold text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
          >
            Open full note
          </Link>
        </div>
      </div>
    </article>
  );
}

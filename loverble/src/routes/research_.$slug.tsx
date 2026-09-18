import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getPaperBySlug } from "@/lib/mock-data";

export const Route = createFileRoute("/research_/$slug")({
  loader: ({ params }) => {
    const paper = getPaperBySlug(params.slug);
    if (!paper) throw notFound();
    return paper;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Research"} — Smart Algos Capital` },
      { name: "description", content: loaderData?.executiveSummary ?? "" },
    ],
  }),
  component: ResearchNotePage,
});

function ResearchNotePage() {
  const paper = Route.useLoaderData();
  const canDownload = Boolean(paper.downloadUrl);

  return (
    <PageShell
      eyebrow={paper.id}
      title={paper.title}
      description={`${paper.category} · ${paper.date}`}
      actions={
        <Link
          to="/research"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Research library
        </Link>
      }
    >
      <article className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-gold" />
          <span>{paper.published ? "Free note" : "In progress"}</span>
          <span>{paper.category}</span>
        </div>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{paper.executiveSummary}</p>

        <div>
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-gold mb-3">Key points</h2>
          <ul className="space-y-2">
            {paper.keyFindings.map((finding) => (
              <li key={finding} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {canDownload ? (
          <a
            href={paper.downloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-lg bg-gold px-5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
          >
            <Download className="h-4 w-4" /> Download notebook
          </a>
        ) : (
          <p className="text-sm text-muted-foreground rounded-lg border border-border px-4 py-3">
            This is the public text version. The Jupyter notebook file is not uploaded yet — it will appear as a
            download on this same URL when published.
          </p>
        )}
      </article>
    </PageShell>
  );
}

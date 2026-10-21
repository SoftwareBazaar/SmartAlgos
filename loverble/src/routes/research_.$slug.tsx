import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getPaperBySlug, type ResearchPaper } from "@/lib/mock-data";

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
  const paper = Route.useLoaderData() as ResearchPaper;
  const canDownload = Boolean(paper.downloadUrl);

  if (!paper.published) {
    return (
      <PageShell
        eyebrow="Pipeline"
        title={paper.title}
        description={`${paper.type} · ${paper.category} · ${paper.expectedDate ?? paper.date}`}
        actions={
          <Link
            to="/research"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to research
          </Link>
        }
      >
        <article className="max-w-[70ch] space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>{paper.executiveSummary}</p>
          <p className="rounded-lg border border-border px-4 py-3">
            This note is in the pipeline — not published and not for sale. No notebook, PDF, or dataset is attached yet.
          </p>
          <ul className="space-y-2">
            {paper.keyFindings.map((finding) => (
              <li key={finding} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </article>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={paper.type}
      title={paper.title}
      description={`${paper.category} · Published ${paper.date}${paper.readingMinutes ? ` · ${paper.readingMinutes} min read` : ""}`}
      actions={
        <Link
          to="/research"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Research library
        </Link>
      }
    >
      <article className="max-w-[70ch] space-y-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <FileText className="h-3.5 w-3.5 text-gold" />
          <span className="text-bull">Free note</span>
          <span>{paper.id}</span>
        </div>

        <p className="text-base text-muted-foreground leading-relaxed">{paper.executiveSummary}</p>

        <div>
          <h2 className="text-[10px] uppercase tracking-[0.18em] text-gold mb-3">Headline points</h2>
          <ul className="space-y-2">
            {paper.keyFindings.map((finding) => (
              <li key={finding} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </div>

        {paper.sections?.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}

        <aside className="rounded-lg border border-border px-4 py-3 text-xs text-muted-foreground space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-gold">Cite this</div>
          <p>
            Smart Algos Capital. “{paper.title}.” {paper.date}.{" "}
            <span className="break-all">https://www.smartalgosts.com/research/{paper.slug}</span>
          </p>
          <p className="pt-2">
            Educational research only — not investment advice. Past methodology does not guarantee future results.
          </p>
        </aside>

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
            Public text version is live. Jupyter notebook and data files will appear as downloads on this URL when uploaded.
          </p>
        )}
      </article>
    </PageShell>
  );
}

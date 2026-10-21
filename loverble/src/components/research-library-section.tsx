import { Link } from "@tanstack/react-router";
import { FREE_NOTE_SLUG, researchPapers, researchPipeline } from "@/lib/mock-data";

export function ResearchLibrarySection() {
  const published = researchPapers.filter((p) => p.published);

  return (
    <section id="research" className="py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Research</div>
            <h2 className="font-display text-section-title text-3xl md:text-4xl">Research notes</h2>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm">
              Reproducible notes on gold, FX, and African equities. Unpublished work stays in the pipeline — not for sale.
            </p>
          </div>
          <Link
            to="/research"
            className="text-xs font-semibold uppercase tracking-wider text-gold hover:underline"
          >
            Open research library →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {published.map((report) => (
            <article
              key={report.id}
              className="p-6 bg-secondary-surface border border-border rounded-xl flex flex-col justify-between hover:border-gold/30 transition-colors duration-200"
            >
              <div>
                <div className="flex justify-between items-center text-xs mb-3">
                  <span className="px-2.5 py-0.5 rounded bg-gold/10 text-gold font-semibold border border-gold/20">
                    {report.type}
                  </span>
                  <span className="text-muted-foreground">{report.date}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.executiveSummary}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-border/80">
                <Link
                  to="/research/$slug"
                  params={{ slug: report.slug || FREE_NOTE_SLUG }}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gold text-primary-foreground font-bold text-xs rounded-sm hover:bg-gold-soft transition-colors cursor-pointer"
                >
                  Read free note
                </Link>
              </div>
            </article>
          ))}
        </div>

        {researchPipeline.length > 0 && (
          <div className="mt-10 max-w-3xl">
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">In the pipeline</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {researchPipeline.map((row) => (
                <li key={row.id} className="flex flex-wrap gap-x-3 gap-y-1 border-b border-border/40 pb-2">
                  <span className="text-foreground font-medium">{row.title}</span>
                  <span>{row.category}</span>
                  <span>{row.expectedDate}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

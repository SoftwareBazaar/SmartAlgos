import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { ResearchPreviewCard } from "@/components/research-preview";
import { FinanceNotesSignup } from "@/components/finance/finance-notes-signup";
import { researchPapers, researchPipeline, FREE_NOTE_SLUG } from "@/lib/mock-data";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Smart Algos Capital" },
      {
        name: "description",
        content:
          "Reproducible research on gold, FX, and African equities — with code and data when published. Pipeline items are questions under investigation, not for sale.",
      },
    ],
  }),
  component: Research,
});

function Research() {
  const published = researchPapers.filter((p) => p.published);
  const latestDate = published[0]?.date ?? "—";

  return (
    <PageShell
      eyebrow="Research"
      title="Research & strategy notebooks"
      description="Reproducible research on gold, FX, and African equities — with code and data when a file is attached. Unpublished work stays in the pipeline, not the store."
    >
      <p className="text-xs text-muted-foreground -mt-2">
        Latest publication · {latestDate}
      </p>

      <SectionCard title="Published" subtitle="Notes with a full text version live">
        <div className="space-y-8">
          {published.map((paper) => (
            <ResearchPreviewCard key={paper.id} paper={paper} />
          ))}
        </div>
      </SectionCard>

      <div className="rounded-xl border border-gold/30 bg-secondary-surface p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-4xl">
        <div className="max-w-[70ch]">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold">Flagship free note</div>
          <p className="text-sm text-muted-foreground mt-1">
            Building a Quantitative Track Record — methodology for verifiable paper and live history. Notebook file still pending.
          </p>
        </div>
        <Link
          to="/research/$slug"
          params={{ slug: FREE_NOTE_SLUG }}
          className="inline-flex items-center justify-center min-h-12 px-5 rounded-lg bg-gold text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft shrink-0"
        >
          Open the free note
        </Link>
      </div>

      <SectionCard
        title="In the pipeline"
        subtitle="Not for sale until a notebook or PDF is attached — titles are research questions"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Market</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 font-medium">Notify</th>
              </tr>
            </thead>
            <tbody>
              {researchPipeline.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-foreground">{row.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{row.type}</div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.category}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{row.expectedDate}</td>
                  <td className="py-3">
                    <a
                      href="#research-notify"
                      className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline"
                    >
                      <Bell className="h-3.5 w-3.5" /> Notify me
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Methodology & standards" subtitle="How we publish">
        <ul className="space-y-2 text-sm text-muted-foreground max-w-[70ch]">
          <li>Published = real file or full public text attached. No placeholder charts or unverified numbers.</li>
          <li>Pipeline items are framed as questions under investigation until evidence ships.</li>
          <li>Backtests and live/paper records are labeled separately; third-party links preferred over self-hosted curves.</li>
          <li>Educational research only — not investment advice. See the financial disclaimer in the footer.</li>
        </ul>
      </SectionCard>

      <div id="research-notify" className="max-w-xl scroll-mt-24">
        <FinanceNotesSignup />
      </div>
    </PageShell>
  );
}

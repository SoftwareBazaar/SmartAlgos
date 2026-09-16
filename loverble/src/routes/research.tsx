import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { ResearchPreviewCard } from "@/components/research-preview";
import {
  researchOverview, researchPapers, caseStudies, whitePapers,
} from "@/lib/mock-data";
import { BookOpen, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Smart Algos Capital" },
      { name: "description", content: "Quantitative research library — notebooks, PDFs, and methodology notes." },
    ],
  }),
  component: Research,
});

const FILTERS = ["All", "Forex", "Commodities", "Equities"] as const;

const SAMPLE_NOTEBOOK = `# Sample QuantConnect algorithm initialization
def Initialize(self):
    self.SetStartDate(2023, 1, 1)
    self.SetCash(100000)
    self.symbol = self.AddForex("EURUSD", Resolution.Minute, Market.OANDA).Symbol
    self.bb = self.BB(self.symbol, 20, 2, MovingAverageType.Simple)
    self.SetWarmUp(20)`;

function Research() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const papers = researchPapers.filter((p) => filter === "All" || p.category === filter);

  return (
    <PageShell
      eyebrow="Quant library"
      title="Research & strategy notebooks"
      description="Methodology notes with Jupyter notebooks, backtest logs, and PDF reports. Preview free — unlock a full note for $10."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Research Notes" value={String(researchOverview.notesPublished)} />
        <StatCard label="Strategy Studies" value={String(researchOverview.studiesCompleted)} accent="up" />
        <StatCard label="Markets Covered" value={String(researchOverview.marketsCovered)} />
        <StatCard label="Unlock" value="$10" hint="per full report" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200 ${
              filter === cat
                ? "bg-gold text-primary-foreground"
                : "bg-card/40 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <SectionCard title="Research library" subtitle="Quantitative notes · .ipynb + PDF">
        <div className="space-y-8">
          {papers.map((paper) => (
            <ResearchPreviewCard key={paper.id} paper={paper} />
          ))}
          {papers.length === 0 && (
            <p className="text-sm text-muted-foreground">No notes in this asset class yet.</p>
          )}
        </div>
      </SectionCard>

      <div className="p-6 bg-dominant border border-border rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <span className="text-xs font-mono text-muted-foreground">
            Sample notebook preview: <span className="text-gold">eurusd_mean_reversion.py</span>
          </span>
          <Link to="/" hash="research" className="text-xs text-gold hover:underline cursor-pointer">
            Back to homepage library
          </Link>
        </div>
        <pre className="p-4 bg-secondary-surface rounded-lg text-xs font-mono text-bull overflow-x-auto border border-border">
          {SAMPLE_NOTEBOOK}
        </pre>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="White Papers" subtitle="Long-form publications">
          <div className="space-y-3">
            {whitePapers.map((w) => (
              <div key={w.title} className="flex items-center gap-3 rounded-sm border border-border/60 p-3 hover:border-gold/40 transition-colors">
                <BookOpen className="h-4 w-4 text-gold shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{w.title}</div>
                  <div className="text-xs text-muted-foreground">{w.date}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Case Studies" subtitle="Applied research examples">
          <div className="space-y-3">
            {caseStudies.map((c) => (
              <div key={c.title} className="rounded-sm border border-border/60 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.category}</span>
                </div>
                <div className="font-display text-base font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{c.outcome}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { ResearchPreviewCard } from "@/components/research-preview";
import {
  researchOverview, researchPapers, caseStudies, whitePapers,
} from "@/lib/mock-data";
import { BookOpen, TrendingUp } from "lucide-react";
import { EmailGate } from "@/components/email-gate";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Smart Algos Capital" },
      { name: "description", content: "Quantitative research library — subscribe free to access." },
    ],
  }),
  component: Research,
});

const categories = [
  "Quantitative Finance",
  "Algorithmic Trading",
  "Market Structure",
  "Risk Analytics",
  "Financial Systems",
];

function Research() {
  return (
    <PageShell
      eyebrow="Research & Authority"
      title="Research"
      description="Published quantitative research on strategies, markets, and financial systems."
    >
      {/* Stats visible to everyone */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Research Notes" value={String(researchOverview.notesPublished)} />
        <StatCard label="Strategy Studies" value={String(researchOverview.studiesCompleted)} accent="up" />
        <StatCard label="Markets Covered" value={String(researchOverview.marketsCovered)} />
        <StatCard label="Categories" value={String(categories.length)} />
      </div>

      {/* Category pills — visible teaser */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <span key={c} className="text-xs px-2.5 py-1 rounded border border-border bg-card/40 text-muted-foreground">
            {c}
          </span>
        ))}
      </div>

      {/* All research content gated behind free email subscription */}
      <EmailGate
        title="Subscribe to access research"
        description="Enter your email to read quantitative research notes, strategy studies, white papers, and case studies — completely free."
      >
        <SectionCard title="Research Library" subtitle="Quantitative research notes and strategy studies">
          <div className="space-y-8">
            {researchPapers.map((paper) => (
              <ResearchPreviewCard key={paper.id} paper={paper} />
            ))}
          </div>
        </SectionCard>

        <div className="grid lg:grid-cols-2 gap-6">
          <SectionCard title="White Papers" subtitle="Long-form publications">
            <div className="space-y-3">
              {whitePapers.map((w) => (
                <div key={w.title} className="flex items-center gap-3 rounded-sm border border-border/60 p-3 hover:border-gold/40 transition">
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
      </EmailGate>
    </PageShell>
  );
}

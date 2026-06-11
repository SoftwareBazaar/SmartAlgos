import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard, StatCard } from "@/components/page-shell";
import { ResearchPreviewCard } from "@/components/research-preview";
import { SubscriptionTiers } from "@/components/subscription-tiers";
import {
  researchOverview, researchPapers, caseStudies, whitePapers,
} from "@/lib/mock-data";
import { BookOpen, FileText, TrendingUp, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research — Smart Algos Capital" },
      { name: "description", content: "Quantitative research library with free previews and premium subscription access." },
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
  const [email, setEmail] = useState("");

  const subscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    toast.success("Subscribed", { description: "We'll email you new research as it's published." });
    setEmail("");
  };

  return (
    <PageShell
      eyebrow="Research & Authority"
      title="Research"
      description="Our strongest section — demonstrating expertise, attracting investors and clients through honest, practical quantitative research."
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Research Notes" value={String(researchOverview.notesPublished)} />
        <StatCard label="Strategy Studies" value={String(researchOverview.studiesCompleted)} accent="up" />
        <StatCard label="Markets Covered" value={String(researchOverview.marketsCovered)} />
        <StatCard label="Categories" value={String(categories.length)} />
      </div>

      <div className="rounded-lg border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold">Free Tier</div>
            <h2 className="font-display text-2xl font-semibold mt-1">Research Updates</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Free users see titles, abstracts, chart previews, and key findings (first 20–30%). Subscribe for full methodology, notebooks, and PDFs.
            </p>
          </div>
          <form onSubmit={subscribeNewsletter} className="flex gap-2 w-full lg:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 lg:w-72 bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
            />
            <button type="submit" className="rounded-sm bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Subscribe
            </button>
          </form>
        </div>
      </div>

      <SectionCard title="Research Library" subtitle="Free previews · Premium full reports">
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <span key={c} className="text-xs px-2.5 py-1 rounded border border-border bg-card/40 text-muted-foreground">{c}</span>
          ))}
        </div>
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
                  <div className="text-xs text-muted-foreground">{w.date} · {w.tier === "free" ? "Free" : "Premium"}</div>
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

      <SectionCard title="Research Subscription" subtitle="Monetization model — preview free, subscribe for depth">
        <SubscriptionTiers />
        <p className="text-[11px] text-muted-foreground mt-4 text-center">
          Every paper shows title, executive summary, key chart, and key findings before the premium gate — like Bloomberg and Seeking Alpha.
        </p>
      </SectionCard>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { techProjects, company } from "@/lib/mock-data";
import { Cpu, Building2 } from "lucide-react";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: "Technology Division — Smart Algos Capital" },
      { name: "description", content: "Current and future technology projects from Smart Algos Investment Solution Ltd." },
    ],
  }),
  component: Technology,
});

function statusColor(s: string) {
  if (s === "Development") return "bg-primary/15 text-primary";
  if (s === "Research") return "bg-gold/15 text-gold";
  return "bg-muted/30 text-muted-foreground";
}

function Technology() {
  return (
    <PageShell
      eyebrow="Technology Division"
      title="Technology & Systems"
      description={`Where ${company.name} grows beyond research — building financial technology for investment and institutional use.`}
    >
      <SectionCard title="Current Projects" subtitle="Active development and research">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techProjects.current.map((p) => (
            <div key={p.name} className="rounded-lg border border-border bg-card/30 p-5">
              <Cpu className="h-5 w-5 text-gold mb-3" />
              <div className="font-display text-base font-semibold">{p.name}</div>
              <span className={`mt-3 inline-block text-xs px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Future Projects" subtitle="Banking, treasury, and risk platforms — long-term roadmap">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {techProjects.future.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-sm border border-border/60 bg-card/30 px-4 py-3">
              <Building2 className="h-4 w-4 text-gold shrink-0" />
              <div className="flex-1 text-sm">{p.name}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          AML monitoring, fraud detection, audit analytics, regulatory technology, credit risk, treasury systems, and loan analytics are research-stage initiatives — not live products.
        </p>
      </SectionCard>
    </PageShell>
  );
}

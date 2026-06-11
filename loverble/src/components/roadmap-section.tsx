import { roadmap } from "@/lib/mock-data";

function phaseColor(p: string) {
  if (p === "Development") return "bg-primary/15 text-primary";
  if (p === "Planned") return "bg-gold/15 text-gold";
  return "bg-muted/30 text-muted-foreground";
}

export function RoadmapSection({ id = "roadmap" }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Roadmap</div>
      <h2 className="font-display text-2xl font-semibold">What we are building next</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        Sequential delivery — research credibility and verified strategies first, then tooling and distribution.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {roadmap.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-sm border border-border bg-card/30 px-4 py-3">
            <span className="text-sm">{item.name}</span>
            <span className={`text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm ${phaseColor(item.phase)}`}>
              {item.phase}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

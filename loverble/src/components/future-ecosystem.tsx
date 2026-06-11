import { Link } from "@tanstack/react-router";
import { futureEcosystem } from "@/lib/mock-data";

function phaseColor(p: string) {
  if (p === "Development") return "bg-primary/15 text-primary";
  if (p === "Planning") return "bg-gold/15 text-gold";
  return "bg-muted/30 text-muted-foreground";
}

export function FutureEcosystem({ compact = false }: { compact?: boolean }) {
  return (
    <section id="future-ecosystem" className={compact ? "" : "py-12"}>
      {!compact && (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Future Ecosystem</div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Planned initiatives</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Part of our roadmap — not something we pretend already exists. Built sequentially, with credibility ahead of scale.
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {futureEcosystem.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="group rounded-sm border border-border bg-card/30 px-4 py-3 hover:border-gold/40 hover:bg-card/50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium group-hover:text-gold transition">{item.name}</span>
              <span className={`text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm ${phaseColor(item.phase)}`}>
                {item.phase}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Financial Intelligence systems (AML, fraud detection, audit analytics, regulatory technology, credit risk, treasury, loan analytics) are long-term research initiatives.
      </p>
    </section>
  );
}

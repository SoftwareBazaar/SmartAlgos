import { Link } from "@tanstack/react-router";
import { getStrategyBySlug } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";

const strategy = getStrategyBySlug("fx-mean-reversion");

/** No illustrative equity curve — listings pending. */
export function HeroProofChart() {
  return (
    <GlowCard accent className="p-4 md:p-5 h-full min-h-[280px] md:min-h-[360px] flex flex-col justify-between">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Featured · Live model</div>
        <div className="font-display text-lg md:text-xl font-semibold mt-1">
          {strategy?.name ?? "FX Mean Reversion"}
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
          {strategy?.summary ??
            "Short-horizon mean reversion on major FX pairs with spread-aware execution assumptions."}
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-background/40 px-4 py-5 space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Track record</div>
        <p className="text-sm text-foreground/90">
          Public QuantConnect listing and verified equity curve not published yet. We will not show placeholder performance here.
        </p>
        <Link to="/performance" className="inline-block text-sm text-gold hover:underline pt-1">
          Track record status →
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground border-t border-border/60 pt-3">
        <span>{strategy?.asset ?? "Forex"} · {strategy?.platform ?? "QuantConnect"}</span>
        <span className="text-gold">Listing pending</span>
      </div>
    </GlowCard>
  );
}

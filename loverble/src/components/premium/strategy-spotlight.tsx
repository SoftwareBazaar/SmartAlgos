import { Link } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import type { Strategy } from "@/lib/mock-data";
import { SPY_PSAR_SLUG } from "@/lib/spy-psar-strategy";
import { GlowCard } from "./glow-card";
import { LiveBadge } from "./live-badge";
import { MotionItem, MotionReveal } from "@/components/motion-reveal";

export function StrategySpotlight({
  strategies,
  statusColor,
}: {
  strategies: Strategy[];
  statusColor: (s: string) => string;
}) {
  return (
    <MotionReveal className="grid md:grid-cols-2 gap-4">
      {strategies.map((s) => {
        const isFree = s.tier === "free" || s.slug === SPY_PSAR_SLUG;
        return (
          <MotionItem key={s.slug}>
            <GlowCard accent={isFree} className="h-full p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold group-hover:text-gold transition-colors">{s.name}</h3>
                {isFree ? (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-gold/40 text-gold">
                    Free pack
                  </span>
                ) : s.status === "Live" ? (
                  <LiveBadge />
                ) : (
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
                )}
              </div>

              {s.liveSharpe != null && (
                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sharpe</div>
                    <div className="font-mono text-lg font-semibold text-gold tabular-nums">{s.liveSharpe.toFixed(2)}</div>
                  </div>
                  {s.liveReturn != null && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CAGR</div>
                      <div className="font-mono text-lg font-semibold text-bull tabular-nums">
                        +{(s.liveReturn * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  {s.liveMaxDrawdown != null && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Max DD</div>
                      <div className="font-mono text-lg font-semibold text-bear tabular-nums">
                        {(s.liveMaxDrawdown * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isFree && s.status === "Live" && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Deployed model · public QC listing and verified stats pending
                </div>
              )}

              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.summary}</p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {s.asset} · {s.platform}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/strategies/$slug"
                    params={{ slug: s.slug }}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground hover:border-gold/50 hover:text-gold transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                  {isFree && (
                    <Link
                      to="/strategies/$slug"
                      params={{ slug: s.slug }}
                      hash="download"
                      className="inline-flex items-center gap-1.5 rounded-sm bg-gold px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <Download className="h-3 w-3" /> Download
                    </Link>
                  )}
                </div>
              </div>
            </GlowCard>
          </MotionItem>
        );
      })}
    </MotionReveal>
  );
}

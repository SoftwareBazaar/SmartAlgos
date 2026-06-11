import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { equityCurve, performanceMetrics, fmt } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";
import { EquityAreaChart } from "./equity-area-chart";

const data = equityCurve.slice(-120);

export function MiniEquityStrip() {
  return (
    <section className="py-16 border-t border-border bg-dominant">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal>
          <MotionItem>
            <GlowCard accent className="p-6 md:p-8">
              <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">Verified performance</div>
                  <h2 className="font-display text-section-title text-3xl md:text-4xl font-bold">Live track record</h2>
                  <p className="mt-3 text-sm text-muted-foreground max-w-md">
                    Blended portfolio equity from deployed systematic models — scaled to show growth from inception baseline.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sharpe</div>
                      <div className="font-mono text-xl font-semibold text-foreground mt-1">{performanceMetrics.sharpe}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Max DD</div>
                      <div className="font-mono text-xl font-semibold text-bear mt-1">{fmt.pct(performanceMetrics.maxDrawdown)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Win rate</div>
                      <div className="font-mono text-xl font-semibold text-foreground mt-1">{fmt.pct(performanceMetrics.winRate, 0)}</div>
                    </div>
                  </div>
                  <Link
                    to="/performance"
                    className="mt-6 inline-flex items-center gap-2 text-sm text-gold hover:underline cursor-pointer"
                  >
                    Full performance breakdown <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="h-[220px] md:h-[260px] rounded-lg border border-border/50 bg-background/30 p-3">
                  <EquityAreaChart data={data} gradientId="strip-fill" showGrid />
                </div>
              </div>
            </GlowCard>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

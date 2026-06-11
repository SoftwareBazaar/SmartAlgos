import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { equityCurve, performanceMetrics, fmt } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

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
                    Portfolio equity curve from deployed systematic models — connected to QuantConnect, not self-reported marketing charts.
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
                <div className="h-[200px] md:h-[240px] rounded-lg border border-border/50 bg-background/30 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="strip-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.3)" />
                          <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={1.5} fill="url(#strip-fill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </GlowCard>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

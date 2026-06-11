import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { equityCurve, fmt } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";

const chartData = equityCurve.slice(-180);
const startEquity = chartData[0]?.equity ?? 100;
const endEquity = chartData[chartData.length - 1]?.equity ?? 100;
const totalReturn = (endEquity / startEquity - 1) * 100;

export function HeroProofChart() {
  const reduceMotion = useReducedMotion();

  return (
    <GlowCard accent className="p-4 md:p-5 h-full min-h-[280px] md:min-h-[360px] flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Featured · Live model</div>
          <div className="font-display text-lg md:text-xl font-semibold mt-1">FX Mean Reversion</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl md:text-3xl font-bold text-bull tabular-nums">
            +{totalReturn.toFixed(1)}%
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Since live</div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="hero-proof-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.18 155 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.72 0.18 155 / 0)" />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip
              contentStyle={{
                background: "oklch(0.20 0.04 251)",
                border: "1px solid oklch(0.30 0.04 252)",
                borderRadius: 6,
                fontSize: 11,
              }}
              formatter={(v: number) => [fmt.num(v), "Equity"]}
              labelFormatter={(l) => String(l).slice(0, 10)}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="oklch(0.78 0.13 85)"
              strokeWidth={2}
              fill="url(#hero-proof-fill)"
              isAnimationActive={!reduceMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <motion.div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground border-t border-border/60 pt-3"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span>Sharpe 1.6 · Max DD -5.2%</span>
        <span className="text-gold">Independently verified via QuantConnect</span>
      </motion.div>
    </GlowCard>
  );
}

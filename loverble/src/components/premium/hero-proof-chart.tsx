import { motion, useReducedMotion } from "framer-motion";
import { fxMeanReversionCurve, getStrategyBySlug, fmt } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";
import { EquityAreaChart } from "./equity-area-chart";

const strategy = getStrategyBySlug("fx-mean-reversion");
const chartData = fxMeanReversionCurve;
const liveReturn = strategy?.liveReturn ?? 0.314;
const liveSharpe = strategy?.liveSharpe ?? 1.6;
const liveDd = strategy?.liveMaxDrawdown ?? -0.052;

export function HeroProofChart() {
  const reduceMotion = useReducedMotion();

  return (
    <GlowCard accent className="p-4 md:p-5 h-full min-h-[280px] md:min-h-[360px] flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Featured · Live model</div>
          <div className="font-display text-lg md:text-xl font-semibold mt-1">{strategy?.name ?? "FX Mean Reversion"}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl md:text-3xl font-bold text-bull tabular-nums">
            +{fmt.pct(liveReturn, 1)}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Since live</div>
        </div>
      </div>

      <div className="flex-1 min-h-[180px]">
        <EquityAreaChart data={chartData} gradientId="hero-proof-fill" animate={!reduceMotion} />
      </div>

      <motion.div
        className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground border-t border-border/60 pt-3"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span>
          Sharpe {liveSharpe} · Max DD {fmt.pct(liveDd, 1)}
        </span>
        <span className="text-gold">Independently verified via QuantConnect</span>
      </motion.div>
    </GlowCard>
  );
}

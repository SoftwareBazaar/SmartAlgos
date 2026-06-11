import { useReducedMotion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { GlowCard } from "./glow-card";

export function CountUpStat({
  label,
  value,
  suffix = "",
  hint,
  decimals = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  hint?: string;
  decimals?: number;
}) {
  const reduceMotion = useReducedMotion();
  const { ref, formatted } = useCountUp(value, { decimals, enabled: !reduceMotion });

  return (
    <GlowCard className="p-5 md:p-6 h-full">
      <div ref={ref} className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl md:text-4xl font-bold text-foreground tabular-nums">
        {formatted}
        {suffix}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{hint}</p>}
      <div className="mt-3 h-px w-12 bg-gradient-to-r from-gold/80 to-transparent" />
    </GlowCard>
  );
}

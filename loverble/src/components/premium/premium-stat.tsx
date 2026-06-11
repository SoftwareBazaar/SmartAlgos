import { motion, useReducedMotion } from "framer-motion";
import { GlowCard } from "./glow-card";

export function PremiumStat({ label, value }: { label: string; value: string | number }) {
  const reduceMotion = useReducedMotion();

  return (
    <GlowCard className="p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <motion.div
        className="mt-2 font-display text-3xl md:text-4xl font-semibold text-foreground"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {value}
      </motion.div>
      <div className="mt-3 h-px w-12 bg-gradient-to-r from-gold/80 to-transparent" />
    </GlowCard>
  );
}

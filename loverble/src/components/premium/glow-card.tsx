import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowCard({
  children,
  className,
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-secondary-surface/80 backdrop-blur-md transition-colors duration-200 cursor-pointer",
        accent && "border-gold/30",
        className,
      )}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), oklch(0.78 0.13 85 / 0.12), transparent 40%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-gold/25" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

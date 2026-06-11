import { motion, useReducedMotion } from "framer-motion";

const ORBS = [
  { className: "left-[8%] top-[18%] h-[420px] w-[420px] bg-gold/12", duration: 22 },
  { className: "right-[5%] top-[32%] h-[360px] w-[360px] bg-navy-light/40", duration: 28 },
  { className: "left-[38%] bottom-[8%] h-[520px] w-[520px] bg-accent/25", duration: 26 },
] as const;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 17) % 84)}%`,
  top: `${12 + ((i * 23) % 76)}%`,
  delay: i * 0.35,
  size: i % 3 === 0 ? 3 : 2,
}));

function EquityCurve() {
  return (
    <svg
      className="absolute inset-x-0 bottom-[18%] h-[38%] w-full opacity-[0.22]"
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="curve-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0)" />
          <stop offset="35%" stopColor="oklch(0.78 0.13 85 / 0.85)" />
          <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0.15)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,260 C120,240 180,200 260,210 S420,120 520,140 S700,60 860,90 S1020,40 1200,70 L1200,320 L0,320 Z"
        fill="url(#curve-gold)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
      <motion.path
        d="M0,260 C120,240 180,200 260,210 S420,120 520,140 S700,60 860,90 S1020,40 1200,70"
        fill="none"
        stroke="oklch(0.78 0.13 85)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.75 }}
        transition={{ duration: 2.4, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
}

export function HeroCinematic() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-dominant" />

      {!reduceMotion &&
        ORBS.map((orb) => (
          <motion.div
            key={orb.className}
            className={`absolute rounded-full blur-[100px] ${orb.className}`}
            animate={{
              x: [0, 36, -24, 0],
              y: [0, -28, 18, 0],
              scale: [1, 1.06, 0.96, 1],
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      <div className="absolute inset-0 grid-bg opacity-[0.18]" />

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.28 0.06 253 / 0.45), transparent 70%)",
        }}
        animate={reduceMotion ? undefined : { opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {!reduceMotion && <EquityCurve />}

      {!reduceMotion &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-gold/50"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ opacity: [0.15, 0.7, 0.15], y: [0, -12, 0] }}
            transition={{ duration: 4 + (p.id % 3), repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

      {!reduceMotion && (
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
          animate={{ top: ["22%", "78%", "22%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-dominant/30 via-transparent to-dominant" />
      <div className="absolute inset-0 bg-gradient-to-r from-dominant/70 via-transparent to-dominant/70" />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

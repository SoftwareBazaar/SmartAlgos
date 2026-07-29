import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MarketVideoCanvas } from "@/components/market-video-canvas";

const VIDEO_SOURCES = [
  "/hero-bg.mp4",
].filter(Boolean) as string[];

const ORBS = [
  { className: "left-[8%] top-[18%] h-[420px] w-[420px] bg-gold/10", duration: 22 },
  { className: "right-[5%] top-[32%] h-[360px] w-[360px] bg-navy-light/35", duration: 28 },
  { className: "left-[38%] bottom-[8%] h-[520px] w-[520px] bg-accent/20", duration: 26 },
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
      className="absolute inset-x-0 bottom-[18%] h-[38%] w-full opacity-[0.18] z-[2]"
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || VIDEO_SOURCES.length === 0) return;
    setVideoSrc(VIDEO_SOURCES[0] ?? null);
  }, [reduceMotion]);

  const tryNextSource = () => {
    const next = sourceIndex + 1;
    if (next < VIDEO_SOURCES.length) {
      setSourceIndex(next);
      setVideoSrc(VIDEO_SOURCES[next] ?? null);
    } else {
      setVideoSrc(null);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <MarketVideoCanvas />

      {videoSrc && !reduceMotion && (
        <video
          ref={videoRef}
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover scale-[1.02] opacity-45 z-[1] motion-reduce:hidden"
          onError={tryNextSource}
          onLoadedData={() => videoRef.current?.play().catch(() => tryNextSource())}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-dominant/55 z-[2]" />

      {!reduceMotion &&
        ORBS.map((orb) => (
          <motion.div
            key={orb.className}
            className={`absolute rounded-full blur-[100px] z-[2] ${orb.className}`}
            animate={{
              x: [0, 36, -24, 0],
              y: [0, -28, 18, 0],
              scale: [1, 1.06, 0.96, 1],
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

      <div className="absolute inset-0 grid-bg opacity-[0.12] z-[2]" />
      {!reduceMotion && <EquityCurve />}

      {!reduceMotion &&
        PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-gold/50 z-[3]"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ opacity: [0.15, 0.7, 0.15], y: [0, -12, 0] }}
            transition={{ duration: 4 + (p.id % 3), repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}

      {!reduceMotion && (
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent z-[3]"
          animate={{ top: ["22%", "78%", "22%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-dominant/40 via-dominant/20 to-dominant z-[4]" />
      <div className="absolute inset-0 bg-gradient-to-r from-dominant/65 via-transparent to-dominant/65 z-[4]" />
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-overlay z-[4]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

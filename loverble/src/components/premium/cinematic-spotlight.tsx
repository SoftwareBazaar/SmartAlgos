import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Aceternity-style grid + mouse spotlight.
 * Pure CSS + Framer (already in the project) — no Three.js / WebGL.
 */
export function CinematicSpotlight({
  className,
  density = 48,
}: {
  className?: string;
  /** Grid cell size in px */
  density?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 35 });

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      setPos({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      });
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(245 158 11 / 0.35) 1px, transparent 0)",
          backgroundSize: `${density}px ${density}px`,
        }}
      />
      {/* Fine line grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.35) 1px, transparent 1px)
          `,
          backgroundSize: `${density * 2}px ${density * 2}px`,
        }}
      />
      {/* Mouse / default spotlight */}
      <div
        className="absolute inset-0 transition-[background] duration-300 ease-out"
        style={{
          background: `radial-gradient(520px circle at ${pos.x}% ${pos.y}%, rgb(245 158 11 / 0.14), transparent 55%)`,
        }}
      />
      {/* Soft top wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgb(245_158_11_/_0.09),transparent_50%)]" />
      {/* Edge vignette so content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(11_15_23_/_0.75)_100%)]" />
    </div>
  );
}

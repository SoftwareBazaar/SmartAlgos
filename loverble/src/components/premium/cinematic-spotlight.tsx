import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Aceternity-style grid + mouse spotlight.
 * Listens on window (container is pointer-events-none so content stays clickable).
 */
export function CinematicSpotlight({
  className,
  density = 40,
  intensity = "strong",
}: {
  className?: string;
  density?: number;
  /** soft = subtle wash; strong = visible on dark hero pages */
  intensity?: "soft" | "strong";
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 42, y: 28 });

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      // Track whenever cursor is near the section (including slight overshoot)
      const pad = 80;
      if (
        e.clientX < r.left - pad ||
        e.clientX > r.right + pad ||
        e.clientY < r.top - pad ||
        e.clientY > r.bottom + pad
      ) {
        return;
      }
      setPos({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  const spotOpacity = intensity === "strong" ? 0.22 : 0.12;
  const dotOpacity = intensity === "strong" ? 0.4 : 0.22;
  const lineOpacity = intensity === "strong" ? 0.14 : 0.08;

  return (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          opacity: dotOpacity,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(245 158 11 / 0.55) 1px, transparent 0)",
          backgroundSize: `${density}px ${density}px`,
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 85%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: lineOpacity,
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.45) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.45) 1px, transparent 1px)
          `,
          backgroundSize: `${density * 2}px ${density * 2}px`,
        }}
      />
      {/* Primary spotlight */}
      <div
        className="absolute inset-0 transition-[background] duration-150 ease-out"
        style={{
          background: `radial-gradient(640px circle at ${pos.x}% ${pos.y}%, rgb(245 158 11 / ${spotOpacity}), transparent 52%)`,
        }}
      />
      {/* Secondary cooler wash for depth */}
      <div
        className="absolute inset-0 transition-[background] duration-200 ease-out"
        style={{
          background: `radial-gradient(420px circle at ${Math.min(pos.x + 12, 95)}% ${Math.min(pos.y + 8, 90)}%, rgb(59 130 246 / 0.06), transparent 55%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-5%,rgb(245_158_11_/_0.16),transparent_48%)]" />
      {/* Slow drift beam */}
      {!reduceMotion && (
        <div
          className="absolute -inset-x-1/4 top-0 h-full opacity-30"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgb(245 158 11 / 0.07) 50%, transparent 60%)",
            animation: "cinematic-beam 9s ease-in-out infinite",
          }}
        />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgb(11_15_23_/_0.55)_100%)]" />
    </div>
  );
}

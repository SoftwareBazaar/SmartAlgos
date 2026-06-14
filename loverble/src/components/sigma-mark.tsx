import { cn } from "@/lib/utils";

type SigmaMarkProps = {
  size?: number;
  className?: string;
  /** Green trace on the diagonal leg — off for smallest favicon renders */
  signal?: boolean;
};

/** Uniform stroke in viewBox units — all three Σ legs match. */
const STROKE = 3.25;

/**
 * Classic capital Σ (inverted-3 / W silhouette) — NOT a Z.
 * Three separate legs: top bar, diagonal to left midpoint, bottom bar.
 */
const SIGMA = {
  top: "M6 10H34",
  /** Top-right → left midpoint vertex */
  diagonal: "M34 10L6 20",
  bottom: "M6 30H34",
} as const;

/** ~68% along diagonal — signal runs through the midpoint */
const SIGNAL_SPLIT = { x: 15, y: 17 } as const;

/**
 * Concept B — Σ with live signal trace on the upper diagonal leg.
 */
export function SigmaMark({
  size = 32,
  className,
  signal = true,
}: SigmaMarkProps) {
  const cap = { strokeWidth: STROKE, strokeLinecap: "square" as const, strokeLinejoin: "miter" as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path d={SIGMA.top} stroke="var(--color-gold)" {...cap} />
      {signal ? (
        <>
          <path d={`M34 10L${SIGNAL_SPLIT.x} ${SIGNAL_SPLIT.y}`} stroke="var(--color-bull)" {...cap} />
          <path d={`M${SIGNAL_SPLIT.x} ${SIGNAL_SPLIT.y}L6 20`} stroke="var(--color-gold)" {...cap} />
        </>
      ) : (
        <path d={SIGMA.diagonal} stroke="var(--color-gold)" {...cap} />
      )}
      <path d={SIGMA.bottom} stroke="var(--color-gold)" {...cap} />
    </svg>
  );
}

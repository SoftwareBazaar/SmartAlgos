import { cn } from "@/lib/utils";

type SigmaMarkProps = {
  size?: number;
  className?: string;
  /** Green trace on the diagonal — off for smallest favicon renders */
  signal?: boolean;
};

/** Uniform stroke in viewBox units — keeps all Σ legs geometrically even. */
const STROKE = 3.25;
const SIGMA = {
  top: "M6 10H34",
  /** Diagonal split ~62% — signal cuts through the midpoint intentionally */
  diagonalSignal: "M34 10L17 23",
  diagonalBase: "M17 23L10 30",
  bottom: "M10 30H34",
} as const;

/**
 * Concept B — capital Σ with live signal trace on the upper diagonal.
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
          <path d={SIGMA.diagonalSignal} stroke="var(--color-bull)" {...cap} />
          <path d={SIGMA.diagonalBase} stroke="var(--color-gold)" {...cap} />
        </>
      ) : (
        <path d="M34 10L10 30" stroke="var(--color-gold)" {...cap} />
      )}
      <path d={SIGMA.bottom} stroke="var(--color-gold)" {...cap} />
    </svg>
  );
}

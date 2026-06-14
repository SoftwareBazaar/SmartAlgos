import { useId } from "react";
import { cn } from "@/lib/utils";

type SigmaMarkProps = {
  size?: number;
  className?: string;
  /** Concept B — quant signal polyline through the Σ midpoint */
  signal?: boolean;
};

/** Single-path Σ from logo concepts: top → center vertex → bottom (inverted-3 / W). */
export const SIGMA_PATH = "M18 16 L62 16 L38 40 L62 64 L18 64";

/** Algo trace crossing the midpoint — Concept B */
export const SIGNAL_POINTS = "22,40 30,33 36,44 42,36 48,40 56,40";

/** Thicker relative stroke at smaller render sizes (matches concept size tests). */
function strokeWidth(size: number) {
  if (size <= 16) return 7;
  if (size <= 24) return 6;
  if (size <= 32) return 5.5;
  return 5;
}

/**
 * Concept B — Σ fusion mark aligned to SAIS logo concepts HTML.
 */
export function SigmaMark({
  size = 32,
  className,
  signal = true,
}: SigmaMarkProps) {
  const gradId = useId().replace(/:/g, "");
  const sw = strokeWidth(size);
  const showSignal = signal && size >= 28;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.82 0.12 85)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>
      <path
        d={SIGMA_PATH}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showSignal && (
        <polyline
          points={SIGNAL_POINTS}
          fill="none"
          stroke="var(--color-bull)"
          strokeWidth={Math.max(1.8, sw * 0.45)}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.9}
        />
      )}
    </svg>
  );
}

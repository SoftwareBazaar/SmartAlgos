import { cn } from "@/lib/utils";

type SigmaMarkProps = {
  size?: number;
  className?: string;
  /** Hide signal line for smallest sizes / favicon-style use */
  signal?: boolean;
};

/**
 * Classic capital Σ — top bar, diagonal leg, bottom bar.
 * Bold strokes so the symbol reads clearly from 16px favicon to nav.
 */
export function SigmaMark({
  size = 32,
  className,
  signal = true,
}: SigmaMarkProps) {
  const stroke = Math.max(2.75, size * 0.1);

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
      <path
        d="M6 10H34"
        stroke="var(--color-gold)"
        strokeWidth={stroke}
        strokeLinecap="square"
      />
      <path
        d="M34 10L10 30"
        stroke="var(--color-gold)"
        strokeWidth={stroke}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      <path
        d="M10 30H34"
        stroke="var(--color-gold)"
        strokeWidth={stroke}
        strokeLinecap="square"
      />
      {signal && (
        <>
          <path
            d="M5 20H35"
            stroke="var(--color-bull)"
            strokeWidth={Math.max(1.25, stroke * 0.45)}
            strokeLinecap="round"
            opacity="0.95"
          />
          <circle cx="28" cy="20" r={stroke * 0.35} fill="var(--color-bull)" />
        </>
      )}
    </svg>
  );
}

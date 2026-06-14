import { cn } from "@/lib/utils";

/** Concept B — geometric Σ with live signal trace. Scales cleanly from 16px favicon to nav. */
export function SigmaMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M5 8H27"
        stroke="var(--color-gold)"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M27 8L13 24"
        stroke="var(--color-gold)"
        strokeWidth="2.5"
        strokeLinejoin="miter"
      />
      <path
        d="M5 24H27"
        stroke="var(--color-gold)"
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      <path
        d="M4 16H28"
        stroke="var(--color-bull)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.92"
      />
      <circle cx="22" cy="16" r="1.75" fill="var(--color-bull)" />
    </svg>
  );
}

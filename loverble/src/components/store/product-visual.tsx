import type { ExcelModuleProduct } from "@/lib/excel-module-catalog";

const THEMES: Record<string, { a: string; b: string; label: string }> = {
  "portfolio-monte-carlo-risk-suite": {
    a: "#c9a227",
    b: "#3d6ea8",
    label: "PORTFOLIO",
  },
  "multi-leg-options-greeks-visualizer": {
    a: "#6ec6ff",
    b: "#c9a227",
    label: "OPTIONS",
  },
  "fixed-income-yield-curve-duration": {
    a: "#7dcea0",
    b: "#c9a227",
    label: "FIXED INCOME",
  },
  "multi-factor-quant-stock-selector": {
    a: "#e8a0bf",
    b: "#c9a227",
    label: "FACTORS",
  },
  "quantitative-finance-master-bundle": {
    a: "#c9a227",
    b: "#e8d5a3",
    label: "MASTER SUITE",
  },
};

/** Compact product cover — sized for store cards, not a full-bleed hero. */
export function ProductVisual({
  product,
  className = "",
}: {
  product: ExcelModuleProduct;
  className?: string;
}) {
  const theme = THEMES[product.id] ?? THEMES["quantitative-finance-master-bundle"];

  return (
    <div
      className={`relative aspect-[4/3] w-full max-w-[220px] overflow-hidden rounded-md border border-border/60 bg-[#0a0f1a] ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 220 165" className="h-full w-full">
        <defs>
          <linearGradient id={`g-${product.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={theme.a} stopOpacity="0.35" />
            <stop offset="100%" stopColor={theme.b} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <rect width="220" height="165" fill={`url(#g-${product.id})`} />
        <rect x="28" y="28" width="120" height="100" rx="4" fill="#121a2b" stroke={theme.a} strokeOpacity="0.5" />
        <rect x="36" y="40" width="70" height="6" rx="2" fill={theme.a} opacity="0.85" />
        <rect x="36" y="54" width="96" height="4" rx="1" fill="#9aa4b2" opacity="0.45" />
        <rect x="36" y="64" width="88" height="4" rx="1" fill="#9aa4b2" opacity="0.3" />
        <polyline
          fill="none"
          stroke={theme.a}
          strokeWidth="1.5"
          points="40,110 58,98 76,102 94,86 112,90 130,74"
        />
        <text x="28" y="148" fill={theme.a} fontSize="9" fontFamily="system-ui" letterSpacing="1.5">
          {theme.label}
        </text>
        <text x="150" y="148" fill="#9aa4b2" fontSize="8" fontFamily="system-ui">
          .XLSX
        </text>
      </svg>
    </div>
  );
}

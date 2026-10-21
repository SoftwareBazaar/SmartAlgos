import type { FinanceCategory } from "@/lib/finance-notes";

const ACCENT: Record<FinanceCategory, string> = {
  Credit: "from-amber-500/30 via-transparent to-transparent",
  Debt: "from-sky-500/25 via-transparent to-transparent",
  Loans: "from-emerald-500/25 via-transparent to-transparent",
  Tax: "from-violet-500/25 via-transparent to-transparent",
};

/** Compact chart-style thumbnail for note cards (no external image asset). */
export function NoteThumb({
  category,
  stats,
}: {
  category: FinanceCategory;
  stats: { label: string; value: string }[];
}) {
  return (
    <div
      className={`relative h-[120px] w-full overflow-hidden rounded-md border border-border/50 bg-dominant bg-gradient-to-br ${ACCENT[category]}`}
      aria-hidden
    >
      <svg viewBox="0 0 240 120" className="absolute inset-0 h-full w-full opacity-80">
        <polyline
          fill="none"
          stroke="oklch(0.78 0.13 85)"
          strokeWidth="2"
          points="12,88 48,72 84,78 120,52 156,58 192,34 228,40"
        />
        <polyline
          fill="none"
          stroke="oklch(0.65 0.08 240)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          points="12,70 48,66 84,58 120,48 156,30 192,22 228,18"
        />
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex gap-2">
        {stats.slice(0, 2).map((s) => (
          <div
            key={s.label}
            className="rounded bg-background/80 backdrop-blur-sm px-2 py-1 border border-border/40"
          >
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="text-xs font-semibold text-gold leading-tight">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

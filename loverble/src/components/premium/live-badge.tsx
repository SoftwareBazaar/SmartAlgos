/** Soft status for deployed models without a public verification URL. */
export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground font-medium ${className}`}
    >
      Deployed · link pending
    </span>
  );
}

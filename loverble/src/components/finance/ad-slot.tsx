/**
 * AdSense placement — renders nothing until a real creative is wired.
 * Never show empty developer slot IDs to readers.
 */
export function AdSlot({
  id,
  enabled = false,
}: {
  id: string;
  label?: string;
  /** Set true only when a live ad network creative is configured for this slot. */
  enabled?: boolean;
}) {
  if (!enabled) return null;

  return (
    <aside
      data-ad-slot={id}
      aria-label="Advertisement"
      className="my-4 flex min-h-[90px] items-center justify-center rounded-lg border border-border/40 bg-card/20 px-4 py-6"
    >
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Advertisement
      </span>
    </aside>
  );
}

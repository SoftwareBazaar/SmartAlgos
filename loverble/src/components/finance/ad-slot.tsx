/** Reserved placement for AdSense / ad networks after ~5 published notes. */
export function AdSlot({
  id,
  label = "Sponsored",
}: {
  id: string;
  label?: string;
}) {
  return (
    <aside
      data-ad-slot={id}
      aria-label={label}
      className="my-2 flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/20 px-4 py-6"
    >
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
        {label} · slot {id}
      </span>
    </aside>
  );
}

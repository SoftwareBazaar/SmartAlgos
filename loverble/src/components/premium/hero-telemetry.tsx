/** Illustrative systems console — matches revamp template hero panel. */
export function HeroTelemetry() {
  const rows = [
    { t: "09:41:08", tag: "LEDGER", text: "Posting batch reconciled" },
    { t: "09:41:12", tag: "GATEWAY", text: "API latency metric · not connected" },
    { t: "09:41:16", tag: "RESEARCH", text: "QuantConnect tick sync" },
    { t: "09:41:20", tag: "RISK", text: "Policy check recorded" },
  ] as const;

  return (
    <aside
      className="telemetry-panel surface-card rounded-[var(--radius)] p-5 md:p-6 min-h-[280px] md:min-h-[360px] flex flex-col"
      aria-label="Illustrative analytics dashboard and sample platform telemetry"
    >
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border font-mono text-[10px] tracking-wide text-foreground">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_14px_rgb(245_158_11_/_0.7)]" />
          SYSTEMS CONSOLE
        </div>
        <span className="text-gold">PREVIEW</span>
      </div>

      <p className="mt-4 mb-3 font-mono text-[9px] tracking-wider text-muted-foreground">
        ILLUSTRATIVE EVENT STREAM <span className="text-gold-deep">· NOT LIVE · EAT (UTC+3)</span>
      </p>

      <div className="grid gap-1.5 flex-1">
        {rows.map((r) => (
          <div
            key={r.t}
            className="grid grid-cols-[67px_65px_1fr_auto] max-sm:grid-cols-[57px_58px_1fr] items-start gap-2 rounded-md bg-black/35 px-2.5 py-2.5 font-mono text-[10px] leading-relaxed text-muted-foreground"
          >
            <time>{r.t}</time>
            <b className="font-medium text-gold">{r.tag}</b>
            <span>{r.text}</span>
            <em className="max-sm:hidden text-[8px] not-italic text-muted-foreground">EXAMPLE</em>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 font-mono text-[9px] text-muted-foreground">
        <span>ENVIRONMENT</span>
        <span className="text-gold">STATIC UI DEMO</span>
      </div>
    </aside>
  );
}

import { ReactNode } from "react";

export function PageShell({
  eyebrow, title, description, actions, children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
        <div>
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">{eyebrow}</div>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function StatCard({
  label, value, delta, hint, accent,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  accent?: "up" | "down" | "neutral";
}) {
  const color = accent === "up" ? "text-bull" : accent === "down" ? "text-bear" : "text-muted-foreground";
  return (
    <div className="surface-card rounded-lg p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl md:text-3xl font-semibold text-foreground" data-numeric>
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-1.5 flex items-center gap-2 text-xs">
          {delta && <span className={`font-mono ${color}`}>{delta}</span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function SectionCard({
  title, subtitle, action, children, className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card rounded-lg ${className}`}>
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

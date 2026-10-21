import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { StickyNav } from "@/components/premium/sticky-nav";
import { MOBILE_NAV, PRIMARY_NAV } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <StickyNav>
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center cursor-pointer shrink-0" onClick={() => setOpen(false)}>
          <BrandLogo variant="nav" />
        </Link>

        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== "/" && pathname.startsWith(item.to + "/"));
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={cn(
                  "transition-colors duration-200 cursor-pointer border-b-2 border-transparent pb-0.5 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
                  active
                    ? "text-gold border-gold"
                    : "text-muted-foreground hover:text-gold",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/portal"
            className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition-colors duration-200 cursor-pointer"
          >
            {pathname.startsWith("/store") ? "My downloads" : "Portal"}
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </StickyNav>

      {open && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[60] bg-dominant/98 backdrop-blur-md border-t border-border overflow-y-auto overscroll-contain">
          <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col min-h-full justify-between gap-8">
            <nav className="flex flex-col" aria-label="Mobile">
              {MOBILE_NAV.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  hash={"hash" in item ? item.hash : undefined}
                  onClick={() => setOpen(false)}
                  className="py-3 border-b border-border text-lg font-semibold text-foreground hover:text-gold transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="rounded-xl border border-gold/30 bg-secondary-surface p-4 mb-4">
              <div className="flex items-center gap-2 text-xs text-bull font-semibold mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-bull" />
                </span>
                Research first · client portal
              </div>
              <p className="text-xs text-muted-foreground mb-3">Open allocations, sandbox backtests, and unlocked files.</p>
              <Link
                to="/portal"
                onClick={() => setOpen(false)}
                className="flex w-full min-h-12 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold cursor-pointer hover:bg-gold-soft transition-colors mb-2"
              >
                Open Client Portal
              </Link>
              <Link
                to="/finance"
                onClick={() => setOpen(false)}
                className="flex w-full min-h-12 items-center justify-center rounded-lg border border-border text-sm font-bold cursor-pointer hover:border-gold transition-colors"
              >
                Decision Math notes
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteHeaderSpacer({ className }: { className?: string }) {
  return <div className={cn("h-16", className)} aria-hidden />;
}

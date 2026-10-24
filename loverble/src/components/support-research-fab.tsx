import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPortalPath, isSupportPath } from "@/lib/site-nav";

const SWIPE_NEED = 0.72;

function CandleBarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <rect x="8" y="6" width="32" height="36" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <path d="M16 6v36M24 6v36M32 6v36" stroke="currentColor" strokeWidth="1.25" opacity="0.4" />
      <path d="M20 34h8v4h-8z" fill="currentColor" opacity="0.85" />
      <path d="M22 22h4v12h-4z" fill="currentColor" opacity="0.75" />
      <path
        d="M24 12c1.2 2.4 2.2 4.2 0 7.2-2.2-3-1.2-4.8 0-7.2Z"
        fill="#f59e0b"
        stroke="#fbbf24"
        strokeWidth="0.6"
      />
      <circle cx="24" cy="11" r="1.4" fill="#fef3c7" opacity="0.9" />
    </svg>
  );
}

function CoinFace({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid h-12 w-12 place-items-center rounded-full border-2 border-amber-500/80 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-[0_4px_16px_rgb(245_158_11_/_0.45)]",
        className,
      )}
    >
      SA
    </div>
  );
}

/**
 * Corner “Support research” prompt: candle behind bars → swipe coin → Paystack /support.
 */
export function SupportResearchFab() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startProg = useRef(0);
  const freed = useRef(false);

  const hidden = isSupportPath(pathname) || isPortalPath(pathname) || pathname === "/auth";

  const goSupport = useCallback(() => {
    setOpen(false);
    setProgress(0);
    freed.current = false;
    void navigate({ to: "/support" });
  }, [navigate]);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      freed.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    startX.current = e.clientX;
    startProg.current = progress;
    freed.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current) return;
    const w = trackRef.current.clientWidth - 56;
    if (w < 1) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(1, Math.max(0, startProg.current + delta / w));
    setProgress(next);
    if (next >= SWIPE_NEED && !freed.current) {
      freed.current = true;
      setDragging(false);
      goSupport();
    }
  };

  const endDrag = () => {
    setDragging(false);
    if (progress >= SWIPE_NEED) {
      goSupport();
      return;
    }
    setProgress(0);
  };

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Support research"
        title="Support research"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-[#0d121c]/95 text-gold shadow-[0_12px_40px_rgb(0_0_0_/_0.45)] backdrop-blur-md transition hover:border-gold hover:bg-gold/10 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <CandleBarsIcon className="h-8 w-8" />
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_10px_rgb(245_158_11_/_0.9)]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-research-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-gold/30 bg-[#0d121c] p-5 md:p-6 shadow-[0_24px_80px_rgb(0_0_0_/_0.5)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <span className="inline-grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                <CandleBarsIcon className="h-8 w-8" />
              </span>
              <div>
                <p className="font-mono text-[9px] tracking-[0.16em] text-gold">SUPPORT RESEARCH</p>
                <h2 id="support-research-title" className="mt-1 font-display text-xl font-semibold tracking-tight">
                  Free the next notebook
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Independent quant work stays lit when someone backs it. Swipe the coin to open Paystack and choose
                  what you can give.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Swipe to support</p>
              <div
                ref={trackRef}
                className="relative h-14 rounded-full border border-border bg-black/40 overflow-hidden select-none touch-none"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/25 to-gold/5 transition-[width] duration-75"
                  style={{ width: `${Math.max(progress * 100, 8)}%` }}
                />
                <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-medium text-muted-foreground/80">
                  {progress >= SWIPE_NEED ? "Opening Paystack…" : "Slide coin →"}
                </p>
                <div
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  aria-label="Swipe coin to support research"
                  tabIndex={0}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goSupport();
                    }
                  }}
                  className="absolute top-1 z-10 cursor-grab active:cursor-grabbing"
                  style={{ left: `calc(${progress * 100}% - ${progress * 3.5}rem)`, marginLeft: "0.25rem" }}
                >
                  <CoinFace />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={goSupport}
              className="mt-4 w-full min-h-11 rounded-lg border border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-gold/40 hover:text-gold transition"
            >
              Skip swipe · open Support research
            </button>
          </div>
        </div>
      )}
    </>
  );
}

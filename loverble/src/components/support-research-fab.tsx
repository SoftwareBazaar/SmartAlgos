import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPortalPath, isSupportPath } from "@/lib/site-nav";

const SWIPE_NEED = 0.72;

function CoinFace({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid h-12 w-12 place-items-center rounded-full border-2 border-rose-400/90 bg-gradient-to-br from-rose-300 via-rose-500 to-rose-700 text-white shadow-[0_4px_16px_rgb(244_63_94_/_0.45)]",
        className,
      )}
    >
      <Heart className="h-5 w-5 fill-white" />
    </div>
  );
}

/**
 * Corner support prompt: red heart → swipe → short thank-you → Paystack /support.
 * Footer keeps the single “Support research” text link.
 */
export function SupportResearchFab() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startProg = useRef(0);
  const freed = useRef(false);

  const hidden = isSupportPath(pathname) || isPortalPath(pathname) || pathname === "/auth";

  const finishAndGo = useCallback(() => {
    if (freed.current) return;
    freed.current = true;
    setUnlocked(true);
    setDragging(false);
    window.setTimeout(() => {
      setOpen(false);
      setProgress(0);
      setUnlocked(false);
      freed.current = false;
      void navigate({ to: "/support" });
    }, 900);
  }, [navigate]);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setUnlocked(false);
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
    if (unlocked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    startX.current = e.clientX;
    startProg.current = progress;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !trackRef.current || unlocked) return;
    const w = trackRef.current.clientWidth - 56;
    if (w < 1) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(1, Math.max(0, startProg.current + delta / w));
    setProgress(next);
    if (next >= SWIPE_NEED) finishAndGo();
  };

  const endDrag = () => {
    setDragging(false);
    if (progress >= SWIPE_NEED) finishAndGo();
    else if (!unlocked) setProgress(0);
  };

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Support research"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500 bg-red-600 text-white shadow-[0_12px_40px_rgb(220_38_38_/_0.55)] transition hover:bg-red-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        {/* Solid red love icon — unmistakable vs previous candle FAB */}
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <path
            fill="currentColor"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            aria-label="Close"
            onClick={() => !unlocked && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-research-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-rose-500/25 bg-[#0d121c] p-5 md:p-6 shadow-[0_24px_80px_rgb(0_0_0_/_0.5)]"
          >
            {!unlocked && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground transition"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {unlocked ? (
              <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-500/15 ring-2 ring-rose-500/40">
                  <Heart className="h-8 w-8 fill-rose-500 text-rose-500 animate-pulse" />
                </div>
                <h2 className="font-display text-xl font-semibold tracking-tight">Thank you</h2>
                <p className="mt-2 text-sm text-muted-foreground">Opening Paystack so you can choose an amount…</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 pr-8">
                  <span className="inline-grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
                    <Heart className="h-6 w-6 fill-rose-500" />
                  </span>
                  <div>
                    <h2 id="support-research-title" className="font-display text-xl font-semibold tracking-tight">
                      Back independent research
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Swipe the heart coin to open a secure Paystack checkout and pick what you can give.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Slide to continue</p>
                  <div
                    ref={trackRef}
                    className="relative h-14 rounded-full border border-border bg-black/40 overflow-hidden select-none touch-none"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500/30 to-rose-500/5 transition-[width] duration-75"
                      style={{ width: `${Math.max(progress * 100, 8)}%` }}
                    />
                    <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-medium text-muted-foreground/80">
                      Slide →
                    </p>
                    <div
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress * 100)}
                      aria-label="Swipe to support research"
                      tabIndex={0}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setProgress(1);
                          finishAndGo();
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
                  onClick={() => {
                    setProgress(1);
                    finishAndGo();
                  }}
                  className="mt-4 w-full min-h-11 rounded-lg border border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-rose-400/40 hover:text-rose-400 transition"
                >
                  Continue to checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

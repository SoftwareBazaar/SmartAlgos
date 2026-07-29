import { useState, useEffect, useCallback } from "react";
import { Mail, Lock, CheckCircle, Loader2 } from "lucide-react";

const GATE_KEY = "algosmart_gate_email";

function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(GATE_KEY); } catch { return null; }
}

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

/**
 * EmailGate — free email subscription wall.
 * Submit email once → content unlocks immediately via localStorage.
 */
export function EmailGate({
  children,
  title = "Subscribe to access",
  description = "Enter your email to view this content — completely free, no account needed.",
}: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  // Start as null (SSR-safe), hydrate on client mount
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setUnlocked(!!getStoredEmail());
  }, []);

  const unlock = useCallback((addr: string) => {
    try { localStorage.setItem(GATE_KEY, addr); } catch {}
    setUnlocked(true);
  }, []);

  // Not yet hydrated — show nothing to avoid layout flash
  if (unlocked === null) return null;

  // Already subscribed — show content directly
  if (unlocked) return <>{children}</>;

  const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setSubmitting(true);
    try {
      // Non-blocking backend notify
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "content_gate" }),
      }).catch(() => {});
      setSuccess(true);
      // Short delay so user sees the success state, then unlock
      setTimeout(() => unlock(email), 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Blurred teaser of content below */}
      <div className="pointer-events-none select-none filter blur-sm opacity-25 max-h-36 overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />

      {/* Gate card */}
      <div className="mt-6 rounded-lg border border-gold/30 bg-card/70 backdrop-blur-sm p-8 text-center max-w-md mx-auto shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
          {success ? <CheckCircle className="h-6 w-6 text-bull" /> : <Lock className="h-6 w-6 text-gold" />}
        </div>

        {success ? (
          <div>
            <div className="font-display text-lg font-semibold text-foreground">You&apos;re in!</div>
            <p className="text-sm text-muted-foreground mt-2">Unlocking content for you now…</p>
            <div className="mt-4 flex justify-center">
              <div className="h-1 w-32 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full animate-[grow_0.8s_ease-out_forwards]" style={{ width: "0%" }} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition"
                  disabled={submitting}
                />
              </div>
              {error && <p className="text-xs text-red-400 text-left">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft active:scale-[0.98] transition disabled:opacity-60 cursor-pointer"
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Subscribing…</>
                  : <><Mail className="h-4 w-4" /> Subscribe &amp; View Content</>
                }
              </button>
            </form>

            <p className="mt-3 text-[11px] text-muted-foreground">
              Free forever. No spam. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

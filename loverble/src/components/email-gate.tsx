import { useState, useEffect } from "react";
import { Mail, Lock, CheckCircle, Loader2 } from "lucide-react";

const GATE_KEY = "algosmart_gate_email";

export function useGateEmail() {
  const [gateEmail, setGateEmail] = useState<string | null>(null);
  useEffect(() => {
    setGateEmail(localStorage.getItem(GATE_KEY));
  }, []);
  const unlock = (email: string) => {
    localStorage.setItem(GATE_KEY, email);
    setGateEmail(email);
  };
  return { gateEmail, unlock };
}

type Props = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

/**
 * EmailGate wraps content behind a free email subscription wall.
 * Once an email is submitted, the gate is stored in localStorage
 * and content is revealed immediately — no payment required.
 */
export function EmailGate({
  children,
  title = "Subscribe to access",
  description = "Enter your email to view strategies, performance data, and research content — free, no account needed.",
}: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { gateEmail, unlock } = useGateEmail();

  if (gateEmail) {
    return <>{children}</>;
  }

  const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    setSubmitting(true);
    try {
      // Non-blocking backend notify — works even if endpoint is absent
      fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "content_gate" }),
      }).catch(() => {});
      setSuccess(true);
      setTimeout(() => unlock(email), 900);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Blurred teaser */}
      <div className="pointer-events-none select-none filter blur-sm opacity-30 max-h-40 overflow-hidden">
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Gate card */}
      <div className="mt-4 rounded-lg border border-gold/30 bg-card/60 p-8 text-center max-w-md mx-auto">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
          {success ? <CheckCircle className="h-6 w-6 text-bull" /> : <Lock className="h-6 w-6 text-gold" />}
        </div>

        {success ? (
          <div>
            <div className="font-display text-lg font-semibold">You&apos;re in!</div>
            <p className="text-sm text-muted-foreground mt-1">Unlocking content…</p>
          </div>
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@email.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-gold/60"
                  disabled={submitting}
                />
              </div>
              {error && <p className="text-xs text-bear text-left">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition disabled:opacity-60"
              >
                {submitting
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Subscribing…</>
                  : <><Mail className="h-3.5 w-3.5" /> Subscribe &amp; View Content</>
                }
              </button>
            </form>

            <p className="mt-3 text-[11px] text-muted-foreground">
              No spam. Unsubscribe anytime. Already paid?{" "}
              <a href="/auth" className="text-gold hover:underline">Sign in →</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

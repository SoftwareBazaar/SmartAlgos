import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

const GATE_KEY = "algosmart_gate_email";

export function FinanceNotesSignup({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      try {
        localStorage.setItem(GATE_KEY, email.trim().toLowerCase());
      } catch {
        /* ignore */
      }
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: "finance_notes" }),
      }).catch(() => null);
      setDone(true);
      toast.success("You’re on the list for new notes.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className="text-sm text-foreground/90">
        Thanks — we’ll send new decision-math notes to <strong>{email}</strong>.
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "flex flex-col sm:flex-row gap-2"
          : "flex flex-col sm:flex-row gap-2 max-w-md"
      }
    >
      <label className="sr-only" htmlFor="finance-notes-email">
        Email
      </label>
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          id="finance-notes-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-sm border border-border bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Get new notes
      </button>
    </form>
  );
}

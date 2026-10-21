import { useState } from "react";
import { Download, Loader2, Mail } from "lucide-react";
import { FREE_SAMPLE } from "@/lib/excel-module-catalog";
import { toast } from "sonner";

const KEY = "smartalgo_free_bs_sample";

export function FreeSampleGate() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      try {
        localStorage.setItem(KEY, email.trim().toLowerCase());
      } catch {
        /* ignore */
      }
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: "excel_free_sample" }),
      }).catch(() => null);
      setUnlocked(true);
      toast.success("Sample unlocked — check the download link below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-5 md:p-6 space-y-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Free sample</p>
      <h3 className="font-display text-xl font-semibold">{FREE_SAMPLE.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[60ch]">
        {FREE_SAMPLE.description}
      </p>
      {unlocked ? (
        <a
          href={`/samples/${FREE_SAMPLE.filename}`}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft"
        >
          <Download className="h-3.5 w-3.5" /> Download sample (.xlsx)
        </a>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for download link"
              className="w-full rounded-sm border border-border/80 bg-background pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-gold/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Unlock sample
          </button>
        </form>
      )}
      <p className="text-[11px] text-muted-foreground">
        Sample file ships as {FREE_SAMPLE.filename}. If the download 404s until the file is uploaded
        to <code className="text-foreground/80">public/samples/</code>, you’ll still be on the list.
      </p>
    </div>
  );
}

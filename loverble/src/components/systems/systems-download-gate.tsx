import { useState } from "react";
import { Download, FileCode2, FileText, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { SystemsEngine } from "@/lib/systems-engines";

export function SystemsDownloadGate({ engine }: { engine: SystemsEngine }) {
  const key = `smartalgo_systems_dl_${engine.slug}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem(key);
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
        localStorage.setItem(key, email.trim().toLowerCase());
      } catch {
        /* ignore */
      }
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: `systems_ref_${engine.slug}`,
        }),
      }).catch(() => null);
      setUnlocked(true);
      toast.success("Reference pack unlocked — downloads are ready below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="download"
      className="rounded-2xl border border-gold/30 bg-[#111827]/70 p-5 md:p-7 scroll-mt-24"
    >
      <p className="font-mono text-[9px] tracking-[0.14em] text-gold">REFERENCE PACK</p>
      <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
        Download after registration
      </h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[55ch]">
        Educational architecture reference for {engine.name}. Not a production licence and not financial advice.
      </p>

      {unlocked ? (
        <ul className="mt-5 space-y-2">
          {engine.files.map((f) => {
            const Icon = f.filename.endsWith(".py") || f.filename.endsWith(".sql") ? FileCode2 : FileText;
            return (
              <li key={f.filename}>
                <a
                  href={f.href}
                  download
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-black/25 px-3 py-3 hover:border-gold/40 transition"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">{f.label}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">{f.filename}</span>
                  </span>
                  <Download className="h-4 w-4 shrink-0 text-gold" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <label className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email to unlock downloads"
              className="w-full min-h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm focus:outline-none focus:border-gold/60"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Unlock pack
          </button>
        </form>
      )}
    </div>
  );
}

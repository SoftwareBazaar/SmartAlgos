import { useState } from "react";
import { Building2, Download, FileCode2, FileText, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { SystemsEngine } from "@/lib/systems-engines";
import { isValidEmailShape, isWorkEmail, WORK_EMAIL_HINT } from "@/lib/work-email";

export function SystemsDownloadGate({ engine }: { engine: SystemsEngine }) {
  const key = `smartalgo_systems_dl_${engine.slug}`;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem(key);
      return !!saved && isWorkEmail(saved);
    } catch {
      return false;
    }
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmailShape(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (!isWorkEmail(trimmed)) {
      toast.error("Work email required", { description: WORK_EMAIL_HINT });
      return;
    }
    setLoading(true);
    try {
      try {
        localStorage.setItem(key, trimmed);
      } catch {
        /* ignore */
      }
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          source: `systems_ref_${engine.slug}`,
          meta: { gate: "work_email", engine: engine.slug },
        }),
      }).catch(() => null);
      setUnlocked(true);
      toast.success("Pack unlocked", {
        description: "We'll follow up on your work email about architecture options.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="download"
      className="rounded-2xl border border-gold/30 bg-[#111827]/80 p-5 md:p-7 scroll-mt-24"
    >
      <div className="flex items-start gap-3">
        <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/30 bg-gold/10 text-gold">
          <Building2 className="h-4 w-4" />
        </span>
        <div>
          <p className="font-mono text-[9px] tracking-[0.14em] text-gold">INSTITUTIONAL DOWNLOAD</p>
          <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight">
            Unlock with your work email
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[55ch]">
            Reference pack for {engine.name}. Restricted to bank, SACCO, fintech, and corporate domains so we can
            follow up on architecture reviews. Not a production licence.
          </p>
        </div>
      </div>

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
        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative flex-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbank.co.ke"
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
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{WORK_EMAIL_HINT}</p>
        </form>
      )}
    </div>
  );
}

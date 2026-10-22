import { useState } from "react";
import { Download, Loader2, Mail, FileCode2, FileJson, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { SPY_PSAR_DOWNLOADS, SPY_PSAR_SLUG } from "@/lib/spy-psar-strategy";

const KEY = `smartalgo_strategy_dl_${SPY_PSAR_SLUG}`;

const ICONS = {
  "README.txt": FileText,
  "backtest_spy_psar.py": FileCode2,
  "backtest_report.json": FileJson,
  "backtest_report.txt": FileText,
  "equity_curves.png": ImageIcon,
} as const;

export function StrategyDownloadGate() {
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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: `strategy_free_${SPY_PSAR_SLUG}`,
        }),
      }).catch(() => null);
      setUnlocked(true);
      toast.success("Pack unlocked — downloads are ready below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="download"
      className="scroll-mt-28 rounded-xl border border-gold/30 bg-secondary-surface/60 p-5 md:p-6 space-y-4"
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Free research pack</p>
        <h3 className="font-display text-xl font-semibold mt-1">Download after registration</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[65ch] leading-relaxed">
          Python replication script, full metrics JSON/TXT, and equity-curve figure. Free with email —
          educational use only, not a live signal feed.
        </p>
      </div>

      {unlocked ? (
        <ul className="grid sm:grid-cols-2 gap-2">
          {SPY_PSAR_DOWNLOADS.map((f) => {
            const Icon = ICONS[f.filename as keyof typeof ICONS] ?? FileText;
            return (
              <li key={f.filename}>
                <a
                  href={f.href}
                  download
                  className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-card/40 px-3 py-2.5 text-sm hover:border-gold/40 transition"
                >
                  <Icon className="h-4 w-4 text-gold shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{f.label}</span>
                    <span className="block text-[11px] text-muted-foreground truncate">{f.filename}</span>
                  </span>
                  <Download className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-lg">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email to unlock downloads"
              className="w-full rounded-sm border border-border/80 bg-background pl-10 pr-3 py-2.5 text-sm focus:outline-none focus-visible:border-gold/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Unlock free pack
          </button>
        </form>
      )}

      <p className="text-[11px] text-muted-foreground">
        We use your email only for delivery and occasional research notes. Past backtests are not
        indicative of future results.
      </p>
    </div>
  );
}

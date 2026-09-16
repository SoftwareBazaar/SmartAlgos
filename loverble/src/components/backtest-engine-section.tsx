import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { runSandboxBacktest } from "@/lib/portal-api";

const inputClass =
  "w-full bg-dominant border border-border rounded-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:border-gold/60";

type Result = {
  cagr: string;
  sharpe: string;
  maxDrawdown: string;
  winRate: string;
  asset: string;
  lookback: string;
  emailed?: boolean;
};

export function BacktestEngineSection({ compact = false }: { compact?: boolean }) {
  const [asset, setAsset] = useState("EUR/USD (Forex 1-Min)");
  const [lookback, setLookback] = useState("3 Years (Tick Level)");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [email, setEmail] = useState("");

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    try {
      const data = await runSandboxBacktest({
        email: email.trim() || undefined,
        assetClass: asset,
        lookbackPeriod: lookback,
      });
      setResult({ ...data.metrics, asset, lookback, emailed: data.emailed });
      if (email.includes("@")) {
        toast.success(data.emailed ? "Tear sheet emailed" : "Run saved — email could not send yet", {
          description: data.emailed
            ? "Check your inbox for the sample sandbox report."
            : "Results are on screen. Email delivery needs SENDGRID or SMTP on the server.",
        });
      }
    } catch (err) {
      toast.error((err as Error).message || "Backtest failed");
    } finally {
      setRunning(false);
    }
  };

  const requestSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setRunning(true);
    try {
      const data = await runSandboxBacktest({
        email: email.trim(),
        assetClass: asset,
        lookbackPeriod: lookback,
      });
      setResult({ ...data.metrics, asset, lookback, emailed: data.emailed });
      toast.success(data.emailed ? "Tear sheet emailed" : "Run complete — email not configured");
    } catch (err) {
      toast.error((err as Error).message || "Could not email tear sheet");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section id="backtest" className={`${compact ? "py-4" : "py-20"} border-t border-border bg-secondary-surface/40 scroll-mt-24`}>
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Strategy sandbox</div>
          <h2 className="font-display text-section-title text-3xl md:text-4xl">Cloud backtest engine</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Run a sample rules-based report, save it to your portal, and email a tear sheet. Figures are sandbox
            output — not a live fill of custom production parameters.
          </p>
        </div>

        <div className="bg-secondary-surface border border-border rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form className="space-y-4" onSubmit={run}>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">1. Strategy inputs</h3>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Asset class</label>
                <select value={asset} onChange={(e) => setAsset(e.target.value)} className={inputClass}>
                  <option>EUR/USD (Forex 1-Min)</option>
                  <option>XAU/USD (Gold 5-Min)</option>
                  <option>S&P 500 E-mini (Futures)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Lookback period</label>
                <select value={lookback} onChange={(e) => setLookback(e.target.value)} className={inputClass}>
                  <option>3 Years (Tick Level)</option>
                  <option>5 Years (Minute Bars)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={running}
                className="w-full min-h-12 py-2.5 bg-gold text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-soft transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {running ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running sandbox…
                  </>
                ) : (
                  "Run sample backtest"
                )}
              </button>
            </form>

            <div className="lg:col-span-2 bg-dominant border border-border rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Report status:{" "}
                    <span className={result ? "text-bull" : "text-gold"}>
                      {result ? "Sandbox complete" : "Awaiting run"}
                    </span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Illustrative output</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "CAGR", value: result?.cagr ?? "—" },
                    { label: "Sharpe", value: result?.sharpe ?? "—" },
                    { label: "Max DD", value: result?.maxDrawdown ?? "—" },
                    { label: "Win rate", value: result?.winRate ?? "—" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 bg-secondary-surface rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                      <div className="text-lg font-bold text-foreground font-mono mt-1">{stat.value}</div>
                    </div>
                  ))}
                </div>
                {result && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Sample for {result.asset} · {result.lookback}. Not a live simulation of your exact rules.
                    {result.emailed ? " Tear sheet emailed." : ""}
                  </p>
                )}
              </div>

              <form
                onSubmit={requestSheet}
                className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email for sample tear sheet"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="submit"
                  disabled={running}
                  className="sm:w-auto px-4 min-h-12 py-2 bg-secondary-surface hover:bg-card text-gold border border-gold/30 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  Email sample PDF
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

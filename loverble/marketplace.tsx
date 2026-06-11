import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionCard } from "@/components/page-shell";
import { strategies, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Strategy Marketplace — Smart Algos Capital" }, { name: "description", content: "Browse verified quant strategies across Forex, Stocks, Futures, Options, AI, Market Neutral and more." }] }),
  component: Marketplace,
});

const cats = ["All", "Forex", "Stocks", "Futures", "Options", "AI", "Market Neutral", "Trend Following", "Mean Reversion"];

function Marketplace() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? strategies : strategies.filter((s) => s.asset === cat || s.category === cat);

  return (
    <PageShell eyebrow="Strategy Store" title="Strategy Marketplace" description="Vetted, capacity-aware trading strategies. Pay per subscription, capital stays in your account.">
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition ${cat === c ? "bg-gold text-primary-foreground border-gold" : "border-border bg-card/30 text-muted-foreground hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const risk = s.sharpe > 2 ? "Low" : s.sharpe > 1.7 ? "Medium" : "High";
          return (
            <div key={s.name} className="surface-card rounded-lg p-5 hover:border-gold/40 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.category} · {s.asset}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded ${risk === "Low" ? "bg-bull/15 text-bull" : risk === "Medium" ? "bg-gold/15 text-gold" : "bg-bear/15 text-bear"}`}>{risk} Risk</span>
              </div>
              <h3 className="font-display text-lg font-semibold">{s.name}</h3>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div><div className="text-muted-foreground">CAGR</div><div className="font-mono text-bull text-base mt-0.5">+{fmt.pct(s.cagr, 1)}</div></div>
                <div><div className="text-muted-foreground">Sharpe</div><div className="font-mono text-base mt-0.5">{s.sharpe.toFixed(2)}</div></div>
                <div><div className="text-muted-foreground">Max DD</div><div className="font-mono text-bear text-base mt-0.5">{fmt.pct(s.dd, 1)}</div></div>
                <div><div className="text-muted-foreground">Capacity</div><div className="font-mono text-base mt-0.5">{s.capacity}</div></div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Subscription</div>
                  <div className="font-mono text-gold font-semibold">{s.cost}</div>
                </div>
                <button className="rounded-sm bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition">
                  Subscribe
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

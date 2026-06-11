import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { strategies, fmt } from "@/lib/mock-data";
import { Crown, Award } from "lucide-react";

export const Route = createFileRoute("/copy-trading")({
  head: () => ({ meta: [{ title: "CopyTrade Network — Smart Algos Capital" }, { name: "description", content: "Smart Algos CopyTrade — browse, copy and publish trading strategies across Bronze, Silver, Gold and Platinum tiers." }] }),
  component: CopyTrading,
});

const tiers = [
  { name: "Bronze", who: "Retail Investors", min: "$1,000", color: "from-amber-700 to-amber-900", strategies: 142 },
  { name: "Silver", who: "Professional Investors", min: "$25,000", color: "from-slate-300 to-slate-500", strategies: 84 },
  { name: "Gold", who: "Family Offices", min: "$250,000", color: "from-gold to-amber-600", strategies: 41 },
  { name: "Platinum", who: "Institutional Capital", min: "$1,000,000", color: "from-zinc-200 to-zinc-400", strategies: 18 },
];

function CopyTrading() {
  return (
    <PageShell eyebrow="Copy Trading Network" title="Smart Algos CopyTrade™" description="Mirror verified strategies from top quants or publish your own. Revenue-sharing built in.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Copiers" value="18,420" delta="+312 this week" accent="up" />
        <StatCard label="Published Strategies" value="285" />
        <StatCard label="Capital Mirrored" value="$84.2M" accent="up" />
        <StatCard label="Avg Strategy Sharpe" value="1.94" />
      </div>

      <SectionCard title="Investor Tiers" subtitle="Access matched to capital and sophistication">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((t) => (
            <div key={t.name} className="surface-card rounded-lg overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${t.color}`} />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  {t.name === "Gold" || t.name === "Platinum" ? <Crown className="h-4 w-4 text-gold" /> : <Award className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-display text-xl font-semibold">{t.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">{t.who}</div>
                <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Minimum</span><span className="font-mono">{t.min}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Strategies</span><span className="font-mono">{t.strategies}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Most Copied Strategies" subtitle="Live · Sorted by active copiers">
        <div className="grid md:grid-cols-2 gap-4">
          {strategies.slice(0, 6).map((s) => (
            <div key={s.name} className="rounded-sm border border-border bg-card/30 p-4 hover:border-gold/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.category} · {s.asset}</div>
                  <div className="font-display text-base font-semibold mt-0.5">{s.name}</div>
                </div>
                <button className="text-xs rounded-sm bg-gold/15 text-gold border border-gold/30 px-3 py-1.5 hover:bg-gold/25 transition">Copy</button>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                <div><div className="text-muted-foreground">CAGR</div><div className="font-mono text-bull">+{fmt.pct(s.cagr, 1)}</div></div>
                <div><div className="text-muted-foreground">Sharpe</div><div className="font-mono">{s.sharpe.toFixed(2)}</div></div>
                <div><div className="text-muted-foreground">DD</div><div className="font-mono text-bear">{fmt.pct(s.dd, 1)}</div></div>
                <div><div className="text-muted-foreground">Copiers</div><div className="font-mono text-gold">{s.subs}</div></div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="For Traders" subtitle="Publish a strategy and earn revenue share">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-sm border border-border bg-card/30 p-5">
            <div className="font-display text-2xl text-gold font-semibold">30%</div>
            <div className="text-sm mt-1">Revenue share</div>
            <div className="text-xs text-muted-foreground mt-1">Of subscription + performance fees</div>
          </div>
          <div className="rounded-sm border border-border bg-card/30 p-5">
            <div className="font-display text-2xl text-gold font-semibold">$50K</div>
            <div className="text-sm mt-1">Avg monthly payout</div>
            <div className="text-xs text-muted-foreground mt-1">Top 10 strategy authors</div>
          </div>
          <div className="rounded-sm border border-border bg-card/30 p-5">
            <div className="font-display text-2xl text-gold font-semibold">90d</div>
            <div className="text-sm mt-1">Validation period</div>
            <div className="text-xs text-muted-foreground mt-1">Before public listing</div>
          </div>
        </div>
      </SectionCard>
    </PageShell>
  );
}

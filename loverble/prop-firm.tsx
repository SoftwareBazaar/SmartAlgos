import { createFileRoute } from "@tanstack/react-router";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/prop-firm")({
  head: () => ({ meta: [{ title: "Prop Firm Hub — Smart Algos Capital" }, { name: "description", content: "Track FTMO, FundedNext, The5ers evaluations, scaling and challenge analytics." }] }),
  component: PropFirm,
});

const firms = [
  { name: "FTMO", phase: "Funded", balance: 200000, profit: 18420, days: 84 },
  { name: "FundedNext", phase: "Phase 2", balance: 100000, profit: 6240, days: 21 },
  { name: "The5ers", phase: "Funded", balance: 50000, profit: 4180, days: 142 },
  { name: "FTMO (Acct 2)", phase: "Evaluation", balance: 25000, profit: 1840, days: 8 },
];

function PropFirm() {
  return (
    <PageShell eyebrow="Prop Firm Hub" title="Challenge & Funded Accounts" description="Manage evaluations and live funded accounts across the major prop firms.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Accounts" value="4" hint="3 funded · 1 eval" />
        <StatCard label="Combined Capital" value="$375K" accent="up" />
        <StatCard label="Profits (Total)" value="$30,680" accent="up" />
        <StatCard label="Pass Rate" value="84%" hint="Lifetime" accent="up" />
      </div>

      <SectionCard title="Account Tracker" subtitle="Live status across all prop firms">
        <div className="grid md:grid-cols-2 gap-4">
          {firms.map((f) => (
            <div key={f.name} className="rounded-sm border border-border bg-card/30 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-semibold">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Day {f.days}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${f.phase === "Funded" ? "bg-bull/15 text-bull" : "bg-gold/15 text-gold"}`}>{f.phase}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Balance</div><div className="font-mono mt-0.5">${f.balance.toLocaleString()}</div></div>
                <div><div className="text-xs text-muted-foreground">Profit</div><div className="font-mono text-bull mt-0.5">+${f.profit.toLocaleString()}</div></div>
              </div>
              <div className="mt-4 h-1.5 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-gold" style={{ width: `${Math.min((f.profit / (f.balance * 0.1)) * 100, 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">Target: 10% · Current: {((f.profit / f.balance) * 100).toFixed(2)}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Scaling Plan" subtitle="Path to $1M+ funded capital">
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2">
          {[
            { stage: "$25K", status: "done" },
            { stage: "$100K", status: "done" },
            { stage: "$200K", status: "active" },
            { stage: "$400K", status: "next" },
            { stage: "$1M", status: "future" },
            { stage: "$2M", status: "future" },
          ].map((s, i, arr) => (
            <div key={s.stage} className="flex items-center gap-3 shrink-0">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-mono ${
                s.status === "done" ? "bg-bull text-background" :
                s.status === "active" ? "bg-gold text-primary-foreground ring-4 ring-gold/20" :
                s.status === "next" ? "bg-card border border-gold/40 text-gold" :
                "bg-card border border-border text-muted-foreground"
              }`}><Trophy className="h-4 w-4" /></div>
              <div className="text-sm"><div className="font-mono">{s.stage}</div></div>
              {i < arr.length - 1 && <div className="h-px w-10 bg-border" />}
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}

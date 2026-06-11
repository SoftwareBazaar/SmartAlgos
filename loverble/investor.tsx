import { createFileRoute } from "@tanstack/react-router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageShell, StatCard, SectionCard } from "@/components/page-shell";
import { equityCurve, fmt } from "@/lib/mock-data";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/investor")({
  head: () => ({ meta: [{ title: "Investor Portal — Smart Algos Capital" }, { name: "description", content: "LP dashboard with portfolio value, capital flows, monthly reports and verified returns." }] }),
  component: Investor,
});

const transactions = [
  { date: "2026-01-15", type: "Deposit", amount: 500000 },
  { date: "2026-01-01", type: "Performance Credit", amount: 142800 },
  { date: "2025-12-15", type: "Withdrawal", amount: -120000 },
  { date: "2025-12-01", type: "Management Fee", amount: -8200 },
  { date: "2025-11-01", type: "Performance Credit", amount: 198400 },
];

const documents = [
  { name: "Smart Algos Master Fund — Factsheet Q4 2025", type: "Factsheet", date: "2026-01-08" },
  { name: "Monthly Report — December 2025", type: "Report", date: "2026-01-05" },
  { name: "Strategy Paper — Alpha Decay Framework", type: "Research", date: "2025-12-22" },
  { name: "Audited Returns — FY 2025", type: "Audit", date: "2025-12-15" },
  { name: "Whitepaper — Africa Quant Thesis", type: "Whitepaper", date: "2025-11-30" },
];

function Investor() {
  const data = equityCurve.slice(-365);
  return (
    <PageShell eyebrow="Investor Portal" title="LP Dashboard" description="Your capital, your returns, your reports. Full transparency, audited monthly.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value="$2,184,300" delta="+$58.4K MTD" accent="up" />
        <StatCard label="Capital Allocated" value="$1,700,000" hint="Initial: $1.5M" />
        <StatCard label="Net Return (Lifetime)" value="+44.6%" accent="up" />
        <StatCard label="Tier" value="Gold" hint="Family Office" />
      </div>

      <SectionCard title="Your Equity Curve" subtitle="Lifetime · Net of fees">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="inv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.4)" vertical={false} />
            <XAxis dataKey="date" stroke="oklch(0.70 0.02 90)" fontSize={11} tickFormatter={(d) => d.slice(0, 7)} minTickGap={60} />
            <YAxis stroke="oklch(0.70 0.02 90)" fontSize={11} />
            <Tooltip contentStyle={{ background: "oklch(0.20 0.04 251)", border: "1px solid oklch(0.30 0.04 252)", borderRadius: 6 }} />
            <Area type="monotone" dataKey="equity" stroke="oklch(0.78 0.13 85)" strokeWidth={2} fill="url(#inv)" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Recent Transactions" subtitle="Deposits, withdrawals, fees" action={<button className="text-xs text-gold hover:underline">View all →</button>}>
          <div className="space-y-1">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/40 text-sm">
                <div>
                  <div>{t.type}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{t.date}</div>
                </div>
                <span className={`font-mono ${t.amount >= 0 ? "text-bull" : "text-bear"}`}>{t.amount >= 0 ? "+" : ""}{fmt.usd(Math.abs(t.amount))}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Documents & Reports" subtitle="Transparency Center">
          <div className="space-y-1">
            {documents.map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-sm border border-border/60 px-3 py-2.5 hover:bg-card/30 transition cursor-pointer">
                <FileText className="h-4 w-4 text-gold shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{d.type} · {d.date}</div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

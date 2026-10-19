import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const CLEARANCE_VS_BASELINE = [
  { month: 1, clearance: 14733, baseline: 14837 },
  { month: 6, clearance: 10400, baseline: 13958 },
  { month: 12, clearance: 5200, baseline: 12693 },
  { month: 18, clearance: 0, baseline: 11091 },
];

const STRATEGY_COST = [
  { name: "A Clearance", total: 15600, note: "$0 interest" },
  { name: "B Parity", total: 17500, note: "~35 mo" },
  { name: "C Slacker", total: 45352, note: "323 mo trap" },
  { name: "No transfer", total: 25250, note: "baseline est." },
];

const tooltipStyle = {
  background: "oklch(0.20 0.04 251)",
  border: "1px solid oklch(0.30 0.04 252)",
  borderRadius: 6,
  fontSize: 11,
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-4 md:p-5 space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-gold">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="h-[240px] w-full">{children}</div>
    </div>
  );
}

export function Day02Charts() {
  return (
    <div className="space-y-4">
      <ChartCard
        title="Clearance sinking fund vs stay-put baseline"
        subtitle="$15,600 transferred @ 0% / 18 months vs original 26.99% APR path"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CLEARANCE_VS_BASELINE}>
            <defs>
              <linearGradient id="clearBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
              </linearGradient>
              <linearGradient id="baseBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.06 240 / 0.28)" />
                <stop offset="100%" stopColor="oklch(0.65 0.06 240 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, key: string) => [
                `$${Number(v).toLocaleString()}`,
                key === "clearance" ? "Strategy A clearance" : "Baseline (no BT)",
              ]}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(v) => (v === "clearance" ? "Clearance $866.67/mo" : "Baseline")}
            />
            <Area
              type="monotone"
              dataKey="clearance"
              stroke="oklch(0.78 0.13 85)"
              strokeWidth={2}
              fill="url(#clearBal)"
            />
            <Area
              type="monotone"
              dataKey="baseline"
              stroke="oklch(0.68 0.08 240)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#baseBal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Total dollars paid by strategy"
        subtitle="Fee-inclusive cost of Strategy A / B / C vs staying on the original card"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STRATEGY_COST} margin={{ left: 0, right: 8 }}>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }} />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Total paid"]}
            />
            <Bar dataKey="total" fill="oklch(0.78 0.13 85)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

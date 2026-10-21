import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const MONTHLY_PAYMENT = [
  { name: "Standard 10yr", payment: 863.1 },
  { name: "MFJ 10% IDR", payment: 949.71 },
  { name: "MFS 10% IDR", payment: 425.96 },
  { name: "MFS 5% IDR", payment: 212.98 },
];

const ANNUAL_OUTCOMES = [
  { name: "MFJ 10%", paid: 11396.52, penalty: 0, subsidy: 0, netGain: -1039.32 },
  { name: "Standard", paid: 10357.2, penalty: 0, subsidy: 0, netGain: 0 },
  { name: "MFS 10%", paid: 5111.52, penalty: 1850, subsidy: 0, netGain: 4435 },
  { name: "MFS 5%", paid: 2555.76, penalty: 1850, subsidy: 2544.24, netGain: 6979.24 },
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

export function Day04Charts() {
  return (
    <div className="space-y-4">
      <ChartCard
        title="Monthly payment by filing / IDR formula"
        subtitle="$75K @ 6.80% — Standard vs MFJ 10% vs MFS 10% vs MFS 5%"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MONTHLY_PAYMENT} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`$${Number(v).toFixed(2)}`, "Monthly payment"]}
            />
            <Bar dataKey="payment" fill="oklch(0.78 0.13 85)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Annual net cash-flow gain vs baseline"
        subtitle="MFS tax penalty netted; MFS 5% includes government interest subsidy"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ANNUAL_OUTCOMES} margin={{ left: 8, right: 8 }}>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, key: string) => [
                `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                key === "netGain"
                  ? "Net annual gain"
                  : key === "subsidy"
                    ? "Gov interest subsidy"
                    : key === "penalty"
                      ? "Tax penalty"
                      : "Loan paid",
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="paid" name="Loan paid" fill="oklch(0.55 0.04 250)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="subsidy" name="Subsidy" fill="oklch(0.65 0.12 145)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="netGain" name="Net gain" fill="oklch(0.78 0.13 85)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

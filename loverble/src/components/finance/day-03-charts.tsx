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

const BALANCE_TRAJECTORY = [
  {
    month: 12,
    direct: 264428,
    helocOptimal: 264854,
    baseline: 294224,
    spreadFail: 288849,
  },
  {
    month: 60,
    direct: 114978,
    helocOptimal: 116057,
    baseline: 268332,
    spreadFail: 240637,
  },
];

const INTEREST_YTD = [
  { name: "Direct sweep", interest: 35821 },
  { name: "HELOC optimal", interest: 37573 },
  { name: "Baseline", interest: 48159 },
  { name: "Spread failure", interest: 49021 },
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

export function Day03Charts() {
  return (
    <div className="space-y-4">
      <ChartCard
        title="5-year mortgage balance trajectory"
        subtitle="$300K @ 3.50% — ending balances at month 12 and month 60"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BALANCE_TRAJECTORY}>
            <defs>
              <linearGradient id="directBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
              </linearGradient>
              <linearGradient id="helocBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.06 240 / 0.28)" />
                <stop offset="100%" stopColor="oklch(0.65 0.06 240 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
              tickFormatter={(m) => `M${m}`}
            />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, key: string) => {
                const labels: Record<string, string> = {
                  direct: "Direct sweep",
                  helocOptimal: "HELOC optimal",
                  baseline: "Baseline",
                  spreadFail: "Spread failure",
                };
                return [`$${Number(v).toLocaleString()}`, labels[key] ?? key];
              }}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="direct"
              name="Direct sweep"
              stroke="oklch(0.78 0.13 85)"
              fill="url(#directBal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="helocOptimal"
              name="HELOC optimal"
              stroke="oklch(0.65 0.06 240)"
              fill="url(#helocBal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="oklch(0.55 0.04 250)"
              fill="transparent"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <Area
              type="monotone"
              dataKey="spreadFail"
              name="Spread failure"
              stroke="oklch(0.62 0.14 25)"
              fill="transparent"
              strokeWidth={1.5}
              strokeDasharray="2 3"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cumulative interest at month 60"
        subtitle="Direct sweep eliminates HELOC drag; spread failure underperforms baseline"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={INTEREST_YTD} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Interest YTD"]}
            />
            <Bar dataKey="interest" fill="oklch(0.78 0.13 85)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

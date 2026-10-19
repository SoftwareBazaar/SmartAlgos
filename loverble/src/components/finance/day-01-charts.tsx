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

const BALANCE_SERIES = [
  { month: 1, dynamic: 9900, static: 9908 },
  { month: 6, dynamic: 9415, static: 9438 },
  { month: 12, dynamic: 8864, static: 8764 },
  { month: 24, dynamic: 7857, static: 7181 },
  { month: 36, dynamic: 6964, static: 5147 },
  { month: 48, dynamic: 6173, static: 2557 },
  { month: 58, dynamic: 5578, static: 0 },
  { month: 72, dynamic: 4850, static: 0 },
  { month: 120, dynamic: 2994, static: 0 },
  { month: 180, dynamic: 1638, static: 0 },
  { month: 240, dynamic: 795, static: 0 },
  { month: 272, dynamic: 0, static: 0 },
];

const INTEREST_SERIES = [
  { name: "Dynamic decay", interest: 19237 },
  { name: "Static model", interest: 7245 },
  { name: "Understated gap", interest: 11992 },
];

const STRATEGY_SERIES = [
  { name: "Dynamic min", months: 272, interest: 19237 },
  { name: "Pinned $308", months: 56, interest: 7025 },
  { name: "Accel. $500", months: 25, interest: 2382 },
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

export function Day01Charts() {
  return (
    <div className="space-y-4">
      <ChartCard
        title="Balance trajectories"
        subtitle="$10,000 @ 24.99% APR — dynamic minimum vs commercial static $300/mo"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={BALANCE_SERIES}>
            <defs>
              <linearGradient id="dynBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.35)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
              </linearGradient>
              <linearGradient id="staticBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.06 240 / 0.28)" />
                <stop offset="100%" stopColor="oklch(0.65 0.06 240 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.30 0.04 252)" }}
              label={{ value: "Month", position: "insideBottom", offset: -2, fill: "oklch(0.60 0.02 90)", fontSize: 10 }}
            />
            <YAxis
              tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, key: string) => [
                `$${v.toLocaleString()}`,
                key === "dynamic" ? "Dynamic decay" : "Commercial static",
              ]}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "oklch(0.70 0.02 90)" }}
              formatter={(value) => (value === "dynamic" ? "Dynamic decay" : "Commercial static")}
            />
            <Area
              type="monotone"
              dataKey="dynamic"
              stroke="oklch(0.78 0.13 85)"
              strokeWidth={2}
              fill="url(#dynBal)"
            />
            <Area
              type="monotone"
              dataKey="static"
              stroke="oklch(0.68 0.08 240)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#staticBal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard
          title="Cumulative interest"
          subtitle="Real-world decay vs commercial understatement"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={INTEREST_SERIES} layout="vertical" margin={{ left: 8, right: 12 }}>
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
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Interest"]}
              />
              <Bar dataKey="interest" fill="oklch(0.78 0.13 85)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Strategy matrix"
          subtitle="Payoff horizon (months) by repayment rule"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STRATEGY_SERIES} margin={{ left: 0, right: 8 }}>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }} />
              <YAxis
                tick={{ fill: "oklch(0.70 0.02 90)", fontSize: 10 }}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number, key: string) => [
                  key === "months" ? `${v} months` : `$${v.toLocaleString()}`,
                  key === "months" ? "Horizon" : "Total interest",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="months" name="Months" fill="oklch(0.78 0.13 85)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interest" name="Interest $" fill="oklch(0.55 0.06 240)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

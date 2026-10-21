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
  LabelList,
  Cell,
} from "recharts";

/** Even monthly sampling so the X-axis is linear (no warped kinks). */
const BALANCE_SERIES = Array.from({ length: 28 }, (_, i) => {
  const month = i * 10; // 0, 10, …, 270
  // Piecewise linear interpolation from known scenario points
  const dynamicPts: [number, number][] = [
    [0, 10000],
    [1, 9900],
    [6, 9415],
    [12, 8864],
    [24, 7857],
    [36, 6964],
    [48, 6173],
    [58, 5578],
    [72, 4850],
    [120, 2994],
    [180, 1638],
    [240, 795],
    [272, 0],
  ];
  const staticPts: [number, number][] = [
    [0, 10000],
    [1, 9908],
    [6, 9438],
    [12, 8764],
    [24, 7181],
    [36, 5147],
    [48, 2557],
    [58, 0],
    [272, 0],
  ];
  const lerp = (pts: [number, number][], m: number) => {
    if (m <= pts[0][0]) return pts[0][1];
    for (let j = 1; j < pts.length; j++) {
      const [m0, v0] = pts[j - 1];
      const [m1, v1] = pts[j];
      if (m <= m1) {
        const t = (m - m0) / (m1 - m0 || 1);
        return v0 + t * (v1 - v0);
      }
    }
    return pts[pts.length - 1][1];
  };
  return {
    month,
    dynamic: Math.round(lerp(dynamicPts, month)),
    static: Math.round(lerp(staticPts, month)),
  };
});

const INTEREST_SERIES = [
  { name: "Dynamic decay", interest: 19236, fill: "oklch(0.78 0.13 85)" },
  { name: "Commercial static", interest: 7245, fill: "oklch(0.65 0.08 240)" },
];

const STRATEGY_MONTHS = [
  { name: "Dynamic min", months: 272, fill: "oklch(0.78 0.13 85)" },
  { name: "Fixed $308/mo", months: 56, fill: "oklch(0.70 0.10 145)" },
  { name: "Fixed $500/mo", months: 25, fill: "oklch(0.65 0.08 240)" },
];

const STRATEGY_INTEREST = [
  { name: "Dynamic min", interest: 19236, fill: "oklch(0.78 0.13 85)" },
  { name: "Fixed $308/mo", interest: 7025, fill: "oklch(0.70 0.10 145)" },
  { name: "Fixed $500/mo", interest: 2382, fill: "oklch(0.65 0.08 240)" },
];

const tooltipStyle = {
  background: "oklch(0.20 0.04 251)",
  border: "1px solid oklch(0.30 0.04 252)",
  borderRadius: 6,
  fontSize: 11,
};

function formatUsdAxis(v: number) {
  if (v === 0) return "$0";
  if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `$${v}`;
}

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
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="h-[260px] w-full">{children}</div>
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
          <AreaChart data={BALANCE_SERIES} margin={{ top: 28, right: 12, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="dynBal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.22)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
            <XAxis
              dataKey="month"
              type="number"
              domain={[0, 280]}
              ticks={[0, 60, 120, 180, 240, 280]}
              tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "oklch(0.30 0.04 252)" }}
            />
            <YAxis
              domain={[0, 10000]}
              ticks={[0, 2500, 5000, 7500, 10000]}
              tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatUsdAxis}
              width={48}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, key: string) => [
                `$${Number(v).toLocaleString()}`,
                key === "dynamic" ? "Dynamic decay" : "Commercial static",
              ]}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend
              verticalAlign="top"
              height={24}
              wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
              formatter={(value) =>
                value === "dynamic" ? "Dynamic decay" : "Commercial static"
              }
            />
            <Area
              type="monotone"
              dataKey="dynamic"
              name="dynamic"
              stroke="oklch(0.78 0.13 85)"
              strokeWidth={2}
              fill="url(#dynBal)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="static"
              name="static"
              stroke="oklch(0.68 0.08 240)"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="transparent"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Cumulative interest"
        subtitle="Dynamic decay vs commercial static — gap annotated, not a third scenario"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={INTEREST_SERIES} layout="vertical" margin={{ left: 8, right: 48, top: 8 }}>
            <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 20000]}
              ticks={[0, 5000, 10000, 15000, 20000]}
              tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
              tickFormatter={formatUsdAxis}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Interest"]}
            />
            <Bar dataKey="interest" radius={[0, 4, 4, 0]}>
              {INTEREST_SERIES.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="interest"
                position="right"
                formatter={(v: number) => `$${Number(v).toLocaleString()}`}
                style={{ fill: "oklch(0.85 0.02 90)", fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-muted-foreground pt-1">
          Understated gap vs commercial static:{" "}
          <strong className="text-foreground">$11,991</strong> more interest under dynamic decay.
        </p>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Payoff horizon" subtitle="Months to clear the balance by repayment rule">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STRATEGY_MONTHS} margin={{ top: 20, right: 12, left: 0 }}>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }} />
              <YAxis
                tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
                tickFormatter={(v) => `${v}`}
                label={{
                  value: "Months",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "oklch(0.70 0.02 90)", fontSize: 10 },
                }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v} months`, "Horizon"]}
              />
              <Bar dataKey="months" radius={[4, 4, 0, 0]}>
                {STRATEGY_MONTHS.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="months"
                  position="top"
                  formatter={(v: number) => `${v} mo`}
                  style={{ fill: "oklch(0.85 0.02 90)", fontSize: 10 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total interest by rule" subtitle="Same three strategies — dollars only">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STRATEGY_INTEREST} margin={{ top: 20, right: 12, left: 0 }}>
              <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }} />
              <YAxis
                tick={{ fill: "oklch(0.78 0.02 90)", fontSize: 10 }}
                tickFormatter={formatUsdAxis}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Interest"]}
              />
              <Bar dataKey="interest" radius={[4, 4, 0, 0]}>
                {STRATEGY_INTEREST.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="interest"
                  position="top"
                  formatter={(v: number) => `$${(Number(v) / 1000).toFixed(1)}k`}
                  style={{ fill: "oklch(0.85 0.02 90)", fontSize: 10 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

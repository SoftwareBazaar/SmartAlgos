import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { equityChartDomain } from "@/lib/chart-domain";
import { fmt } from "@/lib/mock-data";

type Point = { date: string; equity: number };

export function EquityAreaChart({
  data,
  gradientId,
  height = "100%",
  showGrid = false,
  animate = true,
}: {
  data: Point[];
  gradientId: string;
  height?: number | string;
  showGrid?: boolean;
  animate?: boolean;
}) {
  const baseline = data[0]?.equity ?? 100;
  const domain = equityChartDomain(data);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.13 85 / 0.35)" />
            <stop offset="100%" stopColor="oklch(0.78 0.13 85 / 0)" />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid stroke="oklch(0.30 0.04 252 / 0.25)" vertical={false} />}
        <YAxis hide domain={domain} />
        <ReferenceLine
          y={baseline}
          stroke="oklch(0.70 0.02 90 / 0.35)"
          strokeDasharray="4 4"
          label={{
            value: "Inception",
            position: "insideTopLeft",
            fill: "oklch(0.70 0.02 90)",
            fontSize: 10,
          }}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.20 0.04 251)",
            border: "1px solid oklch(0.30 0.04 252)",
            borderRadius: 6,
            fontSize: 11,
          }}
          formatter={(v: number) => [fmt.num(v), "Equity"]}
          labelFormatter={(l) => String(l).slice(0, 10)}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke="oklch(0.78 0.13 85)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          isAnimationActive={animate}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

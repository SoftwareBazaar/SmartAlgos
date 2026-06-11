/** Tight Y-axis so equity growth reads clearly (not flattened against container top). */
export function equityChartDomain(
  data: { equity: number }[],
  paddingRatio = 0.12,
): [number, number] {
  const values = data.map((d) => d.equity);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = span * paddingRatio;
  return [min - pad, max + pad];
}

export function buildStrategyEquityCurve(totalReturn: number, days = 180, startEquity = 100) {
  const points: { date: string; equity: number }[] = [];
  const start = new Date();
  start.setDate(start.getDate() - days);
  const target = startEquity * (1 + totalReturn);

  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const t = i / days;
    const trend = startEquity + (target - startEquity) * (t * 0.65 + t * t * 0.35);
    const noise = Math.sin(i * 0.22) * startEquity * 0.012 + Math.sin(i * 0.07) * startEquity * 0.008;
    points.push({
      date: d.toISOString().slice(0, 10),
      equity: +(trend + noise).toFixed(2),
    });
  }
  points[points.length - 1].equity = +target.toFixed(2);
  return points;
}

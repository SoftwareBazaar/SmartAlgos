import { Link } from "@tanstack/react-router";

export function IllustrativeChartNote() {
  return (
    <p className="text-xs text-muted-foreground border border-border/60 bg-card/30 rounded-sm px-3 py-2">
      <span className="text-gold font-medium">Illustrative chart</span> — composite placeholder until live QuantConnect data is linked on the{" "}
      <Link to="/performance" className="text-gold hover:underline">Performance</Link> page.
    </p>
  );
}

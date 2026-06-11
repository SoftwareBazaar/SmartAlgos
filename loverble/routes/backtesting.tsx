import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/backtesting")({
  component: () => (
    <PlannedPage
      title="Backtesting Engine"
      description="Institutional-grade backtesting for our research pipeline — in development."
      phase="Development"
    />
  ),
});

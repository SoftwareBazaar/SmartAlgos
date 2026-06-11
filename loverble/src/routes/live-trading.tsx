import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/live-trading")({
  component: () => (
    <PlannedPage
      title="Live Trading Portal"
      description="A verified live trading portal connected to strategy performance — on the roadmap."
      phase="Development"
    />
  ),
});

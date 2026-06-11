import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/copy-trading")({
  component: () => (
    <PlannedPage
      title="Copy Trading Network"
      description="Signal distribution via Collective2 and partner platforms — planned."
      phase="Planning"
    />
  ),
});

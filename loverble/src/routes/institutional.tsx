import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/institutional")({
  component: () => (
    <PlannedPage
      title="Financial Intelligence Division"
      description="AML monitoring, fraud detection, audit analytics, and regulatory technology — long-term research."
      phase="Research"
    />
  ),
});

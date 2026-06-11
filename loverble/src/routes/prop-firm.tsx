import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/prop-firm")({
  component: () => (
    <PlannedPage
      title="Prop Firm Program"
      description="Capital allocation through partner prop firms — future initiative."
      phase="Planning"
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/ai-center")({
  component: () => (
    <PlannedPage title="AI Command Center" description="AI-assisted research and strategy tools — research phase." phase="Research" />
  ),
});

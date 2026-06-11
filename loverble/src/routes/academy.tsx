import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/academy")({
  component: () => (
    <PlannedPage title="Quant Academy" description="Educational content for quantitative finance — research phase." phase="Research" />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { PlannedPage } from "@/components/planned-page";

export const Route = createFileRoute("/investor")({
  component: () => (
    <PlannedPage
      title="Investor Portal"
      description="Transparent reporting for future capital partners — planned after track record is established."
      phase="Planning"
    />
  ),
});

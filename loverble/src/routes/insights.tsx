import { createFileRoute, redirect } from "@tanstack/react-router";

/** Insights hub retired — Decision Math and Research cover that ground. */
export const Route = createFileRoute("/insights")({
  beforeLoad: () => {
    throw redirect({ to: "/finance" });
  },
});

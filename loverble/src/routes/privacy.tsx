import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy /privacy URL used by Google & OAuth — permanent redirect to the real policy. */
export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy-policy", replace: true });
  },
});

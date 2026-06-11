import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/alpha-factory")({
  beforeLoad: () => {
    throw redirect({ to: "/strategies" });
  },
});

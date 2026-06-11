import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/live-trading")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/copy-trading")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

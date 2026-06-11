import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-center")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

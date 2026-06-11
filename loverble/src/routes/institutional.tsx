import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/institutional")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/prop-firm")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

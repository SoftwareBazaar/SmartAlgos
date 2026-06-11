import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/backtesting")({
  beforeLoad: () => {
    throw redirect({ to: "/about", hash: "roadmap" });
  },
});

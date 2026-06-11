import { createFileRoute } from "@tanstack/react-router";
import { getCapitalConfig } from "@/lib/capital-payments-server";

export const Route = createFileRoute("/api/payments/capital/config")({
  server: {
    handlers: {
      GET: async () => Response.json(getCapitalConfig()),
    },
  },
});

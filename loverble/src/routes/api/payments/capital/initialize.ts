import { createFileRoute } from "@tanstack/react-router";
import { initializeCapitalPayment } from "@/lib/capital-payments-server";

export const Route = createFileRoute("/api/payments/capital/initialize")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const result = await initializeCapitalPayment(body);
          return Response.json(result.body, { status: result.status });
        } catch (err) {
          console.error("[Capital] Initialize error:", err);
          return Response.json(
            { success: false, error: (err as Error).message || "Payment initialization failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

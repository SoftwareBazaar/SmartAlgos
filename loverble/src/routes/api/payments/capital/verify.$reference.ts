import { createFileRoute } from "@tanstack/react-router";
import { verifyCapitalPayment } from "@/lib/capital-payments-server";

export const Route = createFileRoute("/api/payments/capital/verify/$reference")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const result = await verifyCapitalPayment(params.reference);
          return Response.json(result.body, { status: result.status });
        } catch (err) {
          console.error("[Capital] Verify error:", err);
          return Response.json(
            { success: false, error: (err as Error).message || "Verification failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});

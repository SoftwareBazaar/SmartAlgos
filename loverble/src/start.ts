import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import {
  getCapitalConfig,
  initializeCapitalPayment,
  verifyCapitalPayment,
} from "@/lib/capital-payments-server";

/** Capital Paystack API — handled in middleware (reliable on Vercel/Nitro). */
const capitalPaymentsMiddleware = createMiddleware().server(async ({ request, next }) => {
  const { pathname } = new URL(request.url);

  if (pathname === "/api/payments/capital/config" && request.method === "GET") {
    return Response.json(getCapitalConfig());
  }

  if (pathname === "/api/payments/capital/initialize" && request.method === "POST") {
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
  }

  const verifyMatch = pathname.match(/^\/api\/payments\/capital\/verify\/([^/]+)$/);
  if (verifyMatch && request.method === "GET") {
    try {
      const result = await verifyCapitalPayment(decodeURIComponent(verifyMatch[1]));
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Capital] Verify error:", err);
      return Response.json(
        { success: false, error: (err as Error).message || "Verification failed" },
        { status: 500 },
      );
    }
  }

  return next();
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [capitalPaymentsMiddleware, errorMiddleware],
}));

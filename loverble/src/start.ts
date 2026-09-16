import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import {
  clearAllBookings,
  createFreeBooking,
  createPendingPaidBooking,
  getAvailableSlots,
} from "@/lib/advisory-booking-server";
import {
  getCapitalConfig,
  initializeCapitalPayment,
  verifyCapitalPayment,
} from "@/lib/capital-payments-server";
import {
  getPortalOverview,
  handlePaystackWebhook,
  runBacktestJob,
  serveStrategyDownload,
} from "@/lib/portal-server";

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

/** Advisory consultation bookings */
const advisoryBookingsMiddleware = createMiddleware().server(async ({ request, next }) => {
  const { pathname, searchParams } = new URL(request.url);

  if (pathname === "/api/bookings/available-slots" && request.method === "GET") {
    try {
      const date = searchParams.get("date") || "";
      const consultationType = searchParams.get("consultation_type") || "free_20";
      const result = await getAvailableSlots(date, consultationType);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Bookings] Slots error:", err);
      return Response.json({ success: false, error: "Failed to load slots" }, { status: 500 });
    }
  }

  if (pathname === "/api/bookings" && request.method === "POST") {
    try {
      const body = await request.json();
      const result = await createFreeBooking(body);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Bookings] Free booking error:", err);
      return Response.json({ success: false, error: "Booking failed" }, { status: 500 });
    }
  }

  if (pathname === "/api/bookings/pending-paid" && request.method === "POST") {
    try {
      const body = await request.json();
      const result = await createPendingPaidBooking(body);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Bookings] Pending paid error:", err);
      return Response.json({ success: false, error: "Reservation failed" }, { status: 500 });
    }
  }

  if (pathname === "/api/bookings/admin/clear" && request.method === "POST") {
    try {
      const auth = request.headers.get("authorization") || "";
      const secret = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      const result = await clearAllBookings(secret);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Bookings] Admin clear error:", err);
      return Response.json({ success: false, error: "Clear failed" }, { status: 500 });
    }
  }

  return next();
});

/** Paystack webhooks, backtest sandbox, and client portal APIs */
const portalMiddleware = createMiddleware().server(async ({ request, next }) => {
  const { pathname, searchParams } = new URL(request.url);

  if (pathname === "/api/webhooks/paystack" && request.method === "POST") {
    try {
      const result = await handlePaystackWebhook(request);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Portal] Webhook error:", err);
      return Response.json({ error: "Webhook failed" }, { status: 500 });
    }
  }

  if (pathname === "/api/backtest/run" && request.method === "POST") {
    try {
      const body = await request.json();
      const result = await runBacktestJob(request, body);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Portal] Backtest error:", err);
      return Response.json({ success: false, error: "Backtest failed" }, { status: 500 });
    }
  }

  if (pathname === "/api/portal/overview" && request.method === "GET") {
    try {
      const result = await getPortalOverview(request);
      return Response.json(result.body, { status: result.status });
    } catch (err) {
      console.error("[Portal] Overview error:", err);
      return Response.json({ success: false, error: "Failed to load portal" }, { status: 500 });
    }
  }

  if (pathname === "/api/portal/downloads" && request.method === "GET") {
    try {
      const result = await serveStrategyDownload(searchParams.get("ref") || "");
      if ("content" in result && result.content) {
        return new Response(result.content, {
          status: 200,
          headers: {
            "content-type": result.contentType || "text/plain; charset=utf-8",
            "content-disposition": `attachment; filename="${result.filename}"`,
            "cache-control": "no-store",
          },
        });
      }
      if ("body" in result) {
        return Response.json(result.body, { status: result.status });
      }
      return Response.json({ success: false, error: "Download failed" }, { status: 500 });
    } catch (err) {
      console.error("[Portal] Download error:", err);
      return Response.json({ success: false, error: "Download failed" }, { status: 500 });
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
  requestMiddleware: [capitalPaymentsMiddleware, advisoryBookingsMiddleware, portalMiddleware, errorMiddleware],
}));

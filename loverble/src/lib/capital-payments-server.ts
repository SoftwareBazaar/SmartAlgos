/**
 * Capital payments — runs on TanStack Start server (same Nitro function as the site).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { PRICING } from "@/lib/pricing";

const KES_RATE = 150;

const TIER_AMOUNTS_USD: Record<string, number> = {
  "research-pro": PRICING.researchFull,
  "live-retail": PRICING.liveRetail,
  "live-institutional": PRICING.liveInstitutional,
  consultation: PRICING.consultation,
};

const PRODUCT_IDS: Record<string, string> = {
  "research-pro": "11111111-1111-1111-1111-111111111111",
  "live-retail": "55555555-5555-5555-5555-555555555555",
  "live-institutional": "66666666-6666-6666-6666-666666666666",
  consultation: "33333333-3333-3333-3333-333333333333",
  research_donation: "44444444-4444-4444-4444-444444444444",
};

const VALID_PRODUCT_TYPES = ["research_subscription", "research_donation", "consultation"] as const;
export type CapitalProductType = (typeof VALID_PRODUCT_TYPES)[number];

function genReference(prefix = "CAP") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCallbackBase() {
  return (
    process.env.CAPITAL_CLIENT_URL ||
    process.env.LOVERBLE_URL ||
    process.env.CLIENT_URL ||
    process.env.BACKEND_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function resolveAmountUsd({
  productType,
  productId,
  amountUsd,
}: {
  productType: string;
  productId: string;
  amountUsd?: number;
}): number | null {
  if (productType === "research_donation") {
    const n = Number(amountUsd);
    if (!n || n < 1) return null;
    return Math.round(n * 100) / 100;
  }
  if (productType === "consultation" && amountUsd) {
    const n = Number(amountUsd);
    if (n >= 1) return Math.round(n * 100) / 100;
  }
  if (productType === "research_subscription") {
    return TIER_AMOUNTS_USD[productId] ?? null;
  }
  if (productType === "consultation") {
    return TIER_AMOUNTS_USD.consultation;
  }
  return null;
}

async function paystackRequest(endpoint: string, method: string, body?: unknown) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || secretKey.includes("your_")) {
    return {
      status: true,
      message: "Authorization URL created (MOCK)",
      data: {
        authorization_url: "https://checkout.paystack.com/mock",
        access_code: `mock_${Date.now()}`,
        reference: genReference(),
      },
    };
  }

  const res = await fetch(`https://api.paystack.co${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Paystack error ${res.status}`);
  }
  return data;
}

export function getCapitalConfig() {
  return {
    success: true,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    currency: "KES",
    kesRate: KES_RATE,
  };
}

export async function initializeCapitalPayment(body: {
  email?: string;
  product_type?: string;
  product_id?: string;
  amount_usd?: number;
  metadata?: Record<string, unknown>;
}) {
  const email = (body.email || "").trim().toLowerCase();
  const productType = body.product_type || "";
  const productId = body.product_id || "";
  const amountUsd = body.amount_usd;
  const metadata = body.metadata || {};

  if (!email || !email.includes("@")) {
    return { status: 400, body: { success: false, error: "Valid email is required" } };
  }
  if (!VALID_PRODUCT_TYPES.includes(productType as CapitalProductType)) {
    return { status: 400, body: { success: false, error: "Invalid product type" } };
  }
  if (!productId && productType !== "research_donation") {
    return { status: 400, body: { success: false, error: "Product ID is required" } };
  }

  const resolvedUsd = resolveAmountUsd({ productType, productId, amountUsd });
  if (!resolvedUsd) {
    return { status: 400, body: { success: false, error: "Invalid or missing payment amount" } };
  }

  const reference = genReference();
  const amountKes = resolvedUsd * KES_RATE;
  const amountKobo = Math.round(amountKes * 100);
  const dbProductId = PRODUCT_IDS[productId] || PRODUCT_IDS.research_donation;
  const callbackUrl = `${getCallbackBase()}/payment-callback`;

  let dbPaymentId: string | null = null;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: payment } = await supabase
        .from("paystack_payments")
        .insert({
          user_id: null,
          email,
          amount_usd: resolvedUsd,
          amount_ngn: amountKobo,
          product_type: productType,
          product_id: dbProductId,
          status: "pending",
          paystack_reference: reference,
          metadata: { product_id: productId, ...metadata, platform: "smart-algos-capital" },
        })
        .select()
        .single();
      if (payment) dbPaymentId = payment.id;
    } catch (err) {
      console.warn("[Capital] DB insert skipped:", (err as Error).message);
    }
  }

  const paystackResult = await paystackRequest("/transaction/initialize", "POST", {
    email,
    amount: amountKobo,
    currency: "KES",
    reference,
    callback_url: callbackUrl,
    metadata: {
      payment_id: dbPaymentId,
      product_type: productType,
      product_id: productId,
      amount_usd: resolvedUsd,
      platform: "smart-algos-capital",
      ...metadata,
    },
  });

  if (!paystackResult?.status || !paystackResult.data) {
    return {
      status: 500,
      body: { success: false, error: paystackResult?.message || "Payment gateway error" },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      payment: {
        id: dbPaymentId || reference,
        reference,
        authorization_url: paystackResult.data.authorization_url,
        access_code: paystackResult.data.access_code,
        amount_usd: resolvedUsd,
        amount_kobo: amountKobo,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
        currency: "KES",
      },
    },
  };
}

function productIdToTier(productId: string): string | null {
  if (productId === "live-institutional") return "live-institutional";
  if (productId === "live-retail" || productId === "quant-pro") return "live-retail";
  if (productId === "research-pro") return "research-pro";
  return null;
}

export async function verifyCapitalPayment(reference: string) {
  const result = await paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, "GET");

  if (!result?.status || result.data?.status !== "success") {
    return { status: 400, body: { success: false, error: "Payment not successful" } };
  }

  const txData = result.data;
  const metadata = txData.metadata || {};
  const productType = metadata.product_type || "research_subscription";
  const productId = metadata.product_id || "";
  const amountUsd = metadata.amount_usd || txData.amount / 100 / KES_RATE;
  const email = txData.customer?.email;

  const supabase = getSupabase();
  if (supabase) {
    const { data: existing } = await supabase
      .from("paystack_payments")
      .select("*")
      .eq("paystack_reference", reference)
      .eq("status", "completed")
      .maybeSingle();

    if (!existing) {
      await supabase
        .from("paystack_payments")
        .update({
          status: "completed",
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paystack_data: txData,
        })
        .eq("paystack_reference", reference);
    }

    if (productType === "research_subscription" && email) {
      const tier = productIdToTier(productId);
      if (tier) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await supabase
          .from("profiles")
          .update({
            subscription_status: tier,
            subscription_expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      }
    }
  }

  return {
    status: 200,
    body: {
      success: true,
      message: "Payment verified successfully",
      product_type: productType,
      product_id: productId,
      amount_usd: amountUsd,
      reference,
      email,
      tier: productIdToTier(productId) || "free",
    },
  };
}

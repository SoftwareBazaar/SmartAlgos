import { createHmac, timingSafeEqual } from "node:crypto";

import { deliverBookingEmail } from "@/lib/booking-email-server";
import { verifyCapitalPayment } from "@/lib/capital-payments-server";
import { getPublicSiteUrl, getSupabaseAdmin, getUserFromRequest } from "@/lib/supabase-admin";
import { serveStrategyDownload } from "@/lib/strategy-unlock-server";
import { STRATEGY_FILE_PRODUCTS, getStrategyFileProduct } from "@/lib/strategy-catalog";

const SAMPLE_METRICS: Record<string, { cagr: string; sharpe: string; maxDrawdown: string; winRate: string }> = {
  "EUR/USD (Forex 1-Min)": { cagr: "+24.8%", sharpe: "1.71", maxDrawdown: "-4.3%", winRate: "61.2%" },
  "XAU/USD (Gold 5-Min)": { cagr: "+18.4%", sharpe: "1.38", maxDrawdown: "-6.1%", winRate: "57.8%" },
  "S&P 500 E-mini (Futures)": { cagr: "+14.2%", sharpe: "1.21", maxDrawdown: "-8.4%", winRate: "54.1%" },
};

function signaturesMatch(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function handlePaystackWebhook(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!secret || secret.includes("your_")) {
    return { status: 401, body: { error: "Webhook secret is not configured" } };
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") || "";
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  if (!signaturesMatch(hash, signature)) {
    return { status: 401, body: { error: "Invalid signature" } };
  }

  let event: { event?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as { event?: string; data?: Record<string, unknown> };
  } catch {
    return { status: 400, body: { error: "Invalid JSON" } };
  }

  if (event.event === "charge.success") {
    const data = event.data || {};
    const reference = asString(data.reference);
    if (reference) {
      try {
        await verifyCapitalPayment(reference);
      } catch (err) {
        console.error("[Portal] Webhook verify failed:", (err as Error).message);
      }
    }
  }

  return { status: 200, body: { status: "success" } };
}

export async function runBacktestJob(request: Request, body: {
  email?: string;
  assetClass?: string;
  lookbackPeriod?: string;
  strategyName?: string;
}) {
  const assetClass = (body.assetClass || "EUR/USD (Forex 1-Min)").trim();
  const lookbackPeriod = (body.lookbackPeriod || "3 Years (Tick Level)").trim();
  const strategyName = (body.strategyName || "sample-sandbox").trim();
  const email = (body.email || "").trim().toLowerCase();
  const metrics = SAMPLE_METRICS[assetClass] || SAMPLE_METRICS["EUR/USD (Forex 1-Min)"];

  const user = await getUserFromRequest(request);
  const supabase = getSupabaseAdmin();
  let backtestId: string | null = null;

  if (supabase) {
    const row = {
      user_id: user?.id ?? null,
      email: email || user?.email || null,
      asset_class: assetClass,
      strategy_name: strategyName,
      lookback_period: lookbackPeriod,
      metrics,
    };
    const { data, error } = await supabase.from("backtests").insert(row).select("id").maybeSingle();
    if (error) {
      console.warn("[Portal] backtests insert skipped:", error.message);
    } else {
      backtestId = data?.id ?? null;
    }
  }

  let emailed = false;
  if (email.includes("@")) {
    const site = getPublicSiteUrl();
    const result = await deliverBookingEmail({
      to: email,
      subject: `Your backtest results: ${assetClass}`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0e17;color:#fff;padding:20px;border-radius:8px;">
          <h2 style="color:#c9a227;margin-top:0;">Cloud backtest results</h2>
          <p><strong>Asset:</strong> ${assetClass} | <strong>Lookback:</strong> ${lookbackPeriod}</p>
          <p style="font-size:12px;color:#9aa4b2;">Sample sandbox output — not a live fill of custom rules.</p>
          <hr style="border-color:#333;" />
          <p><strong>CAGR:</strong> ${metrics.cagr}</p>
          <p><strong>Sharpe Ratio:</strong> ${metrics.sharpe}</p>
          <p><strong>Max Drawdown:</strong> ${metrics.maxDrawdown}</p>
          <p><strong>Win Rate:</strong> ${metrics.winRate}</p>
          <br />
          <a href="${site}/portal?tab=downloads" style="background:#c9a227;color:#0a0f1a;padding:10px 16px;text-decoration:none;font-weight:bold;border-radius:4px;">Unlock live signal execution rules ($49)</a>
        </div>
      `,
    });
    emailed = result.success;
  }

  return {
    status: 200,
    body: {
      success: true,
      metrics,
      backtestId,
      emailed,
      illustrative: true,
    },
  };
}

export async function getPortalOverview(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { status: 401, body: { success: false, error: "Sign in to open the client portal" } };
  }

  const supabase = getSupabaseAdmin();
  const email = user.email || "";

  let role = "retail";
  let fullName: string | null = null;
  let subscriptionStatus = "free";
  let subscriptionExpiresAt: string | null = null;

  if (supabase) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email, subscription_status, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.warn("[Portal] profiles:", profileError.message);
      const { data: fallback } = await supabase
        .from("profiles")
        .select("full_name, email, subscription_status, subscription_expires_at")
        .eq("id", user.id)
        .maybeSingle();
      if (fallback) {
        fullName = fallback.full_name;
        subscriptionStatus = fallback.subscription_status || "free";
        subscriptionExpiresAt = fallback.subscription_expires_at;
      }
    } else if (profile) {
      role = profile.role || "retail";
      fullName = profile.full_name;
      subscriptionStatus = profile.subscription_status || "free";
      subscriptionExpiresAt = profile.subscription_expires_at;
    }
  }

  async function safeSelect<T>(label: string, run: () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
    try {
      const { data, error } = await run();
      if (error) {
        console.warn(`[Portal] ${label}:`, error.message);
        return [] as T[];
      }
      return data || [];
    } catch (err) {
      console.warn(`[Portal] ${label}:`, (err as Error).message);
      return [] as T[];
    }
  }

  type AllocationRow = {
    id: string;
    prop_firm_name: string;
    account_number: string;
    allocated_strategy: string;
    status: string;
    allocated_equity: number | null;
    current_equity: number | null;
    pnl: number | null;
    max_dd_limit: number | null;
    current_dd: number | null;
    created_at: string;
  };
  type PurchaseRow = {
    id: string;
    strategy_id: string;
    paystack_reference: string;
    amount_paid: number;
    unlocked_at: string;
    email: string | null;
  };
  type BacktestRow = {
    id: string;
    asset_class: string;
    strategy_name: string;
    lookback_period: string;
    metrics: Record<string, string>;
    created_at: string;
  };

  const allocations = supabase
    ? await safeSelect<AllocationRow>("prop_allocations", () =>
        supabase
          .from("prop_allocations")
          .select(
            "id, prop_firm_name, account_number, allocated_strategy, status, allocated_equity, current_equity, pnl, max_dd_limit, current_dd, created_at",
          )
          .eq("investor_id", user.id)
          .order("created_at", { ascending: false }),
      )
    : [];

  const purchasesByUser = supabase
    ? await safeSelect<PurchaseRow>("strategy_purchases.user", () =>
        supabase
          .from("strategy_purchases")
          .select("id, strategy_id, paystack_reference, amount_paid, unlocked_at, email")
          .eq("user_id", user.id)
          .order("unlocked_at", { ascending: false }),
      )
    : [];
  const purchasesByEmail =
    supabase && email
      ? await safeSelect<PurchaseRow>("strategy_purchases.email", () =>
          supabase
            .from("strategy_purchases")
            .select("id, strategy_id, paystack_reference, amount_paid, unlocked_at, email")
            .eq("email", email)
            .order("unlocked_at", { ascending: false }),
        )
      : [];
  const purchases = [...purchasesByUser, ...purchasesByEmail.filter((row) => !purchasesByUser.some((p) => p.id === row.id))];

  const backtestsByUser = supabase
    ? await safeSelect<BacktestRow>("backtests.user", () =>
        supabase
          .from("backtests")
          .select("id, asset_class, strategy_name, lookback_period, metrics, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(12),
      )
    : [];
  const backtestsByEmail =
    supabase && email
      ? await safeSelect<BacktestRow>("backtests.email", () =>
          supabase
            .from("backtests")
            .select("id, asset_class, strategy_name, lookback_period, metrics, created_at")
            .eq("email", email)
            .order("created_at", { ascending: false })
            .limit(12),
        )
      : [];
  const backtests = [...backtestsByUser, ...backtestsByEmail.filter((row) => !backtestsByUser.some((b) => b.id === row.id))].slice(
    0,
    12,
  );

  const downloadItems = purchases.map((row) => {
    const product = getStrategyFileProduct(row.strategy_id);
    return {
      id: row.id,
      strategyId: row.strategy_id,
      title: product?.title || row.strategy_id,
      filename: product?.filename || `${row.strategy_id}.py`,
      reference: row.paystack_reference,
      date: row.unlocked_at,
      amountPaid: Number(row.amount_paid),
    };
  });

  return {
    status: 200,
    body: {
      success: true,
      profile: {
        id: user.id,
        email,
        fullName,
        role,
        subscriptionStatus,
        subscriptionExpiresAt,
      },
      allocations,
      downloads: downloadItems,
      backtests,
      catalog: STRATEGY_FILE_PRODUCTS.map(({ source: _source, ...rest }) => rest),
    },
  };
}

export { serveStrategyDownload };

import { deliverBookingEmail } from "@/lib/booking-email-server";
import { getPublicSiteUrl, getSupabaseAdmin } from "@/lib/supabase-admin";
import { getStrategyFileProduct } from "@/lib/strategy-catalog";

export type StrategyPurchaseRecord = {
  id: string;
  strategy_id: string;
  paystack_reference: string;
  amount_paid: number;
  unlocked_at: string;
  email: string | null;
};

export async function fulfillStrategyPurchase(input: {
  reference: string;
  amountPaid: number;
  email?: string | null;
  userId?: string | null;
  strategyId?: string | null;
  sendEmail?: boolean;
}): Promise<{ unlocked: boolean; strategyId: string | null; reason?: string }> {
  const strategyId = input.strategyId || "";
  const product = getStrategyFileProduct(strategyId);
  if (!product) {
    return { unlocked: false, strategyId: strategyId || null, reason: "not_a_strategy_file" };
  }

  const supabase = getSupabaseAdmin();
  let userId = input.userId || null;
  const email = (input.email || "").trim().toLowerCase() || null;

  if (supabase && !userId && email) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (profile?.id) userId = profile.id;
  }

  let firstUnlock = true;
  if (supabase) {
    const { data: existing } = await supabase
      .from("strategy_purchases")
      .select("id")
      .eq("paystack_reference", input.reference)
      .maybeSingle();

    if (existing) {
      firstUnlock = false;
    } else {
      const { error } = await supabase.from("strategy_purchases").insert({
        user_id: userId,
        email,
        strategy_id: product.id,
        paystack_reference: input.reference,
        amount_paid: input.amountPaid,
      });
      if (error) {
        console.error("[Portal] strategy_purchases insert failed:", error.message);
        if (error.code === "23505") firstUnlock = false;
      }
    }
  }

  if (firstUnlock && input.sendEmail !== false && email) {
    const site = getPublicSiteUrl();
    const downloadUrl = `${site}/portal?tab=downloads&ref=${encodeURIComponent(input.reference)}`;
    await deliverBookingEmail({
      to: email,
      subject: `Your strategy source file is ready — ${product.title}`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0f1a;color:#e8edf5;padding:24px;border-radius:8px;">
          <p style="color:#c9a227;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 8px;">Smart Algos Capital</p>
          <h2 style="color:#fff;margin:0 0 12px;">Purchase confirmed</h2>
          <p>Thank you for purchasing <strong>${product.title}</strong>.</p>
          <p>Your licensed research file <code>${product.filename}</code> is unlocked in the client portal.</p>
          <p><a href="${downloadUrl}" style="display:inline-block;background:#c9a227;color:#0a0f1a;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:700;">Download Python file</a></p>
          <p style="font-size:12px;color:#9aa4b2;">Reference ${input.reference}. This skeleton is research-only and is not a live execution bot.</p>
        </div>
      `,
    });
  }

  return { unlocked: true, strategyId: product.id };
}

export async function serveStrategyDownload(reference: string) {
  const ref = (reference || "").trim();
  if (!ref) {
    return { status: 400, body: { success: false, error: "Missing purchase reference" } };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { status: 503, body: { success: false, error: "Downloads are temporarily unavailable" } };
  }

  const { data, error } = await supabase
    .from("strategy_purchases")
    .select("strategy_id, paystack_reference, unlocked_at")
    .eq("paystack_reference", ref)
    .maybeSingle();

  if (error || !data) {
    return { status: 404, body: { success: false, error: "No unlocked file for this reference" } };
  }

  const product = getStrategyFileProduct(data.strategy_id);
  if (!product) {
    return { status: 404, body: { success: false, error: "Strategy file is no longer listed" } };
  }

  return {
    status: 200 as const,
    filename: product.filename,
    content: product.source,
    contentType: "text/x-python; charset=utf-8",
  };
}

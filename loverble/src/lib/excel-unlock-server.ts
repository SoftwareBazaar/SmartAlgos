import { readFile } from "node:fs/promises";
import path from "node:path";

import { deliverBookingEmail } from "@/lib/booking-email-server";
import {
  getExcelModuleByUnlockId,
  getExcelModuleProduct,
  type ExcelModuleProduct,
} from "@/lib/excel-module-catalog";
import { getPublicSiteUrl, getSupabaseAdmin } from "@/lib/supabase-admin";

function unlockRef(baseReference: string, moduleId: string) {
  return `${baseReference}__${moduleId}`;
}

function excelAssetPath(filename: string) {
  return path.join(process.cwd(), "content", "excel-modules", filename);
}

function licenseReceipt(module: ExcelModuleProduct, reference: string) {
  return [
    "Smart Algo STS — Licensed Excel Module Receipt",
    "=============================================",
    "",
    `Module: ${module.title}`,
    `File: ${module.filename}`,
    `Reference: ${reference}`,
    `Unlocked: ${new Date().toISOString()}`,
    "",
    "Your payment entitlement is confirmed.",
    "Place the licensed .xlsx workbook at:",
    `  content/excel-modules/${module.filename}`,
    "on the deployment host, then re-download from the client portal.",
    "",
    "Macro-free educational models — not personalized financial advice.",
    "",
  ].join("\n");
}

export async function fulfillExcelPurchase(input: {
  reference: string;
  amountPaid: number;
  email?: string | null;
  userId?: string | null;
  productId?: string | null;
  sendEmail?: boolean;
}): Promise<{ unlocked: boolean; productId: string | null; moduleIds: string[]; reason?: string }> {
  const product = getExcelModuleProduct(input.productId || "");
  if (!product) {
    return {
      unlocked: false,
      productId: input.productId || null,
      moduleIds: [],
      reason: "unknown_excel_product",
    };
  }

  const supabase = getSupabaseAdmin();
  let userId = input.userId || null;
  const email = (input.email || "").trim().toLowerCase() || null;

  if (supabase && !userId && email) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
    if (profile?.id) userId = profile.id;
  }

  const moduleIds = product.unlocks;
  let firstUnlock = false;

  if (supabase) {
    for (const moduleId of moduleIds) {
      const rowRef = unlockRef(input.reference, moduleId);
      const { data: existing } = await supabase
        .from("strategy_purchases")
        .select("id")
        .eq("paystack_reference", rowRef)
        .maybeSingle();

      if (existing) continue;

      const { error } = await supabase.from("strategy_purchases").insert({
        user_id: userId,
        email,
        strategy_id: moduleId,
        paystack_reference: rowRef,
        amount_paid: input.amountPaid,
      });
      if (error) {
        console.error("[Portal] excel unlock insert failed:", error.message);
      } else {
        firstUnlock = true;
      }
    }
  } else {
    firstUnlock = true;
  }

  if (firstUnlock && input.sendEmail !== false && email) {
    const site = getPublicSiteUrl();
    const downloadUrl = `${site}/portal?tab=downloads&ref=${encodeURIComponent(input.reference)}`;
    const fileList = moduleIds
      .map((id) => {
        const mod = getExcelModuleByUnlockId(id);
        return `<li><strong>${mod?.title || id}</strong> — <code>${mod?.filename || id}</code></li>`;
      })
      .join("");

    await deliverBookingEmail({
      to: email,
      subject: `Your Excel quant modules are ready — ${product.title}`,
      html: `
        <div style="font-family:Inter,sans-serif;background:#0a0f1a;color:#e8edf5;padding:24px;border-radius:8px;">
          <p style="color:#c9a227;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 8px;">Smart Algo STS</p>
          <h2 style="color:#fff;margin:0 0 12px;">Purchase confirmed</h2>
          <p>Thank you for purchasing <strong>${product.title}</strong>.</p>
          <p>The following workbook(s) are unlocked in the client portal:</p>
          <ul>${fileList}</ul>
          <p><a href="${downloadUrl}" style="display:inline-block;background:#c9a227;color:#0a0f1a;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:700;">Open downloads</a></p>
          <p style="font-size:12px;color:#9aa4b2;">Reference ${input.reference}. Macro-free educational models — not personalized financial advice.</p>
        </div>
      `,
    });
  }

  return { unlocked: true, productId: product.id, moduleIds };
}

export type DownloadPayload =
  | {
      status: 200;
      filename: string;
      content: Buffer | string;
      contentType: string;
      isBinary: boolean;
    }
  | { status: number; body: Record<string, unknown>; strategyLookup?: { strategy_id: string; paystack_reference: string } };

export async function serveExcelDownload(reference: string): Promise<DownloadPayload> {
  const ref = (reference || "").trim();
  if (!ref) {
    return { status: 400, body: { success: false, error: "Missing purchase reference" } };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { status: 503, body: { success: false, error: "Downloads are temporarily unavailable" } };
  }

  let { data } = await supabase
    .from("strategy_purchases")
    .select("strategy_id, paystack_reference, unlocked_at")
    .eq("paystack_reference", ref)
    .maybeSingle();

  if (!data && !ref.includes("__")) {
    const { data: rows } = await supabase
      .from("strategy_purchases")
      .select("strategy_id, paystack_reference, unlocked_at")
      .like("paystack_reference", `${ref}__%`)
      .limit(1);
    data = rows?.[0] || null;
  }

  if (!data) {
    return { status: 404, body: { success: false, error: "No unlocked file for this reference" } };
  }

  const excelModule = getExcelModuleByUnlockId(data.strategy_id);
  if (!excelModule) {
    return {
      status: 404,
      body: { success: false, error: "not_excel" },
      strategyLookup: {
        strategy_id: data.strategy_id,
        paystack_reference: data.paystack_reference,
      },
    };
  }

  try {
    const buf = await readFile(excelAssetPath(excelModule.filename));
    return {
      status: 200,
      filename: excelModule.filename,
      content: buf,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      isBinary: true,
    };
  } catch {
    return {
      status: 200,
      filename: excelModule.filename.replace(/\.xlsx$/i, "") + "_license.txt",
      content: licenseReceipt(excelModule, data.paystack_reference),
      contentType: "text/plain; charset=utf-8",
      isBinary: false,
    };
  }
}

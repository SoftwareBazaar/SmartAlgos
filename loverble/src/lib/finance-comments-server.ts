import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { deliverBookingEmail, getAdminEmail, isEmailConfigured } from "@/lib/booking-email-server";

export type FinanceComment = {
  id: string;
  slug: string;
  author_name: string;
  body: string;
  created_at: string;
  approved?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function listFinanceComments(slug: string) {
  const clean = (slug || "").trim().slice(0, 120);
  if (!clean) {
    return { status: 400, body: { success: false, error: "Slug required", comments: [] as FinanceComment[] } };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { status: 200, body: { success: true, comments: [] as FinanceComment[], storage: "none" } };
  }

  const { data, error } = await supabase
    .from("finance_comments")
    .select("id, slug, author_name, body, created_at")
    .eq("slug", clean)
    .eq("approved", true)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    // Table may not exist yet — fail soft
    console.warn("[FinanceComments] list:", error.message);
    return { status: 200, body: { success: true, comments: [] as FinanceComment[], storage: "unavailable" } };
  }

  return {
    status: 200,
    body: { success: true, comments: (data || []) as FinanceComment[], storage: "supabase" },
  };
}

export async function submitFinanceComment(body: {
  slug?: string;
  name?: string;
  email?: string;
  comment?: string;
}) {
  const slug = (body.slug || "").trim().slice(0, 120);
  const name = (body.name || "").trim().slice(0, 80);
  const email = (body.email || "").trim().toLowerCase().slice(0, 120);
  const comment = (body.comment || "").trim().slice(0, 2000);

  if (!slug) {
    return { status: 400, body: { success: false, error: "Missing article slug" } };
  }
  if (name.length < 2) {
    return { status: 400, body: { success: false, error: "Name is required" } };
  }
  if (email && !email.includes("@")) {
    return { status: 400, body: { success: false, error: "Valid email is required" } };
  }
  if (comment.length < 8) {
    return { status: 400, body: { success: false, error: "Comment is too short" } };
  }

  const supabase = getSupabase();
  let stored: FinanceComment | null = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("finance_comments")
      .insert({
        slug,
        author_name: name,
        author_email: email || null,
        body: comment,
        approved: false,
      })
      .select("id, slug, author_name, body, created_at, approved")
      .maybeSingle();

    if (error) {
      console.warn("[FinanceComments] insert:", error.message);
    } else if (data) {
      stored = data as FinanceComment;
    }
  }

  if (isEmailConfigured()) {
    const admin = getAdminEmail();
    await deliverBookingEmail({
      to: admin,
      subject: `[Finance comment] ${slug} — ${name}`,
      html: `
        <p><strong>Slug:</strong> ${escapeHtml(slug)}</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
        <p>${escapeHtml(comment).replace(/\n/g, "<br/>")}</p>
        <p><em>Pending moderation (approved=false). Approve in Supabase finance_comments.</em></p>
      `,
      text: `${slug}\n${name} <${email || "n/a"}>\n\n${comment}`,
    });
  }

  return {
    status: 200,
    body: {
      success: true,
      pending: true,
      message: "Comment submitted for review. It will appear after moderation.",
      comment: stored
        ? {
            id: stored.id,
            slug: stored.slug,
            author_name: stored.author_name,
            body: stored.body,
            created_at: stored.created_at,
          }
        : {
            id: `local-${Date.now()}`,
            slug,
            author_name: name,
            body: comment,
            created_at: new Date().toISOString(),
          },
    },
  };
}

import { deliverBookingEmail, getAdminEmail, isEmailConfigured } from "@/lib/booking-email-server";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitDeskMessage(body: {
  name?: string;
  email?: string;
  company?: string;
  topic?: string;
  message?: string;
  source?: string;
}) {
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const company = (body.company || "").trim();
  const topic = (body.topic || "General enquiry").trim();
  const message = (body.message || "").trim();
  const source = (body.source || "contact").trim();

  if (name.length < 2) {
    return { status: 400, body: { success: false, error: "Name is required" } };
  }
  if (!email.includes("@")) {
    return { status: 400, body: { success: false, error: "Valid email is required" } };
  }
  if (message.length < 8) {
    return { status: 400, body: { success: false, error: "Message is too short" } };
  }
  if (!isEmailConfigured()) {
    return {
      status: 503,
      body: {
        success: false,
        error: "Desk email is not configured yet. Write to support@smartalgos.com instead.",
      },
    };
  }

  const admin = getAdminEmail();
  const subject = `[Desk] ${source}: ${topic} — ${name}`;
  const html = `
    <p><strong>Source:</strong> ${escapeHtml(source)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
    <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
    <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
  `;

  const sent = await deliverBookingEmail({
    to: admin,
    subject,
    html,
    text: `${source}\n${name} <${email}>\n${topic}\n\n${message}`,
  });

  if (!sent.success) {
    return {
      status: 502,
      body: { success: false, error: sent.reason || "Could not deliver the message" },
    };
  }

  return { status: 200, body: { success: true } };
}

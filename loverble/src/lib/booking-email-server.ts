/**
 * Booking emails — SendGrid first, Gmail/SMTP fallback (matches legacy Express setup).
 */
import nodemailer from "nodemailer";

export function getFromEmail() {
  return (
    process.env.EMAIL_FROM ||
    process.env.EMAIL_USER ||
    "softwarebazaar.ke@gmail.com"
  ).trim();
}

function getReplyTo() {
  return (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || getFromEmail()).trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function trySendGrid(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  if (!apiKey || apiKey.includes("your_")) {
    return { success: false as const, reason: "sendgrid_not_configured" };
  }

  const from = getFromEmail();
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "Smart Algos Capital" },
      reply_to: { email: getReplyTo(), name: "Smart Algos Capital" },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Bookings] SendGrid error:", res.status, body);
    return { success: false as const, reason: `sendgrid_${res.status}: ${body.slice(0, 200)}` };
  }

  console.log(`[Bookings] Email sent via SendGrid → ${to}`);
  return { success: true as const, channel: "sendgrid" as const };
}

async function trySmtp(to: string, subject: string, html: string, text: string) {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();
  if (!user || !pass) {
    return { success: false as const, reason: "smtp_not_configured" };
  }

  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || 587);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 12_000,
      greetingTimeout: 12_000,
      socketTimeout: 12_000,
    });

    await transporter.sendMail({
      from: `"Smart Algos Capital" <${getFromEmail()}>`,
      to,
      replyTo: getReplyTo(),
      subject,
      text,
      html,
    });

    console.log(`[Bookings] Email sent via SMTP → ${to}`);
    return { success: true as const, channel: "smtp" as const };
  } catch (err) {
    const message = (err as Error).message || "smtp_error";
    console.error("[Bookings] SMTP error:", message);
    return { success: false as const, reason: `smtp: ${message}` };
  }
}

export async function deliverBookingEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; channel?: string; reason?: string }> {
  const { to, subject, html } = opts;
  const text = opts.text ?? stripHtml(html);

  if (!to?.includes("@")) {
    return { success: false, reason: "invalid_recipient" };
  }

  const sg = await trySendGrid(to, subject, html, text);
  if (sg.success) return sg;

  const smtp = await trySmtp(to, subject, html, text);
  if (smtp.success) return smtp;

  const configured = {
    sendgrid: !!process.env.SENDGRID_API_KEY,
    smtp: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
  };
  console.error("[Bookings] All email channels failed", { to, configured, sg: sg.reason, smtp: smtp.reason });

  return {
    success: false,
    reason:
      !configured.sendgrid && !configured.smtp
        ? "Set SENDGRID_API_KEY or EMAIL_USER+EMAIL_PASSWORD on Vercel"
        : sg.reason || smtp.reason || "email_delivery_failed",
  };
}

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || process.env.EMAIL_USER || getFromEmail()).trim();
}

export function isEmailConfigured() {
  return !!(
    process.env.SENDGRID_API_KEY ||
    (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
  );
}

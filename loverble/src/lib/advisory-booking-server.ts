/**
 * Advisory consultation bookings — Nitro middleware handlers.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { PRICING } from "@/lib/pricing";
import {
  bookingRange,
  consultationDurationMinutes,
  consultationTypeFromDb,
  consultationTypeToDb,
  formatSlotLabel,
  isDateBookable,
  normalizeTimeForDb,
  normalizeTimeSlot,
  productLabel,
  rangesOverlap,
  serviceToDb,
  slotsForType,
  todayInEat,
  type ConsultationType,
} from "@/lib/advisory-scheduling";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"] as const;

function genBookingRef() {
  return `BOOK-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[Bookings] Supabase not configured — check SUPABASE_URL and service role key on Vercel");
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function getMeetingLink() {
  return (
    process.env.ADVISORY_MEETING_LINK ||
    process.env.VITE_MEETING_LINK ||
    process.env.MEETING_LINK ||
    ""
  ).trim();
}

function getFromEmail() {
  return process.env.EMAIL_USER || "softwarebazaar.ke@gmail.com";
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "softwarebazaar.ke@gmail.com";
}

async function sendGridMail(to: string, subject: string, html: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[Bookings] SENDGRID_API_KEY not set — email skipped");
    return { success: false, reason: "not_configured" };
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: getFromEmail(), name: "Smart Algos Capital" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Bookings] SendGrid error:", res.status, text);
    return { success: false, reason: text };
  }
  return { success: true };
}

type BookingRow = {
  time: string;
  consultation_type: string;
  status: string;
};

/** Expire past days, purge test rows, optional one-time full reset (BOOKING_RESET_ALL=true on Vercel). */
export async function runBookingMaintenance(supabase: SupabaseClient | null) {
  if (!supabase) return;

  const today = todayInEat();

  if (process.env.BOOKING_RESET_ALL === "true") {
    const { error } = await supabase.from("consultation_bookings").delete().neq("reference", "");
    if (error) console.error("[Bookings] Reset all failed:", error.message);
    else console.warn("[Bookings] BOOKING_RESET_ALL — all consultation bookings deleted");
    return;
  }

  // Past calendar days (EAT) no longer hold slots
  const { error: expireError } = await supabase
    .from("consultation_bookings")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .lt("date", today)
    .in("status", [...ACTIVE_BOOKING_STATUSES]);

  if (expireError) {
    console.error("[Bookings] Expire past bookings failed:", expireError.message);
  }

  // Remove automated test bookings cluttering live slots
  const { error: testError } = await supabase
    .from("consultation_bookings")
    .delete()
    .or(
      "email.ilike.%@example.com,email.ilike.%@test.com,email.ilike.debug-%,name.ilike.%test%,name.eq.Test User,name.eq.Debug Test,name.eq.Slot Test",
    );

  if (testError) {
    console.error("[Bookings] Purge test bookings failed:", testError.message);
  }
}

export async function clearAllBookings(adminSecret: string) {
  const expected = process.env.BOOKING_ADMIN_SECRET;
  if (!expected || adminSecret !== expected) {
    return { status: 401, body: { success: false, error: "Unauthorized" } };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { status: 503, body: { success: false, error: "Database not configured" } };
  }

  const { error, count } = await supabase
    .from("consultation_bookings")
    .delete({ count: "exact" })
    .neq("reference", "");

  if (error) {
    return { status: 500, body: { success: false, error: error.message } };
  }

  return {
    status: 200,
    body: { success: true, deleted: count ?? 0, message: "All consultation bookings cleared." },
  };
}

async function fetchBookingsForDate(supabase: SupabaseClient | null, date: string): Promise<BookingRow[]> {
  if (!supabase) return [];
  if (date < todayInEat()) return [];

  await runBookingMaintenance(supabase);

  const { data, error } = await supabase
    .from("consultation_bookings")
    .select("time, consultation_type, status")
    .eq("date", date)
    .in("status", [...ACTIVE_BOOKING_STATUSES]);

  if (error) {
    console.error("[Bookings] Slot query error:", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    ...row,
    time: normalizeTimeSlot(String(row.time)),
  })) as BookingRow[];
}

type DbBookingRow = {
  reference: string;
  service: string;
  consultation_type: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  guide_topic?: string | null;
};

function buildDbRow(
  payload: BookingPayload,
  reference: string,
  consultationType: ConsultationType,
  status: string,
  paymentStatus: string,
  amount: number,
): DbBookingRow {
  return {
    reference,
    service: serviceToDb(payload.service!),
    consultation_type: consultationTypeToDb(consultationType),
    date: payload.date!,
    time: normalizeTimeForDb(payload.time!),
    name: payload.name!.trim(),
    email: payload.email!.trim().toLowerCase(),
    phone: payload.phone?.trim() || null,
    notes: payload.notes?.trim() || null,
    amount,
    currency: "USD",
    status,
    payment_status: paymentStatus,
    guide_topic: null,
  };
}

async function insertConsultationBooking(
  supabase: SupabaseClient,
  row: DbBookingRow,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const timeShort = normalizeTimeSlot(row.time);
  const core = {
    reference: row.reference,
    service: row.service,
    consultation_type: row.consultation_type,
    date: row.date,
    time: timeShort,
    name: row.name,
    email: row.email,
  };

  const attempts: Record<string, unknown>[] = [
    { ...row, time: timeShort, guide_topic: undefined },
    { ...row, guide_topic: undefined },
    {
      ...row,
      time: timeShort,
      payment_status: "pending",
      guide_topic: undefined,
    },
    {
      ...core,
      phone: row.phone,
      notes: row.notes,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      payment_status: row.payment_status,
    },
    {
      ...core,
      status: "confirmed",
      payment_status: "pending",
      amount: 0,
      currency: "USD",
    },
    core,
  ];

  let lastMessage = "Unknown database error";
  for (const attempt of attempts) {
    const cleaned = Object.fromEntries(Object.entries(attempt).filter(([, v]) => v !== undefined));
    const { error } = await supabase.from("consultation_bookings").insert(cleaned);
    if (!error) return { ok: true };
    lastMessage = error.message;
    console.error("[Bookings] Insert attempt failed:", error.message, error.details, error.hint);
  }

  return { ok: false, message: lastMessage };
}

function slotAvailability(
  bookings: BookingRow[],
  date: string,
  consultationType: ConsultationType,
): { time: string; available: boolean }[] {
  if (!isDateBookable(date)) {
    return slotsForType(consultationType).map((time) => ({ time, available: false }));
  }

  const occupied = bookings.map((b) =>
    bookingRange(b.time, consultationTypeFromDb(b.consultation_type)),
  );

  return slotsForType(consultationType).map((time) => {
    const candidate = bookingRange(time, consultationType);
    const taken = occupied.some((range) => rangesOverlap(candidate, range));
    return { time, available: !taken };
  });
}

async function assertSlotAvailable(
  supabase: SupabaseClient | null,
  date: string,
  time: string,
  consultationType: ConsultationType,
) {
  if (!isDateBookable(date)) {
    throw new Error("Please choose today or a future date");
  }

  const allowed = slotsForType(consultationType);
  if (!allowed.includes(time)) {
    throw new Error("Invalid time slot for this session type");
  }

  const bookings = await fetchBookingsForDate(supabase, date);
  const slots = slotAvailability(bookings, date, consultationType);
  const match = slots.find((s) => s.time === time);
  if (!match?.available) {
    throw new Error("That time slot is no longer available — pick another");
  }
}

function emailShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0a0e17;margin:0;padding:0;">
<div style="max-width:580px;margin:40px auto;background:#121826;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.25);">
<div style="background:linear-gradient(135deg,#1a1f2e,#0f1419);padding:32px;text-align:center;border-bottom:1px solid rgba(212,175,55,0.2);">
<h1 style="color:#d4af37;margin:0;font-size:22px;">${title}</h1>
</div>
<div style="padding:32px;color:#94a3b8;font-size:15px;line-height:1.6;">${bodyHtml}</div>
<div style="background:#0a0e17;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
<p style="color:#475569;font-size:12px;margin:0;">Smart Algos Investment Solution Ltd · Kenya</p>
</div></div></body></html>`;
}

async function sendClientConfirmation(opts: {
  name: string;
  email: string;
  service: string;
  consultationType: ConsultationType;
  date: string;
  time: string;
  reference: string;
  isPaid: boolean;
}) {
  const { name, email, service, consultationType, date, time, reference, isPaid } = opts;
  const meetingLink = getMeetingLink();
  const duration = consultationDurationMinutes(consultationType);
  const product = productLabel(service);

  const meetingBlock = meetingLink
    ? `<p style="margin:24px 0;"><a href="${meetingLink}" style="display:inline-block;background:#d4af37;color:#0a0e17;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;">Join meeting</a></p>
       <p style="font-size:13px;color:#64748b;">Or copy this link: <a href="${meetingLink}" style="color:#d4af37;">${meetingLink}</a></p>`
    : `<p style="background:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.25);border-radius:8px;padding:14px;font-size:14px;color:#d4af37;">
         We will email your meeting link shortly if it is not included here. Reference: <strong>${reference}</strong>
       </p>`;

  const html = emailShell(
    isPaid ? "90-minute advisory confirmed" : "20-minute consultation booked",
    `<p>Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
     <p>Your ${isPaid ? "paid follow-up" : "free"} advisory session is confirmed.</p>
     <table style="width:100%;margin:20px 0;border-collapse:collapse;">
       <tr><td style="padding:8px 0;color:#64748b;">Topic</td><td style="color:#e2e8f0;font-weight:600;">${product}</td></tr>
       <tr><td style="padding:8px 0;color:#64748b;">Date</td><td style="color:#e2e8f0;font-weight:600;">${date}</td></tr>
       <tr><td style="padding:8px 0;color:#64748b;">Time</td><td style="color:#e2e8f0;font-weight:600;">${formatSlotLabel(time)} (${duration} min)</td></tr>
       <tr><td style="padding:8px 0;color:#64748b;">Reference</td><td style="color:#e2e8f0;font-weight:600;">${reference}</td></tr>
     </table>
     ${meetingBlock}
     ${!isPaid ? `<p style="font-size:14px;">After your free intro, you can book a <strong>90-minute deep-dive</strong> for $${PRICING.consultation.toFixed(2)} if you want to continue.</p>` : ""}
     <p style="font-size:13px;color:#64748b;">Questions? Reply to this email or contact ${getFromEmail()}</p>`,
  );

  const subject = isPaid
    ? `Advisory confirmed — ${date} at ${formatSlotLabel(time)}`
    : `Your free 20-min consultation — ${date} at ${formatSlotLabel(time)}`;

  return sendGridMail(email, subject, html);
}

async function sendAdminNotification(opts: {
  name: string;
  email: string;
  phone?: string;
  service: string;
  consultationType: ConsultationType;
  date: string;
  time: string;
  reference: string;
  isPaid: boolean;
  notes?: string;
}) {
  const { name, email, phone, service, consultationType, date, time, reference, isPaid, notes } = opts;
  const html = emailShell(
    isPaid ? "New paid advisory booking" : "New free consultation",
    `<p><strong>${name}</strong> booked a ${consultationDurationMinutes(consultationType)}-minute session.</p>
     <ul style="padding-left:18px;">
       <li>Email: ${email}</li>
       <li>Phone: ${phone || "—"}</li>
       <li>Product: ${productLabel(service)}</li>
       <li>Date: ${date} · ${formatSlotLabel(time)}</li>
       <li>Reference: ${reference}</li>
       <li>Payment: ${isPaid ? `$${PRICING.consultation.toFixed(2)} paid` : "Free"}</li>
     </ul>
     ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}`,
  );

  return sendGridMail(
    getAdminEmail(),
    `${isPaid ? "Paid" : "Free"} advisory — ${name} · ${date}`,
    html,
  );
}

export async function getAvailableSlots(date: string, consultationType: string) {
  const type: ConsultationType = consultationType === "paid_90" ? "paid_90" : "free_20";
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { status: 400, body: { success: false, error: "Valid date required (YYYY-MM-DD)" } };
  }

  const supabase = getSupabase();
  const bookings = await fetchBookingsForDate(supabase, date);
  const slots = slotAvailability(bookings, date, type);

  return { status: 200, body: { success: true, slots } };
}

type BookingPayload = {
  service?: string;
  consultation_type?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

function validatePayload(body: BookingPayload, requireSlot = true) {
  const { service, consultation_type, date, time, name, email } = body;
  if (!service || !consultation_type || !name || !email) {
    return "Name, email, product, and session type are required";
  }
  if (requireSlot && (!date || !time)) {
    return "Date and time are required";
  }
  if (!email.includes("@")) {
    return "Valid email is required";
  }
  if (consultation_type !== "free_20" && consultation_type !== "paid_90") {
    return "Invalid consultation type";
  }
  return null;
}

export async function createFreeBooking(body: BookingPayload) {
  const err = validatePayload(body);
  if (err) return { status: 400, body: { success: false, error: err } };

  const consultationType = body.consultation_type as ConsultationType;
  if (consultationType !== "free_20") {
    return { status: 400, body: { success: false, error: "Use payment flow for paid sessions" } };
  }

  const supabase = getSupabase();
  if (supabase) await runBookingMaintenance(supabase);

  try {
    await assertSlotAvailable(supabase, body.date!, body.time!, consultationType);
  } catch (e) {
    return { status: 409, body: { success: false, error: (e as Error).message } };
  }

  const reference = genBookingRef();
  const uiService = body.service!;
  const row = buildDbRow(body, reference, consultationType, "confirmed", "free", 0);
  const slotTime = normalizeTimeSlot(body.time!);

  let savedToDb = false;
  if (supabase) {
    const saved = await insertConsultationBooking(supabase, row);
    savedToDb = saved.ok;
    if (!saved.ok) {
      console.error("[Bookings] DB save failed after retries:", saved.message);
    }
  } else {
    console.warn("[Bookings] SUPABASE_URL or service key missing — sending confirmation email only");
  }

  const meetingLink = getMeetingLink();
  void sendClientConfirmation({
    name: row.name,
    email: row.email,
    service: uiService,
    consultationType,
    date: row.date,
    time: slotTime,
    reference,
    isPaid: false,
  }).catch(console.error);
  void sendAdminNotification({
    name: row.name,
    email: row.email,
    phone: body.phone,
    service: uiService,
    consultationType,
    date: row.date,
    time: slotTime,
    reference,
    isPaid: false,
    notes: body.notes,
  }).catch(console.error);

  return {
    status: 200,
    body: {
      success: true,
      reference,
      savedToDb,
      meetingLink: meetingLink || undefined,
      message: savedToDb
        ? "Your free 20-minute consultation is booked. Check your email for the meeting link."
        : "Your consultation is confirmed. Check your email for the meeting link.",
    },
  };
}

export async function createPendingPaidBooking(body: BookingPayload) {
  const err = validatePayload(body);
  if (err) return { status: 400, body: { success: false, error: err } };

  const consultationType = body.consultation_type as ConsultationType;
  if (consultationType !== "paid_90") {
    return { status: 400, body: { success: false, error: "Invalid session type for paid booking" } };
  }

  const supabase = getSupabase();
  if (supabase) await runBookingMaintenance(supabase);

  try {
    await assertSlotAvailable(supabase, body.date!, body.time!, consultationType);
  } catch (e) {
    return { status: 409, body: { success: false, error: (e as Error).message } };
  }

  const reference = genBookingRef();
  const row = buildDbRow(body, reference, consultationType, "pending", "pending", PRICING.consultation);

  if (supabase) {
    const saved = await insertConsultationBooking(supabase, row);
    if (!saved.ok) {
      console.error("[Bookings] Pending insert failed after retries:", saved.message);
      return {
        status: 409,
        body: {
          success: false,
          error: "Could not reserve that slot. Pick another time or contact us.",
        },
      };
    }
  } else {
    console.warn("[Bookings] SUPABASE_URL or service key missing — cannot hold paid slot");
    return {
      status: 503,
      body: { success: false, error: "Booking system temporarily unavailable. Please email us directly." },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      reference,
      message: "Slot reserved — complete payment to confirm.",
    },
  };
}

export async function confirmPaidBookingFromPayment(metadata: Record<string, unknown>, paystackReference?: string) {
  const bookingRef = metadata.booking_reference as string | undefined;
  if (!bookingRef) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const { data: booking, error } = await supabase
    .from("consultation_bookings")
    .select("*")
    .eq("reference", bookingRef)
    .maybeSingle();

  if (error || !booking) {
    console.warn("[Bookings] Paid confirm — booking not found:", bookingRef);
    return;
  }

  if (booking.payment_status === "paid" && booking.status === "confirmed") return;

  await supabase
    .from("consultation_bookings")
    .update({
      status: "confirmed",
      payment_status: "paid",
      paystack_payment_id: paystackReference || null,
      updated_at: new Date().toISOString(),
    })
    .eq("reference", bookingRef);

  const slotTime = normalizeTimeSlot(String(booking.time));
  void sendClientConfirmation({
    name: booking.name,
    email: booking.email,
    service: booking.service,
    consultationType: "paid_90",
    date: booking.date,
    time: slotTime,
    reference: bookingRef,
    isPaid: true,
  }).catch(console.error);
  void sendAdminNotification({
    name: booking.name,
    email: booking.email,
    phone: booking.phone,
    service: booking.service,
    consultationType: "paid_90",
    date: booking.date,
    time: slotTime,
    reference: bookingRef,
    isPaid: true,
    notes: booking.notes,
  }).catch(console.error);
}

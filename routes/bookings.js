/**
 * routes/bookings.js
 * Consultation booking system – supports free (first-time) and paid ($5) sessions.
 * Payment is handled via Paystack (existing infrastructure).
 */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const axios = require('axios');
const databaseService = require('../services/databaseService');

console.log('📅 [Bookings] Route file loaded');
console.log('📅 [Bookings] Router object created:', typeof router);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genRef() {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `BOOK-${ts}-${rand}`;
}

function getMailer() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: { rejectUnauthorized: false }
  });
}

async function sendConfirmationEmail({ name, email, service, consultationType, date, time, reference, isPaid }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('[Bookings] Email not configured – skipping confirmation email');
    return;
  }

  const serviceLabels = {
    algo_development: 'Algo Development',
    stock_trading: 'Stock Trading',
    forex_trading: 'Forex Trading',
    web_development: 'Web Development',
    other: 'Other Service'
  };

  const serviceLabel = serviceLabels[service] || service;
  const mailer = getMailer();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;margin:0;padding:0;">
      <div style="max-width:580px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Booking Confirmed ✓</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Your consultation is scheduled</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#94a3b8;font-size:16px;margin-top:0;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="color:#64748b;font-size:15px;line-height:1.6;">
            Your consultation has been successfully booked. Here are your details:
          </p>

          <div style="background:#0f172a;border-radius:12px;padding:20px;margin:24px 0;border:1px solid rgba(255,255,255,0.08);">
            ${[
              ['Service', serviceLabel],
              ['Session Type', consultationType === 'free_30' ? 'Free 30-Minute Consultation' : 'Deep-Dive 1h 30m Consultation'],
              ['Date', date],
              ['Time', time],
              ['Payment', isPaid ? '$5 (Paid via Paystack)' : 'Free (First Session)'],
              ['Reference', reference]
            ].map(([label, value]) => `
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                <span style="color:#64748b;font-size:13px;">${label}</span>
                <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${value}</span>
              </div>
            `).join('')}
          </div>

          <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="color:#818cf8;font-size:14px;margin:0;line-height:1.5;">
              📅 We will reach out to confirm the meeting link or location before your session.
              If you need to reschedule, please reply to this email with your reference number.
            </p>
          </div>

          <p style="color:#475569;font-size:13px;">
            Questions? Reply to this email or contact us at
            <a href="mailto:${process.env.EMAIL_USER}" style="color:#818cf8;">${process.env.EMAIL_USER}</a>
          </p>
        </div>
        <div style="background:#0f172a;padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:#334155;font-size:12px;margin:0;">Smart Algos Trading Platform · Embu, Kenya</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await mailer.sendMail({
      from: `"Smart Algos" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed – ${serviceLabel} on ${date}`,
      html
    });
    console.log(`[Bookings] Confirmation email sent to ${email}`);
  } catch (err) {
    console.error('[Bookings] Email send error:', err.message);
  }
}

async function sendAdminNotification({ name, email, phone, service, consultationType, date, time, reference, isPaid }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;

  const serviceLabels = {
    algo_development: 'Algo Development',
    stock_trading: 'Stock Trading',
    forex_trading: 'Forex Trading',
    web_development: 'Web Development',
    other: 'Other Service'
  };

  const mailer = getMailer();

  await mailer.sendMail({
    from: `"Smart Algos Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `📅 New Booking: ${name} – ${date} ${time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
        <h2>New Consultation Booking</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['Name', name],
            ['Email', email],
            ['Phone', phone || 'Not provided'],
            ['Service', serviceLabels[service] || service],
            ['Session', consultationType === 'free_30' ? 'Free 30-min' : 'Paid 1h30 ($5)'],
            ['Date', date],
            ['Time', time],
            ['Payment', isPaid ? 'Paid – $5' : 'Free session'],
            ['Reference', reference]
          ].map(([k, v]) => `
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:8px;color:#666;font-size:13px;">${k}</td>
              <td style="padding:8px;font-weight:600;font-size:13px;">${v}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
  }).catch(e => console.error('[Bookings] Admin notification error:', e.message));
}

// ─── Save booking to Supabase (if available) ──────────────────────────────────

async function saveBookingToDb(bookingData) {
  try {
    const supabase = databaseService.getClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('consultation_bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('[Bookings] DB insert error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Bookings] DB exception:', err.message);
    return null;
  }
}

// ─── Route: POST /api/bookings  (free booking) ────────────────────────────────

router.post('/', async (req, res) => {
  console.log('📅 [Bookings] POST / handler called');
  console.log('📅 [Bookings] Request method:', req.method);
  console.log('📅 [Bookings] Request path:', req.path);
  console.log('📅 [Bookings] Request body:', req.body);
  console.log('📅 [Bookings] Content-Type:', req.headers['content-type']);
  
  const { service, consultation_type, date, time, name, email, phone, notes, amount } = req.body;

  if (!service || !consultation_type || !date || !time || !name || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const isPaid = amount > 0;

  // Free sessions: only allow free_30 type here
  if (isPaid) {
    return res.status(400).json({
      success: false,
      error: 'Use the payment endpoint for paid consultations'
    });
  }

  const reference = genRef();

  const bookingData = {
    reference,
    service,
    consultation_type,
    date,
    time,
    name,
    email,
    phone: phone || null,
    notes: notes || null,
    amount: 0,
    currency: 'USD',
    status: 'confirmed',
    payment_status: 'free',
    created_at: new Date().toISOString()
  };

  await saveBookingToDb(bookingData);

  // Fire-and-forget emails
  sendConfirmationEmail({ name, email, service, consultationType: consultation_type, date, time, reference, isPaid: false })
    .catch(e => console.error(e));
  sendAdminNotification({ name, email, phone, service, consultationType: consultation_type, date, time, reference, isPaid: false })
    .catch(e => console.error(e));

  return res.json({ success: true, reference, message: 'Booking confirmed!' });
});

// ─── Route: POST /api/bookings/initialize-payment  ────────────────────────────

router.post('/initialize-payment', async (req, res) => {
  const { service, consultation_type, date, time, name, email, phone, notes } = req.body;

  if (!service || !consultation_type || !date || !time || !name || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const amountUsd = 5;
  const KES_RATE = 150;
  const amountKobo = Math.round(amountUsd * KES_RATE * 100); // in kobo

  const reference = genRef();

  // Store pending booking in DB
  const bookingData = {
    reference,
    service,
    consultation_type,
    date,
    time,
    name,
    email,
    phone: phone || null,
    notes: notes || null,
    amount: amountUsd,
    currency: 'USD',
    status: 'pending',
    payment_status: 'pending',
    created_at: new Date().toISOString()
  };

  await saveBookingToDb(bookingData);

  // Initialize Paystack transaction
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl.replace(/\/$/, '')}/booking-callback`;

    const psResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountKobo,
        currency: 'KES',
        reference,
        callback_url: callbackUrl,
        metadata: {
          booking_reference: reference,
          service,
          consultation_type,
          name,
          phone: phone || '',
          date,
          time,
          custom_fields: [
            { display_name: 'Booking Reference', variable_name: 'booking_ref', value: reference },
            { display_name: 'Service', variable_name: 'service', value: service },
            { display_name: 'Date', variable_name: 'date', value: date },
            { display_name: 'Time', variable_name: 'time', value: time }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!psResponse.data.status) {
      return res.status(500).json({ success: false, error: psResponse.data.message || 'Paystack error' });
    }

    return res.json({
      success: true,
      reference,
      authorization_url: psResponse.data.data.authorization_url,
      access_code: psResponse.data.data.access_code,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
    });

  } catch (err) {
    console.error('[Bookings] Paystack init error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message || 'Payment initialization failed'
    });
  }
});

// ─── Route: POST /api/bookings/verify-payment/:reference ──────────────────────

router.post('/verify-payment/:reference', async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res.status(400).json({ success: false, error: 'Reference required' });
  }

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return res.status(500).json({ success: false, error: 'Payment gateway not configured' });
    }

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );

    const txData = verifyRes.data.data;

    if (!verifyRes.data.status || txData.status !== 'success') {
      return res.status(400).json({ success: false, error: 'Payment not successful' });
    }

    // Extract booking details from metadata
    const meta = txData.metadata || {};
    const { service, consultation_type, name, phone, date, time } = meta;
    const email = txData.customer.email;

    // Update booking in DB
    try {
      const supabase = databaseService.getClient();
      if (supabase) {
        await supabase
          .from('consultation_bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            paystack_payment_id: txData.id,
            updated_at: new Date().toISOString()
          })
          .eq('reference', reference);
      }
    } catch (dbErr) {
      console.error('[Bookings] DB update error:', dbErr.message);
    }

    // Send confirmation emails
    sendConfirmationEmail({
      name: name || 'Customer',
      email,
      service: service || 'other',
      consultationType: consultation_type || 'paid_90',
      date: date || 'TBD',
      time: time || 'TBD',
      reference,
      isPaid: true
    }).catch(e => console.error(e));

    sendAdminNotification({
      name: name || 'Customer',
      email,
      phone: phone || '',
      service: service || 'other',
      consultationType: consultation_type || 'paid_90',
      date: date || 'TBD',
      time: time || 'TBD',
      reference,
      isPaid: true
    }).catch(e => console.error(e));

    return res.json({
      success: true,
      reference,
      message: 'Payment verified and booking confirmed!'
    });

  } catch (err) {
    console.error('[Bookings] Verify error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.message || err.message || 'Verification failed'
    });
  }
});

// ─── Route: GET /api/bookings/public-key  ─────────────────────────────────────

router.get('/public-key', (req, res) => {
  res.json({ success: true, publicKey: process.env.PAYSTACK_PUBLIC_KEY || '' });
});

// ─── Route: GET /api/bookings/test  ───────────────────────────────────────────

router.get('/test', (req, res) => {
  console.log('📅 [Bookings] Test endpoint hit');
  res.json({ 
    success: true, 
    message: 'Booking routes are working!',
    timestamp: new Date().toISOString()
  });
});

console.log('📅 [Bookings] All routes registered on router');
console.log('📅 [Bookings] Router stack length:', router.stack ? router.stack.length : 'N/A');

module.exports = router;

/**
 * routes/bookings.js
 * Consultation booking system – supports guide delivery ($7) and paid mentorship ($7).
 * Payment is handled via Paystack (existing infrastructure).
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const databaseService = require('../services/databaseService');

// Use SendGrid for reliable email delivery
const sgMail = require('@sendgrid/mail');
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 [Bookings] SendGrid configured');
} else {
  console.warn('⚠️  [Bookings] SendGrid API key not found - emails will not be sent');
}

console.log('📅 [Bookings] Route file loaded');
console.log('📅 [Bookings] Router object created:', typeof router);

// ─── Route: GET /api/bookings/available-slots ─────────────────────────────────

router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date parameter required' });
    }

    const supabase = databaseService.getClient();
    if (!supabase) {
      // If no database, return all slots as available
      return res.json({ success: true, bookedSlots: [] });
    }

    // Get all bookings for this date
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('time')
      .eq('date', date)
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('[Bookings] Error fetching slots:', error);
      return res.json({ success: true, bookedSlots: [] });
    }

    // Extract booked time slots
    const bookedSlots = data.map(booking => booking.time);
    
    console.log(`[Bookings] Date ${date}: ${bookedSlots.length} slots booked`);
    return res.json({ success: true, bookedSlots });
    
  } catch (err) {
    console.error('[Bookings] Available slots error:', err);
    return res.json({ success: true, bookedSlots: [] });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genRef() {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `BOOK-${ts}-${rand}`;
}

async function sendConfirmationEmail({ name, email, service, consultationType, date, time, reference, isPaid, guideTopic }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Bookings] SendGrid not configured – skipping confirmation email');
    return { success: false, reason: 'not_configured' };
  }

  const serviceLabels = {
    algo_development: 'Algo Development',
    stock_trading: 'Stock Trading',
    forex_trading: 'Forex Trading',
    web_development: 'Web Development',
    other: 'Other Service'
  };

  const serviceLabel = serviceLabels[service] || service;
  const isGuide = consultationType === 'guide_delivery';
  
  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#0f172a;margin:0;padding:0;">
      <div style="max-width:580px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">✓ Payment Confirmed</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">${isGuide ? 'Your guide is being prepared' : 'Your mentorship session is scheduled'}</p>
        </div>
        <div style="padding:36px;">
          <p style="color:#94a3b8;font-size:16px;margin-top:0;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
          <p style="color:#64748b;font-size:15px;line-height:1.6;">
            ${isGuide 
              ? `Thank you for your purchase! Your personalized trading guide on <strong>${guideTopic}</strong> is being prepared and will be delivered to your email within 24 hours.`
              : `Your mentorship session has been successfully booked. Here are your details:`
            }
          </p>

          <div style="background:#0f172a;border-radius:12px;padding:20px;margin:24px 0;border:1px solid rgba(255,255,255,0.08);">
            ${isGuide 
              ? `
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Guide Topic</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${guideTopic}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Amount Paid</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">$7.00</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                  <span style="color:#64748b;font-size:13px;">Reference</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${reference}</span>
                </div>
              `
              : `
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Service</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${serviceLabel}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Session Type</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">Premium 1-on-1 Mentorship</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Date</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <span style="color:#64748b;font-size:13px;">Time</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${time}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;">
                  <span style="color:#64748b;font-size:13px;">Reference</span>
                  <span style="color:#e2e8f0;font-weight:600;font-size:13px;">${reference}</span>
                </div>
              `
            }
          </div>

          <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="color:#818cf8;font-size:14px;margin:0;line-height:1.5;">
              ${isGuide 
                ? '📖 Your guide will include actionable strategies, real market examples, and step-by-step instructions tailored to your level.'
                : '📅 We will reach out to confirm the meeting link before your session. If you need to reschedule, please reply to this email with your reference number.'
              }
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

    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_USER || 'softwarebazaar.ke@gmail.com',
        name: 'Smart Algos'
      },
      subject: isGuide 
        ? `✅ Guide Ready – ${guideTopic} Trading Guide`
        : `✅ Mentorship Booked – ${serviceLabel} on ${date}`,
      html: html
    };

    await sgMail.send(msg);
    console.log(`[Bookings] ✅ Confirmation email sent to ${email} via SendGrid`);
    return { success: true };
  } catch (err) {
    console.error('[Bookings] SendGrid error:', err.message);
    if (err.response) {
      console.error('[Bookings] SendGrid response:', err.response.body);
    }
    return { success: false, reason: err.message };
  }
}

async function sendAdminNotification({ name, email, phone, service, consultationType, date, time, reference, isPaid, guideTopic }) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'softwarebazaar.ke@gmail.com';
  const fromEmail = process.env.EMAIL_USER || 'softwarebazaar.ke@gmail.com';

  console.log(`[Bookings] 📨 Sending admin notification to: ${adminEmail}`);
  console.log(`[Bookings] 📨 SendGrid configured: ${!!process.env.SENDGRID_API_KEY}`);

  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Bookings] ⚠️  SENDGRID_API_KEY not set – admin notification skipped! Set ADMIN_EMAIL and SENDGRID_API_KEY in Railway env vars.');
    return { success: false, reason: 'not_configured' };
  }

  const serviceLabels = {
    algo_development: 'Algo Development',
    stock_trading: 'Stock Trading',
    forex_trading: 'Forex Trading',
    web_development: 'Web Development',
    other: 'Other Service'
  };

  const isGuide = consultationType === 'guide_delivery';

  try {
    const msg = {
      to: adminEmail,
      from: {
        email: fromEmail,
        name: 'Smart Algos Bookings'
      },
      subject: isGuide 
        ? `📖 New Guide Purchase: ${name} – ${guideTopic}`
        : `📅 New Mentorship Booking: ${name} – ${date} ${time}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:8px;">
          <h2 style="color:#4f46e5;margin-top:0;">${isGuide ? '📖 New Guide Purchase' : '📅 New Mentorship Booking'}</h2>
          <p style="color:#374151;margin-bottom:16px;">${isGuide ? 'Someone just purchased a trading guide.' : 'Someone just booked a mentorship session.'} Details below:</p>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;">
            ${isGuide
              ? `
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;width:35%;">Name</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Email</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${email}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Phone</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${phone || 'Not provided'}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Guide Topic</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${guideTopic}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Amount</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">$7.00</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Reference</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Status</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#10b981;">✅ Paid</td>
                </tr>
              `
              : `
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;width:35%;">Name</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Email</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${email}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Phone</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${phone || 'Not provided'}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Service</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${serviceLabels[service] || service}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Date</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${date}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Time</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${time}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0;">
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Amount</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">$7.00</td>
                </tr>
                <tr>
                  <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Reference</td>
                  <td style="padding:10px 12px;font-weight:600;font-size:13px;color:#111827;">${reference}</td>
                </tr>
              `
            }
          </table>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">Reply directly to the client at: <a href="mailto:${email}">${email}</a></p>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`[Bookings] ✅ Admin notification sent to ${adminEmail} via SendGrid`);
    return { success: true };
  } catch (e) {
    console.error('[Bookings] ❌ Admin notification error:', e.message);
    if (e.response) {
      console.error('[Bookings] SendGrid response body:', JSON.stringify(e.response.body));
    }
    console.error(`[Bookings] ⚠️  Admin was NOT notified about booking ${reference} from ${name} (${email})`);
    return { success: false, reason: e.message };
  }
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
  const { service, consultation_type, date, time, name, email, phone, notes, guideTopic } = req.body;

  if (!service || !consultation_type || !name || !email) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // For guide delivery, we don't need date/time
  if (consultation_type !== 'guide_delivery' && (!date || !time)) {
    return res.status(400).json({ success: false, error: 'Date and time required for mentorship' });
  }

  const amountUsd = 7;
  const KES_RATE = 150;
  const amountKobo = Math.round(amountUsd * KES_RATE * 100); // in kobo

  const reference = genRef();

  // Store pending booking in DB
  const bookingData = {
    reference,
    service,
    consultation_type,
    date: date || null,
    time: time || null,
    name,
    email,
    phone: phone || null,
    notes: notes || null,
    guide_topic: guideTopic || null,
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
          date: date || '',
          time: time || '',
          guide_topic: guideTopic || '',
          custom_fields: [
            { display_name: 'Booking Reference', variable_name: 'booking_ref', value: reference },
            { display_name: 'Type', variable_name: 'type', value: consultation_type === 'guide_delivery' ? 'Guide' : 'Mentorship' },
            { display_name: 'Topic/Service', variable_name: 'topic', value: guideTopic || service }
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
    const { service, consultation_type, name, phone, date, time, guide_topic } = meta;
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
      consultationType: consultation_type || 'paid_mentorship',
      date: date || 'TBD',
      time: time || 'TBD',
      reference,
      isPaid: true,
      guideTopic: guide_topic || ''
    }).catch(e => console.error(e));

    sendAdminNotification({
      name: name || 'Customer',
      email,
      phone: phone || '',
      service: service || 'other',
      consultationType: consultation_type || 'paid_mentorship',
      date: date || 'TBD',
      time: time || 'TBD',
      reference,
      isPaid: true,
      guideTopic: guide_topic || ''
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

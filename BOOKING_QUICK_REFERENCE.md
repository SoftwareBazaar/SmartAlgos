# 📅 Booking System - Quick Reference Card

## 🎯 System Overview

Your consultation booking system is **LIVE** on your landing page!

---

## 📍 Access Points

| Location | URL |
|----------|-----|
| Landing Page | `https://your-domain.com/` |
| Direct Link | `https://your-domain.com/#book-consultation` |
| Button | Hero section: "📅 Book Free Consultation" |

---

## 💰 Pricing

| Session Type | Duration | Price | When |
|--------------|----------|-------|------|
| Free Consultation | 30 min | FREE | First session |
| Deep-Dive | 1hr 30min | $5 | Follow-up sessions |

---

## 🕐 Availability

- **Days**: Every day (7 days/week)
- **Hours**: 7:00 AM - 3:00 PM
- **Slots**: 30-minute intervals

---

## 🛠️ Services Offered

1. **Algo Development** - Trading algorithms & EAs
2. **Stock Trading** - Equity markets & analysis
3. **Forex Trading** - Currency pairs & strategies
4. **Web Development** - Full-stack apps & APIs
5. **Other Services** - General tech consulting

---

## 🔑 Required Environment Variables

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
ADMIN_EMAIL=admin@smartalgos.com

# URLs
CLIENT_URL=https://your-domain.com
```

---

## 🗄️ Database

**Table**: `consultation_bookings`

**Setup**:
```bash
node scripts/setup-bookings-table.js
```

**View Bookings**:
```sql
SELECT * FROM consultation_bookings 
ORDER BY created_at DESC;
```

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings` | POST | Create free booking |
| `/api/bookings/initialize-payment` | POST | Start paid booking |
| `/api/bookings/verify-payment/:ref` | POST | Verify payment |
| `/api/bookings/public-key` | GET | Get Paystack key |

---

## 🧪 Test Cards (Paystack)

**Success**:
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failure**:
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `000000`

---

## 📧 Email Templates

### Customer Email
- ✅ Booking confirmation
- ✅ Service details
- ✅ Date & time
- ✅ Reference number
- ✅ Payment status

### Admin Email
- ✅ New booking alert
- ✅ Customer details
- ✅ Contact information
- ✅ Service requested

---

## 🎨 UI Components

**Location**: `client/src/components/BookingSection/BookingSection.js`

**Features**:
- 5-step wizard
- Progress indicator
- Date picker
- Time slot selector
- Form validation
- Payment integration
- Success animation

---

## 🔧 Customization

### Change Hours
```javascript
// Line ~100 in BookingSection.js
for (let h = 7; h < 15; h++) {  // 7 AM to 3 PM
```

### Change Price
```javascript
// Line ~70 in BookingSection.js
price: 5,  // Change to your price
priceLabel: '$5',  // Update label
```

### Add Service
```javascript
// Line ~30 in BookingSection.js
{
  id: 'new_service',
  label: 'New Service',
  icon: YourIcon,
  color: '#color',
  description: 'Description'
}
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| No emails | Check Gmail App Password |
| Payment fails | Verify Paystack keys |
| Not saving | Run database setup |
| No time slots | Check browser console |

---

## 📊 Monitoring

### View Recent Bookings
```sql
SELECT reference, name, email, service, date, time, status
FROM consultation_bookings
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Check Pending Payments
```sql
SELECT * FROM consultation_bookings
WHERE payment_status = 'pending';
```

### Today's Bookings
```sql
SELECT * FROM consultation_bookings
WHERE date = CURRENT_DATE
ORDER BY time;
```

---

## ✅ Pre-Launch Checklist

- [ ] Database table created
- [ ] Environment variables set
- [ ] Paystack configured
- [ ] Email configured
- [ ] Test free booking
- [ ] Test paid booking
- [ ] Verify emails sent
- [ ] Check mobile view
- [ ] Test on production

---

## 📱 Mobile Responsive

✅ Works on all devices:
- Desktop (1920px+)
- Laptop (1366px)
- Tablet (768px)
- Mobile (375px)

---

## 🔐 Security

- ✅ Input sanitization
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure payments
- ✅ RLS enabled
- ✅ Email validation

---

## 📈 Booking Flow

```
1. Select Service
   ↓
2. Choose Session Type (Free/Paid)
   ↓
3. Pick Date & Time
   ↓
4. Enter Contact Details
   ↓
5. Confirm & Pay (if paid)
   ↓
6. Success + Email Confirmation
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `routes/bookings.js` | Backend API |
| `client/src/components/BookingSection/` | Frontend UI |
| `database/create_consultation_bookings.sql` | Database schema |
| `scripts/setup-bookings-table.js` | Setup script |
| `services/emailService.js` | Email sending |

---

## 💡 Pro Tips

1. **Test locally first** before deploying
2. **Use test cards** for Paystack testing
3. **Monitor emails** to ensure delivery
4. **Check database** regularly for bookings
5. **Set calendar reminders** for consultations
6. **Respond promptly** to booking emails

---

## 🚀 Quick Start Commands

```bash
# Setup database
node scripts/setup-bookings-table.js

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Railway
railway up

# Deploy to Vercel
vercel --prod
```

---

## 📞 Support Resources

- **Full Guide**: `BOOKING_SYSTEM_COMPLETE_GUIDE.md`
- **Setup Checklist**: `BOOKING_SETUP_CHECKLIST.md`
- **API Routes**: `routes/bookings.js`
- **Component**: `client/src/components/BookingSection/`

---

## ✨ Features Summary

✅ Free & paid consultations  
✅ 5 service categories  
✅ Daily availability (7 AM - 3 PM)  
✅ Paystack integration  
✅ Email notifications  
✅ Mobile responsive  
✅ Beautiful UI/UX  
✅ Secure & scalable  

---

**Status**: Production Ready ✅  
**Version**: 1.0.0  
**Last Updated**: January 2025

---

**Need help?** Check the full guide or test locally first!

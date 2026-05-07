import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaystackPayment } from 'react-paystack';
import {
  Calendar,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

// AI-generated image URLs from Unsplash (free, no attribution required for UI use)
const SERVICE_IMAGES = {
  algo_development: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=80&fit=crop&auto=format',
  stock_trading:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&h=80&fit=crop&auto=format',
  forex_trading:    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=80&h=80&fit=crop&auto=format',
  web_development:  'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=80&h=80&fit=crop&auto=format',
  other:            'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=80&h=80&fit=crop&auto=format',
};

const SERVICES = [
  {
    id: 'algo_development',
    label: 'Algo Development',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    description: 'Build profitable automated trading bots & Expert Advisors. Learn to trade like a pro with algorithmic strategies that work 24/7.'
  },
  {
    id: 'stock_trading',
    label: 'Stock Trading',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    description: 'Master stock market investing, NSE & global equities. Proven strategies to grow your portfolio and beat the market consistently.'
  },
  {
    id: 'forex_trading',
    label: 'Forex Trading',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    description: 'Unlock forex profits with expert price action, risk management & funded account strategies. Trade smarter, not harder.'
  },
  {
    id: 'web_development',
    label: 'Web Development',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    description: 'Launch high-converting fintech apps, trading dashboards & SaaS platforms. Full-stack solutions that scale with your business.'
  },
  {
    id: 'other',
    label: 'Other Service',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    description: 'Custom tech consulting, automation & digital transformation. Turn your ideas into revenue-generating products fast.'
  }
];

const CONSULTATION_TYPES = [
  {
    id: 'free_guide_preview',
    label: 'Free Guide Preview',
    duration: 'Instant',
    price: 0,
    priceLabel: 'FREE',
    badge: 'Get Started',
    description: 'Get a preview of your personalized trading guide with key insights, roadmap, and sample strategies. See what\'s included before upgrading.',
    color: '#34d399',
    gradient: 'linear-gradient(135deg,rgba(52,211,153,0.15),rgba(52,211,153,0.05))',
    features: [
      '📖 Preview guide (3-5 pages)',
      '🗺️ Complete roadmap included',
      '📊 Sample market examples',
      '✨ Teaser of full strategies',
      '⬆️ Upgrade to full guide anytime'
    ]
  },
  {
    id: 'full_guide_delivery',
    label: 'Full Expert Trading Guide',
    duration: 'Instant Delivery',
    price: 7,
    priceLabel: '$7',
    badge: 'Complete Access',
    description: 'Get the COMPLETE personalized trading guide with all strategies, detailed charts, step-by-step action plans, and everything you need to succeed.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))',
    features: [
      '📖 Complete guide (15-25 pages)',
      '📊 All market examples & charts',
      '✅ Full step-by-step action plan',
      '🎯 Advanced strategies included',
      '💬 Priority follow-up support'
    ]
  },
  {
    id: 'paid_mentorship',
    label: 'Premium 1-on-1 Mentorship',
    duration: '1hr 30 min',
    price: 7,
    priceLabel: '$7',
    badge: 'Deep Dive',
    description: 'Live 1-on-1 session for personalized guidance, live chart analysis, strategy review, and direct answers to your questions.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))',
    features: [
      '🎥 Live 1-on-1 video call',
      '📈 Real-time chart analysis',
      '💡 Personalized strategy review',
      '🔧 EA setup & troubleshooting',
      '📞 Direct expert guidance'
    ]
  }
];

// Generate next 14 days — available every day Mon–Sun
function generateAvailableDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

// Build time slots 7 PM – 9 PM EAT (East Africa Time = UTC+3)
// Slots: 19:00, 19:30, 20:00, 20:30, 21:00
function buildTimeSlots() {
  const slots = [];
  for (let h = 19; h <= 21; h++) {
    const minutes = h === 21 ? [0] : [0, 30]; // 9:00 PM is last slot
    for (const m of minutes) {
      const hour12 = h - 12;
      const label = `${hour12}:${m === 0 ? '00' : m} PM (EAT)`;
      slots.push({ value: `${String(h).padStart(2,'0')}:${m === 0 ? '00' : m}`, label });
    }
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();
const AVAILABLE_DATES = generateAvailableDates();

// Day & Month helpers
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(d) {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// ─── PaystackWrapper ──────────────────────────────────────────────────────────

function PaystackWrapper({ config, onSuccess, onClose, trigger }) {
  // Add callbacks to config
  const configWithCallbacks = {
    ...config,
    onSuccess: onSuccess,
    onClose: onClose
  };
  
  const initializePayment = usePaystackPayment(configWithCallbacks);

  useEffect(() => {
    if (trigger && initializePayment) {
      initializePayment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const BookingSection = () => {
  // Step: 0=service, 1=type, 2=datetime, 3=details, 4=confirm/pay, 5=success
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);
  // Paystack trigger
  const [paystackConfig, setPaystackConfig] = useState(null);
  const [paystackTrigger, setPaystackTrigger] = useState(false);
  const sectionRef = useRef(null);
  // Booked slots for selected date
  const [bookedSlots, setBookedSlots] = useState([]);

  const DATES_PER_PAGE = 5;
  const visibleDates = AVAILABLE_DATES.slice(dateOffset, dateOffset + DATES_PER_PAGE);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
        if (!dateStr) return;
        
        const res = await fetch(`/api/bookings/available-slots?date=${dateStr}`);
        const data = await res.json();
        if (data.success) {
          setBookedSlots(data.bookedSlots || []);
          console.log(`[Booking] ${data.bookedSlots.length} slots booked for ${dateStr}`);
        }
      } catch (err) {
        console.error('[Booking] Error fetching booked slots:', err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDate]);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateDetails = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Valid email is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 3 && !validateDetails()) return;
    
    // Skip date/time for guide delivery (both free preview and full)
    if (step === 1 && (selectedType?.id === 'free_guide_preview' || selectedType?.id === 'full_guide_delivery')) {
      setStep(3);
    } else {
      setStep(s => s + 1);
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBack = () => {
    setStep(s => s - 1);
    setError(null);
  };

  // Confirm free booking (for mentorship only - guides use initiatePaidBooking)
  const confirmFreeBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService.id,
          consultation_type: selectedType.id,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
          time: selectedTime?.value,
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          amount: 0
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Booking failed');
      setBookingRef(data.reference);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Initiate paid booking via Paystack
  const initiatePaidBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const isGuide = selectedType.id === 'free_guide_preview' || selectedType.id === 'full_guide_delivery';
      const isFreePreview = selectedType.id === 'free_guide_preview';
      
      const res = await fetch('/api/bookings/initialize-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: selectedService.id,
          consultation_type: selectedType.id,
          date: isGuide ? null : (selectedDate ? selectedDate.toISOString().split('T')[0] : null),
          time: isGuide ? null : selectedTime?.value,
          name: form.name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          guideTopic: isGuide ? selectedTime?.label : null,
          isFreePreview: isFreePreview
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Could not initialize payment');

      // For free preview, skip Paystack and go straight to success
      if (isFreePreview) {
        setBookingRef(data.reference);
        setStep(5);
        return;
      }

      // Build paystack config for paid packages
      const key = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || data.publicKey || '';
      setPaystackConfig({
        reference: data.reference,
        email: form.email,
        amount: 700 * 150, // $7 × 150 KES/USD × 100 kobo = 105000 kobo
        publicKey: key,
        currency: 'KES',
        metadata: {
          booking_reference: data.reference,
          service: selectedService.id,
          consultation_type: selectedType.id,
          custom_fields: isGuide
            ? [
                { display_name: 'Type', variable_name: 'type', value: 'Full Guide' },
                { display_name: 'Topic', variable_name: 'topic', value: selectedTime.label }
              ]
            : [
                { display_name: 'Type', variable_name: 'type', value: 'Mentorship' },
                { display_name: 'Service', variable_name: 'service', value: selectedService.label },
                { display_name: 'Date', variable_name: 'date', value: selectedDate ? selectedDate.toISOString().split('T')[0] : 'TBD' },
                { display_name: 'Time', variable_name: 'time', value: selectedTime?.label }
              ]
        }
      });

      // Trigger popup after state settles
      setTimeout(() => setPaystackTrigger(t => !t), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onPaystackSuccess = async (ref) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/verify-payment/${ref.reference}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Verification failed');
      setBookingRef(data.reference);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onPaystackClose = () => {
    // User closed paystack popup without completing payment
    setError('Payment was cancelled. Please try again.');
  };

  // ── Step Renders ────────────────────────────────────────────────────────────

  const steps = [
    { label: 'Service', icon: Star },
    { label: 'Session', icon: Clock },
    { label: 'Date & Time', icon: Calendar },
    { label: 'Details', icon: User },
    { label: 'Confirm', icon: CheckCircle }
  ];

  return (
    <section
      ref={sectionRef}
      id="book-consultation"
      style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        {/* Grid dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px', padding: '6px 18px', marginBottom: '20px'
          }}>
            <Calendar style={{ width: 14, height: 14, color: '#818cf8' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8', letterSpacing: '0.05em' }}>
              BOOK A CONSULTATION
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: '16px'
          }}>
            Master Trading with Expert{' '}
            <span style={{
              backgroundImage: 'linear-gradient(90deg, #818cf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Guides & Mentorship
            </span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '17px', maxWidth: '560px', margin: '0 auto' }}>
            Start free with a guide preview. See the roadmap and sample strategies. Then upgrade to the full guide for just <strong style={{ color: '#34d399' }}>$7</strong> to unlock everything.
          </p>
        </motion.div>

        {/* Progress stepper — hidden on success */}
        {step < 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '0', marginBottom: '40px', flexWrap: 'wrap'
            }}
          >
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? '#10b981' : active ? '#6366f1' : 'rgba(255,255,255,0.07)',
                      border: `2px solid ${done ? '#10b981' : active ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      transition: 'all 0.3s ease'
                    }}>
                      {done
                        ? <CheckCircle style={{ width: 16, height: 16, color: '#fff' }} />
                        : <Icon style={{ width: 15, height: 15, color: active ? '#fff' : '#64748b' }} />
                      }
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      color: active ? '#818cf8' : done ? '#34d399' : '#475569',
                      letterSpacing: '0.03em'
                    }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, minWidth: '24px', maxWidth: '60px',
                      background: done ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.08)',
                      margin: '0 4px', marginBottom: '24px',
                      transition: 'background 0.3s ease'
                    }} />
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}

        {/* Card container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: 'clamp(24px, 5vw, 48px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
          }}
        >

          {/* ── STEP 0: Choose service ── */}
          {step === 0 && (
            <div>
              <StepTitle icon={Star} label="What can we help you with?" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', marginTop: '24px' }}>
                {SERVICES.map(svc => {
                  const selected = selectedService?.id === svc.id;
                  return (
                    <motion.button
                      key={svc.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedService(svc); }}
                      style={{
                        textAlign: 'left', padding: '18px 20px',
                        borderRadius: '16px', cursor: 'pointer',
                        background: selected ? svc.bg : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${selected ? svc.color : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.2s ease', position: 'relative'
                      }}
                    >
                      {selected && (
                        <div style={{
                          position: 'absolute', top: 12, right: 12,
                          width: 20, height: 20, borderRadius: '50%',
                          background: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <CheckCircle style={{ width: 12, height: 12, color: '#fff' }} />
                        </div>
                      )}
                      <div style={{
                        width: 48, height: 48, borderRadius: '12px',
                        overflow: 'hidden',
                        border: `2px solid ${selected ? svc.color : 'rgba(255,255,255,0.1)'}`,
                        marginBottom: '12px', flexShrink: 0
                      }}>
                        <img
                          src={SERVICE_IMAGES[svc.id]}
                          alt={svc.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '15px', marginBottom: '6px' }}>
                        {svc.label}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                        {svc.description}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              <NavigationRow
                onNext={handleNext}
                nextDisabled={!selectedService}
                showBack={false}
              />
            </div>
          )}

          {/* ── STEP 1: Consultation type ── */}
          {step === 1 && (
            <div>
              <StepTitle icon={Clock} label="Choose your package" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px', marginTop: '24px' }}>
                {CONSULTATION_TYPES.map(ct => {
                  const selected = selectedType?.id === ct.id;
                  return (
                    <motion.button
                      key={ct.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(ct)}
                      style={{
                        textAlign: 'left', padding: '28px',
                        borderRadius: '20px', cursor: 'pointer',
                        background: selected ? ct.gradient : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${selected ? ct.color : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.25s ease', position: 'relative',
                        boxShadow: selected ? `0 0 30px ${ct.color}33` : 'none'
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 16, right: 16,
                        background: `${ct.color}22`, border: `1px solid ${ct.color}44`,
                        borderRadius: '8px', padding: '4px 12px',
                        fontSize: '11px', fontWeight: 700, color: ct.color, letterSpacing: '0.05em'
                      }}>
                        {ct.badge}
                      </span>
                      <div style={{ fontSize: '32px', fontWeight: 900, color: ct.color, marginBottom: '2px' }}>
                        {ct.priceLabel}
                      </div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '18px', marginBottom: '8px' }}>
                        {ct.label}
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        color: '#94a3b8', fontSize: '13px', marginBottom: '16px'
                      }}>
                        <Clock style={{ width: 13, height: 13 }} />
                        {ct.duration}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
                        {ct.description}
                      </div>
                      
                      {/* Features list */}
                      <div style={{ borderTop: `1px solid ${ct.color}22`, paddingTop: '16px' }}>
                        {ct.features.map((feature, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            marginBottom: idx < ct.features.length - 1 ? '10px' : '0',
                            fontSize: '13px', color: '#cbd5e1'
                          }}>
                            <span style={{ minWidth: '20px', color: ct.color }}>{feature.split(' ')[0]}</span>
                            <span>{feature.substring(feature.indexOf(' ') + 1)}</span>
                          </div>
                        ))}
                      </div>

                      {selected && (
                        <div style={{
                          position: 'absolute', top: 12, left: 12,
                          width: 24, height: 24, borderRadius: '50%',
                          background: ct.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <NavigationRow onNext={handleNext} onBack={handleBack} nextDisabled={!selectedType} />
            </div>
          )}

          {/* ── STEP 2: Guide Topic or Date & Time ── */}
          {step === 2 && (
            <div>
              {selectedType?.id === 'free_guide_preview' || selectedType?.id === 'full_guide_delivery' ? (
                // Guide topic selection
                <>
                  <StepTitle icon={Star} label="What topic would you like a guide on?" />
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
                    Choose a trading topic and we'll create a personalized guide for you
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '24px' }}>
                    {SERVICES.map(svc => {
                      const isSelected = selectedTime?.value === svc.id; // Reuse selectedTime for topic
                      return (
                        <motion.button
                          key={svc.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTime({ value: svc.id, label: svc.label })}
                          style={{
                            padding: '16px 18px',
                            borderRadius: '14px', cursor: 'pointer',
                            background: isSelected ? svc.bg : 'rgba(255,255,255,0.03)',
                            border: `1.5px solid ${isSelected ? svc.color : 'rgba(255,255,255,0.08)'}`,
                            transition: 'all 0.2s ease', position: 'relative',
                            textAlign: 'left'
                          }}
                        >
                          {isSelected && (
                            <div style={{
                              position: 'absolute', top: 10, right: 10,
                              width: 18, height: 18, borderRadius: '50%',
                              background: svc.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <CheckCircle style={{ width: 11, height: 11, color: '#fff' }} />
                            </div>
                          )}
                          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px', marginBottom: '4px' }}>
                            {svc.label}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>
                            {svc.description.substring(0, 50)}...
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <NavigationRow onNext={handleNext} onBack={handleBack} nextDisabled={!selectedTime} />
                </>
              ) : (
                // Date & Time selection for mentorship
                <>
                  <StepTitle icon={Calendar} label="Pick a date and time" />
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
                    Available every day · 7:00 PM – 9:00 PM (East Africa Time)
                  </p>

                  {/* Date picker */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '13px' }}>SELECT DATE</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ArrowButton dir="left" onClick={() => setDateOffset(o => Math.max(0, o - DATES_PER_PAGE))} disabled={dateOffset === 0} />
                        <ArrowButton dir="right" onClick={() => setDateOffset(o => Math.min(AVAILABLE_DATES.length - DATES_PER_PAGE, o + DATES_PER_PAGE))} disabled={dateOffset + DATES_PER_PAGE >= AVAILABLE_DATES.length} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {visibleDates.map((d, i) => {
                        const sel = selectedDate?.toDateString() === d.toDateString();
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSelectedDate(d)}
                            style={{
                              flex: '1', minWidth: '80px',
                              padding: '14px 10px', borderRadius: '14px', cursor: 'pointer',
                              background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                              border: `1.5px solid ${sel ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                              textAlign: 'center', transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontSize: '11px', fontWeight: 600, color: sel ? '#818cf8' : '#64748b', marginBottom: '4px' }}>
                              {DAYS[d.getDay()]}
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: sel ? '#e0e7ff' : '#94a3b8' }}>
                              {d.getDate()}
                            </div>
                            <div style={{ fontSize: '11px', color: sel ? '#818cf8' : '#475569', marginTop: '2px' }}>
                              {MONTHS[d.getMonth()]}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time picker */}
                  <div>
                    <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                      SELECT TIME
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {TIME_SLOTS.map((ts, i) => {
                        const sel = selectedTime?.value === ts.value;
                        const isBooked = bookedSlots.includes(ts.value);
                        
                        // Don't render booked slots
                        if (isBooked) return null;
                        
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTime(ts)}
                            style={{
                              padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
                              background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                              border: `1.5px solid ${sel ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                              color: sel ? '#e0e7ff' : '#64748b',
                              fontWeight: sel ? 700 : 500, fontSize: '13px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {ts.label}
                          </motion.button>
                        );
                      })}
                      {bookedSlots.length > 0 && (
                        <div style={{ width: '100%', marginTop: '8px', padding: '8px 12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '8px' }}>
                          <p style={{ color: '#fbbf24', fontSize: '12px', margin: 0 }}>
                            ⚠️ {bookedSlots.length} slot{bookedSlots.length > 1 ? 's' : ''} already booked for this date
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <NavigationRow onNext={handleNext} onBack={handleBack} nextDisabled={!selectedDate || !selectedTime} />
                </>
              )}
            </div>
          )}

          {/* ── STEP 3: Contact details ── */}
          {step === 3 && (
            <div>
              <StepTitle icon={User} label="Your contact details" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px', marginTop: '24px' }}>
                <FormField
                  icon={User} label="Full Name" id="name"
                  value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))}
                  error={formErrors.name} placeholder="John Doe"
                />
                <FormField
                  icon={Mail} label="Email Address" id="email" type="email"
                  value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
                  error={formErrors.email} placeholder="john@example.com"
                />
                <FormField
                  icon={Phone} label="Phone (optional)" id="phone"
                  value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))}
                  placeholder="+254 700 000 000"
                />
                <FormField
                  icon={MessageSquare} label="Notes (optional)" id="notes"
                  value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))}
                  placeholder="Tell us a bit about what you need..."
                  multiline
                />
              </div>
              <NavigationRow onNext={handleNext} onBack={handleBack} />
            </div>
          )}

          {/* ── STEP 4: Confirm & Pay ── */}
          {step === 4 && (
            <div>
              <StepTitle icon={CheckCircle} label="Confirm your booking" />

              {/* Summary card */}
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '24px', marginTop: '24px'
              }}>
                <SummaryRow label="Service" value={selectedService?.label} color={selectedService?.color} />
                <SummaryRow label="Package" value={`${selectedType?.label} — ${selectedType?.duration}`} />
                {selectedType?.id === 'free_guide_preview' || selectedType?.id === 'full_guide_delivery' ? (
                  <SummaryRow label="Guide Topic" value={selectedTime?.label} />
                ) : (
                  <>
                    <SummaryRow label="Date" value={selectedDate ? formatDate(selectedDate) : ''} />
                    <SummaryRow label="Time" value={selectedTime?.label} />
                  </>
                )}
                <SummaryRow label="Name" value={form.name} />
                <SummaryRow label="Email" value={form.email} />
                {form.phone && <SummaryRow label="Phone" value={form.phone} />}
                {form.notes && <SummaryRow label="Notes" value={form.notes} />}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Total</span>
                  <span style={{
                    fontSize: '24px', fontWeight: 900,
                    color: selectedType?.price === 0 ? '#34d399' : '#818cf8'
                  }}>
                    {selectedType?.priceLabel}
                  </span>
                </div>
              </div>

              {/* Pricing note */}
              <div style={{
                marginTop: '16px', padding: '12px 16px', borderRadius: '10px',
                background: selectedType?.id === 'free_guide_preview' ? 'rgba(52,211,153,0.08)' : 'rgba(99,102,241,0.08)',
                border: `1px solid ${selectedType?.id === 'free_guide_preview' ? 'rgba(52,211,153,0.2)' : 'rgba(99,102,241,0.2)'}`,
                display: 'flex', alignItems: 'flex-start', gap: '10px'
              }}>
                <AlertCircle style={{ width: 16, height: 16, color: selectedType?.id === 'free_guide_preview' ? '#34d399' : '#818cf8', marginTop: 2, flexShrink: 0 }} />
                <p style={{ color: selectedType?.id === 'free_guide_preview' ? '#34d399' : '#818cf8', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                  {selectedType?.id === 'free_guide_preview'
                    ? '🎁 Get a preview with roadmap and sample strategies. Upgrade to the full guide anytime for just $7!'
                    : selectedType?.id === 'full_guide_delivery'
                    ? '📖 Your complete guide will be delivered within 24 hours. Secure payment via Paystack.'
                    : '🎥 Secure payment via Paystack. Meeting link will be confirmed before your session.'}
                </p>
              </div>

              {error && (
                <div style={{
                  marginTop: '16px', padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <X style={{ width: 16, height: 16, color: '#f87171' }} />
                  <span style={{ color: '#f87171', fontSize: '13px' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  style={{
                    padding: '14px 24px', borderRadius: '12px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <ChevronLeft style={{ width: 18, height: 18 }} /> Back
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={initiatePaidBooking}
                  style={{
                    flex: 1, padding: '14px 28px', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading ? 'rgba(99,102,241,0.4)' : (
                      selectedType?.price === 0
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    ),
                    border: 'none', color: '#fff',
                    fontWeight: 700, fontSize: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: selectedType?.price === 0 ? '0 8px 24px rgba(16,185,129,0.3)' : '0 8px 24px rgba(99,102,241,0.35)'
                  }}
                >
                  {loading
                    ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Processing…</>
                    : selectedType?.price === 0
                      ? <><CheckCircle style={{ width: 18, height: 18 }} /> Book Free Session</>
                      : <><span>Pay $5 & Book</span></>
                  }
                </motion.button>
              </div>

              {/* Paystack popup wrapper */}
              {paystackConfig && paystackConfig.publicKey && (
                <PaystackWrapper
                  config={paystackConfig}
                  onSuccess={onPaystackSuccess}
                  onClose={onPaystackClose}
                  trigger={paystackTrigger}
                />
              )}
            </div>
          )}

          {/* ── STEP 5: Success ── */}
          {step === 5 && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: 0, duration: 0.6, delay: 0.2 }}
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px rgba(16,185,129,0.4)'
                }}
              >
                <CheckCircle style={{ width: 38, height: 38, color: '#fff' }} />
              </motion.div>

              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                Booking Confirmed! 🎉
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '420px', margin: '0 auto 28px' }}>
                Your consultation has been booked. A confirmation email has been sent to{' '}
                <strong style={{ color: '#e2e8f0' }}>{form.email}</strong>.
              </p>

              {bookingRef && (
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px', padding: '12px 24px', marginBottom: '28px'
                }}>
                  <span style={{ color: '#818cf8', fontSize: '13px' }}>Reference: </span>
                  <span style={{ color: '#e0e7ff', fontWeight: 700, fontFamily: 'monospace', fontSize: '14px' }}>
                    {bookingRef}
                  </span>
                </div>
              )}

              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '20px', maxWidth: '400px', margin: '0 auto 32px', textAlign: 'left'
              }}>
                <SummaryRow label="Service" value={selectedService?.label} color={selectedService?.color} />
                <SummaryRow label="Session" value={selectedType?.label} />
                <SummaryRow label="Date" value={selectedDate ? formatDate(selectedDate) : ''} />
                <SummaryRow label="Time" value={selectedTime?.label} />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setStep(0);
                  setSelectedService(null); setSelectedType(null);
                  setSelectedDate(null); setSelectedTime(null);
                  setForm({ name: '', email: '', phone: '', notes: '' });
                  setBookingRef(null); setError(null);
                }}
                style={{
                  padding: '14px 32px', borderRadius: '12px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e2e8f0', fontWeight: 600, fontSize: '15px'
                }}
              >
                Book Another Session
              </motion.button>
            </motion.div>
          )}

        </motion.div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepTitle = ({ icon: Icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
    <div style={{
      width: 40, height: 40, borderRadius: '10px',
      background: 'rgba(99,102,241,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon style={{ width: 20, height: 20, color: '#818cf8' }} />
    </div>
    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>{label}</h3>
  </div>
);

const NavigationRow = ({ onNext, onBack, nextDisabled, showBack = true }) => (
  <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
    {showBack && (
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onBack}
        style={{
          padding: '12px 22px', borderRadius: '12px', cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', fontWeight: 600, fontSize: '15px',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        <ChevronLeft style={{ width: 16, height: 16 }} /> Back
      </motion.button>
    )}
    <motion.button
      whileHover={{ scale: nextDisabled ? 1 : 1.03 }}
      whileTap={{ scale: nextDisabled ? 1 : 0.97 }}
      onClick={onNext}
      disabled={nextDisabled}
      style={{
        padding: '12px 28px', borderRadius: '12px',
        cursor: nextDisabled ? 'not-allowed' : 'pointer',
        background: nextDisabled ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
        border: 'none', color: nextDisabled ? '#64748b' : '#fff',
        fontWeight: 700, fontSize: '15px',
        display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: nextDisabled ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
        transition: 'all 0.2s'
      }}
    >
      Continue <ChevronRight style={{ width: 16, height: 16 }} />
    </motion.button>
  </div>
);

const ArrowButton = ({ dir, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 32, height: 32, borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: disabled ? '#374151' : '#94a3b8',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}
  >
    {dir === 'left'
      ? <ChevronLeft style={{ width: 16, height: 16 }} />
      : <ChevronRight style={{ width: 16, height: 16 }} />
    }
  </button>
);

const FormField = ({ icon: Icon, label, id, value, onChange, error, placeholder, type = 'text', multiline = false }) => (
  <div>
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
      <Icon style={{ width: 13, height: 13 }} /> {label}
    </label>
    {multiline ? (
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
          color: '#e2e8f0', fontSize: '14px', resize: 'vertical',
          outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
        }}
      />
    ) : (
      <input
        id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
          color: '#e2e8f0', fontSize: '14px',
          outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
        }}
      />
    )}
    {error && <span style={{ fontSize: '12px', color: '#f87171', marginTop: '4px', display: 'block' }}>{error}</span>}
  </div>
);

const SummaryRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '12px' }}>
    <span style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>{label}</span>
    <span style={{ color: color || '#e2e8f0', fontWeight: 600, fontSize: '14px', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
  </div>
);

export default BookingSection;

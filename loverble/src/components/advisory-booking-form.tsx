import { useCallback, useEffect, useState } from "react";
import { Loader2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  ADVISORY_PRODUCTS,
  formatSlotLabel,
  todayInEat,
  visitorTimeZone,
} from "@/lib/advisory-scheduling";
import {
  bookFreeConsultation,
  fetchAvailableSlots,
  reservePaidConsultation,
} from "@/lib/bookings-api";
import { checkoutCapitalPayment } from "@/lib/paystack";
import { formatUsd, PRICING } from "@/lib/pricing";

type Variant = "free" | "paid";

type Props = {
  /** Lock to one session type. Omit to show Free / Paid toggle. */
  variant?: Variant;
  className?: string;
  selectedService?: string;
  onServiceChange?: (id: string) => void;
};

function formatDateLong(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function AdvisoryBookingForm({
  variant,
  className = "",
  selectedService,
  onServiceChange,
}: Props) {
  const [sessionType, setSessionType] = useState<Variant>(variant ?? "free");
  const consultationType = sessionType === "free" ? "free_20" : "paid_90";
  const showToggle = !variant;
  const [internalService, setInternalService] = useState("");
  const service = selectedService !== undefined ? selectedService : internalService;
  const setService = (id: string) => {
    onServiceChange?.(id);
    if (selectedService === undefined) setInternalService(id);
  };
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userTimezone, setUserTimezone] = useState("");
  const [confirmed, setConfirmed] = useState<{ reference: string; free: boolean } | null>(null);

  useEffect(() => {
    setUserTimezone(visitorTimeZone());
  }, []);

  useEffect(() => {
    if (variant) setSessionType(variant);
  }, [variant]);

  const loadSlots = useCallback(async () => {
    if (!date) {
      setSlots([]);
      setTime("");
      return;
    }
    setLoadingSlots(true);
    try {
      const { slots: next } = await fetchAvailableSlots(date, consultationType);
      setSlots(next);
      setTime((prev) => {
        if (prev && next.some((s) => s.time === prev && s.available)) return prev;
        return "";
      });
    } catch (err) {
      toast.error((err as Error).message || "Could not load times");
      setSlots([]);
      setTime("");
    } finally {
      setLoadingSlots(false);
    }
  }, [date, consultationType]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const validate = () => {
    if (website.trim()) return "Could not submit form";
    if (!service) return "Select a topic";
    if (!name.trim()) return "Your name is required";
    if (!email.includes("@")) return "Enter a valid email";
    if (!date) return "Pick a date";
    if (!time) return "Pick an available time";
    if (!consent) return "Please confirm you understand this is not investment advice";
    return null;
  };

  const submitFree = async () => {
    const result = await bookFreeConsultation({
      service,
      consultation_type: "free_20",
      date,
      time,
      name: name.trim(),
      email: email.trim(),
      notes: notes.trim() || undefined,
    });
    if (result.emailsSent === false) {
      toast.warning("Booked — email not sent", {
        description: result.message || `Save your reference: ${result.reference}`,
      });
    } else {
      toast.success("Session booked", {
        description: result.message || "Check your email for the meeting link.",
      });
    }
    setConfirmed({ reference: result.reference || "pending-email", free: true });
    setNotes("");
  };

  const submitPaid = async () => {
    const reserved = await reservePaidConsultation({
      service,
      consultation_type: "paid_90",
      date,
      time,
      name: name.trim(),
      email: email.trim(),
      notes: notes.trim() || undefined,
    });

    await checkoutCapitalPayment(
      {
        email: email.trim(),
        product_type: "consultation",
        product_id: "consultation",
        amount_usd: PRICING.consultation,
        metadata: {
          booking_reference: reserved.reference,
          service,
          consultation_type: "paid_90",
          date,
          time,
          name: name.trim(),
        },
      },
      {
        onSuccess: (ref) => {
          window.location.href = `/payment-callback?reference=${encodeURIComponent(ref)}`;
        },
        onClose: () => toast.message("Payment cancelled — your slot hold may expire"),
      },
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSubmitting(true);
    try {
      if (sessionType === "free") await submitFree();
      else await submitPaid();
    } catch (err) {
      toast.error((err as Error).message || (sessionType === "paid" ? "Could not start payment" : "Booking failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus-visible:border-gold/60 focus-visible:ring-1 focus-visible:ring-gold/40";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block";

  if (confirmed) {
    return (
      <div className={`rounded-lg border border-gold/30 bg-gold/5 p-5 space-y-3 ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-gold">Booking confirmed</div>
        <p className="text-sm text-foreground">
          Reference <span className="font-mono text-gold">{confirmed.reference}</span>
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Check your email for the meeting link. Prep: one clear question, your market, and any constraints (capital,
          platform, time). To reschedule or cancel, reply to the confirmation email.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Add the invite to your calendar when it arrives</li>
          <li>Have a short notes doc open for the call</li>
          <li>This session is educational discussion — not investment advice</li>
        </ul>
        <button
          type="button"
          className="text-xs text-gold hover:underline cursor-pointer"
          onClick={() => setConfirmed(null)}
        >
          Book another session
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-3 ${className}`}>
      {/* Honeypot — leave empty */}
      <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden>
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {showToggle && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-background/60 border border-border">
          <button
            type="button"
            className={`py-2.5 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              sessionType === "free" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSessionType("free")}
          >
            Free 20-min intro
          </button>
          <button
            type="button"
            className={`py-2.5 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              sessionType === "paid" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setSessionType("paid")}
          >
            90-min deep-dive (launch {formatUsd(PRICING.consultation)})
          </button>
        </div>
      )}

      <div>
        <label className={labelClass}>What do you want to discuss?</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={inputClass}
          required
        >
          <option value="">Select a topic</option>
          {ADVISORY_PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            <Calendar className="inline h-3 w-3 mr-1 opacity-70" />
            Date
          </label>
          <input
            type="date"
            value={date}
            min={todayInEat()}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
            required
          />
          {date && (
            <p className="mt-1 text-[11px] text-muted-foreground">{formatDateLong(date)}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            <Clock className="inline h-3 w-3 mr-1 opacity-70" />
            Time slot
          </label>
          {!date ? (
            <div className={`${inputClass} text-muted-foreground`}>Select a date first</div>
          ) : loadingSlots ? (
            <div className={`${inputClass} flex items-center gap-2 text-muted-foreground`}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : (
            <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} required>
              <option value="">Select time</option>
              {slots.map((s) => (
                <option key={s.time} value={s.time} disabled={!s.available}>
                  {formatSlotLabel(s.time, date, userTimezone)}
                  {!s.available ? " — unavailable" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Desk window: 7:00–9:00 PM East Africa Time. Last free slot starts at 8:40 PM EAT.
        {userTimezone && (
          <> Showing times in <span className="text-foreground">{userTimezone}</span> with EAT in parentheses.</>
        )}
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={sessionType === "free" ? 3 : 2}
          placeholder={
            sessionType === "free"
              ? "Brief context — strategy idea, asset class, what you want from the call…"
              : "Follow-up goals after your free intro…"
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 rounded border-border"
          required
        />
        <span>
          I agree that Smart Algos Investment Solution Ltd may use my contact details to schedule this session, and I
          understand this is educational discussion — not investment advice and not a client advisory relationship.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting || loadingSlots || !time || !consent}
        className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 disabled:opacity-60 cursor-pointer bg-gold text-primary-foreground hover:bg-gold-soft outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {submitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {sessionType === "paid" ? "Redirecting to Paystack…" : "Booking…"}
          </>
        ) : sessionType === "free" ? (
          "Confirm free booking"
        ) : (
          `Pay securely — launch ${formatUsd(PRICING.consultation)}`
        )}
      </button>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Not investment advice.{" "}
        {sessionType === "paid"
          ? "Deep-dive: pay securely at confirmation via Paystack; we email the meeting link after payment verifies."
          : "Free intro: no payment — we send your meeting link by email."}
      </p>
    </form>
  );
}

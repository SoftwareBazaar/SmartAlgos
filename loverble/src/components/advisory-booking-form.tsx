import { useCallback, useEffect, useState } from "react";
import { Loader2, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

import {
  ADVISORY_PRODUCTS,
  formatSlotLabel,
  todayInEat,
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
  variant: Variant;
  className?: string;
};

export function AdvisoryBookingForm({ variant, className = "" }: Props) {
  const consultationType = variant === "free" ? "free_20" : "paid_90";
  const [service, setService] = useState(ADVISORY_PRODUCTS[0].id);
  const [date, setDate] = useState(todayInEat());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = useCallback(async () => {
    if (!date) return;
    setLoadingSlots(true);
    try {
      const { slots: next } = await fetchAvailableSlots(date, consultationType);
      setSlots(next);
      setTime((prev) => {
        if (prev && next.some((s) => s.time === prev && s.available)) return prev;
        return next.find((s) => s.available)?.time ?? "";
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
    if (!name.trim()) return "Your name is required";
    if (!email.includes("@")) return "Enter a valid email";
    if (!date) return "Pick a date";
    if (!time) return "Pick an available time (7–9 PM EAT)";
    return null;
  };

  const submitFree = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSubmitting(true);
    try {
      const result = await bookFreeConsultation({
        service,
        consultation_type: "free_20",
        date,
        time,
        name: name.trim(),
        email: email.trim(),
        notes: notes.trim() || undefined,
      });
      toast.success("Consultation booked", {
        description: result.message || "Check your email for the meeting link.",
      });
      setNotes("");
    } catch (err) {
      toast.error((err as Error).message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSubmitting(true);
    try {
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
    } catch (err) {
      toast.error((err as Error).message || "Could not start payment");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60";
  const labelClass = "text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block";

  return (
    <form onSubmit={variant === "free" ? submitFree : submitPaid} className={`flex flex-col gap-3 ${className}`}>
      <div>
        <label className={labelClass}>What do you want to discuss?</label>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className={inputClass}
          required
        >
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
        </div>
        <div>
          <label className={labelClass}>
            <Clock className="inline h-3 w-3 mr-1 opacity-70" />
            Time (7–9 PM EAT)
          </label>
          {loadingSlots ? (
            <div className={`${inputClass} flex items-center gap-2 text-muted-foreground`}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : (
            <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} required>
              <option value="">Select time</option>
              {slots.map((s) => (
                <option key={s.time} value={s.time} disabled={!s.available}>
                  {formatSlotLabel(s.time)}
                  {!s.available ? " — booked" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

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
          rows={variant === "free" ? 3 : 2}
          placeholder={
            variant === "free"
              ? "Brief context — strategy idea, asset class, what you want from the call…"
              : "Follow-up goals after your free intro…"
          }
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || loadingSlots || !time}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-60 ${
          variant === "free"
            ? "border border-gold/60 text-gold hover:bg-gold/10"
            : "bg-gold text-primary-foreground hover:bg-gold-soft"
        }`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {variant === "paid" ? "Redirecting to Paystack…" : "Booking…"}
          </>
        ) : variant === "free" ? (
          "Book free 20-min consultation"
        ) : (
          `Reserve 90-min follow-up — ${formatUsd(PRICING.consultation)}`
        )}
      </button>

      {variant === "paid" ? (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          For clients who completed the free intro and want a deeper session. Payment confirms your slot; we email the
          meeting link after Paystack verifies.
        </p>
      ) : (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Free · we send your meeting link by email. Available daily 7–9 PM East Africa Time.
        </p>
      )}
    </form>
  );
}

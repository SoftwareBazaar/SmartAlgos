import { useState } from "react";
import { Loader2 } from "lucide-react";
import { checkoutCapitalPayment, type CapitalProductType } from "@/lib/paystack";
import { toast } from "sonner";

type Props = {
  productType: CapitalProductType;
  productId: string;
  label: string;
  amountUsd?: number;
  metadata?: Record<string, unknown>;
  className?: string;
  variant?: "primary" | "outline";
  onSuccessClose?: () => void;
};

export function CheckoutForm({
  productType,
  productId,
  label,
  amountUsd,
  metadata,
  className = "",
  variant = "primary",
  onSuccessClose,
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      const msg = "Enter a valid email";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (productType === "research_donation" && (!amountUsd || amountUsd < 1)) {
      const msg = "Select a donation amount";
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      await checkoutCapitalPayment(
        { email, product_type: productType, product_id: productId, amount_usd: amountUsd, metadata },
        {
          onBeforeRedirect: () => onSuccessClose?.(),
          onSuccess: (ref) => {
            onSuccessClose?.();
            window.location.href = `/payment-callback?reference=${encodeURIComponent(ref)}`;
          },
          onClose: () => {
            toast.message("Payment cancelled");
          },
        },
      );
    } catch (err) {
      const msg = (err as Error).message || "Payment failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const btnClass =
    variant === "primary"
      ? "bg-gold text-primary-foreground hover:bg-gold-soft"
      : "border border-gold/60 text-gold hover:bg-gold/10";

  return (
    <form onSubmit={pay} className={`flex flex-col gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        required
        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
      />
      {error ? (
        <p className="text-sm text-bear rounded-sm border border-bear/30 bg-bear/10 px-3 py-2" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-60 ${btnClass}`}
      >
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting…</> : label}
      </button>
    </form>
  );
}

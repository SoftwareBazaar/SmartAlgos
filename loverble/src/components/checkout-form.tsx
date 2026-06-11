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
};

export function CheckoutForm({
  productType,
  productId,
  label,
  amountUsd,
  metadata,
  className = "",
  variant = "primary",
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await checkoutCapitalPayment(
        { email, product_type: productType, product_id: productId, amount_usd: amountUsd, metadata },
        {
          onSuccess: (ref) => {
            toast.success("Payment successful!", {
              description: `Reference: ${ref}. Check your email for confirmation.`,
            });
            setEmail("");
          },
        },
      );
    } catch (err) {
      toast.error((err as Error).message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const btnClass =
    variant === "primary"
      ? "bg-gold text-primary-foreground hover:bg-gold-soft"
      : "border border-gold/60 text-gold hover:bg-gold/10";

  return (
    <form onSubmit={pay} className={`flex flex-col sm:flex-row gap-2 ${className}`}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        required
        className="flex-1 bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
      />
      <button
        type="submit"
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-sm px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-60 ${btnClass}`}
      >
        {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing…</> : label}
      </button>
    </form>
  );
}

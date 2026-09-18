import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyCapitalPayment } from "@/lib/payments-api";
import { saveSubscriptionFromPayment } from "@/lib/subscription-access";
import { formatUsdWithKes } from "@/lib/pricing";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/payment-callback")({
  component: PaymentCallback,
});

function PaymentCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      setStatus("error");
      setMessage("No payment reference found.");
      return;
    }

    verifyCapitalPayment(reference)
      .then((data) => {
        if (data.product_type === "research_subscription") {
          saveSubscriptionFromPayment({
            product_id: data.product_id,
            email: data.email,
            reference,
            amount_usd: data.amount_usd,
          });
        }
        setStatus("success");
        const dest =
          data.product_type === "strategy_file"
            ? "/portal?tab=downloads"
            : data.product_type === "research_subscription"
              ? "/portal"
              : data.product_type === "research_donation"
                ? "/support"
                : "/research";
        setMessage(`Payment of ${formatUsdWithKes(Number(data.amount_usd))} confirmed. Reference: ${reference}`);
        setTimeout(() => {
          window.location.assign(dest);
        }, 1800);
      })
      .catch((err) => {
        setStatus("error");
        setMessage((err as Error).message || "Verification failed");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center surface-card rounded-lg p-8">
        {status === "loading" && <Loader2 className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />}
        {status === "success" && <CheckCircle2 className="h-10 w-10 text-bull mx-auto mb-4" />}
        {status === "error" && <XCircle className="h-10 w-10 text-bear mx-auto mb-4" />}
        <h1 className="font-display text-xl font-semibold">
          {status === "loading" ? "Verifying payment" : status === "success" ? "Payment confirmed" : "Verification issue"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Link to="/" className="mt-6 inline-block text-sm text-gold hover:underline">Return home</Link>
      </div>
    </div>
  );
}

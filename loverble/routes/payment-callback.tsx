import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyCapitalPayment } from "@/lib/payments-api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/payment-callback")({
  component: PaymentCallback,
});

function PaymentCallback() {
  const navigate = useNavigate();
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
        setStatus("success");
        setMessage(`Payment of $${Number(data.amount_usd).toFixed(2)} confirmed. Reference: ${reference}`);
        setTimeout(() => navigate({ to: "/research" }), 4000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage((err as Error).message || "Verification failed");
      });
  }, [navigate]);

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

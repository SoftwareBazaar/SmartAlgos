import { useState } from "react";
import { Heart } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";

const PRESETS = [5, 10, 25, 50, 100];

export function DonateButton({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className={`inline-flex items-center justify-center gap-2 rounded-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition font-semibold uppercase tracking-wider ${compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}`}
        >
          <Heart className="h-3.5 w-3.5" />
          {compact ? "Donate" : "Support Research"}
        </button>
      </DialogTrigger>
      <DialogContent className="surface-card">
        <DialogHeader>
          <DialogTitle className="font-display">Support Smart Algos Research</DialogTitle>
          <DialogDescription>
            Your contribution funds open research, white papers, and frontier-market data. Paid via Paystack.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={`px-3 py-2 rounded-sm border text-sm font-mono transition ${amount === p ? "border-gold bg-gold/10 text-gold" : "border-border bg-card/30 text-muted-foreground"}`}
            >
              ${p}
            </button>
          ))}
        </div>
        <CheckoutForm
          productType="research_donation"
          productId="donation"
          amountUsd={amount}
          label={`Donate $${amount}`}
        />
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Heart } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const PRESETS = [5, 10, 25, 50, 100];

export function DonateButton({ compact = false, footer = false }: { compact?: boolean; footer?: boolean }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState("");

  const resolvedAmount = custom ? Math.max(1, Number(custom) || 0) : amount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          footer
            ? "text-muted-foreground hover:text-gold transition cursor-pointer"
            : `inline-flex items-center justify-center gap-2 rounded-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition font-semibold uppercase tracking-wider cursor-pointer ${compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}`
        }
      >
        {!footer && <Heart className="h-3.5 w-3.5" />}
        {footer ? "Support research" : compact ? "Donate" : "Support Research"}
      </button>
      <DialogContent className="surface-card">
        <DialogHeader>
          <DialogTitle className="font-display">Support Smart Algos Research</DialogTitle>
          <DialogDescription>
            Choose an amount — payment is processed securely via Paystack (KES).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Select amount (USD)</div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setAmount(p);
                    setCustom("");
                  }}
                  className={`px-3 py-2 rounded-sm border text-sm font-mono transition ${!custom && amount === p ? "border-gold bg-gold/10 text-gold" : "border-border bg-card/30 text-muted-foreground hover:border-gold/40"}`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">Or custom amount</label>
            <input
              type="number"
              min={1}
              step={1}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Enter USD amount"
              className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
            />
          </div>

          <div className="rounded-sm border border-gold/30 bg-gold/5 px-3 py-2 text-sm">
            Donating: <span className="font-mono font-semibold text-gold">${resolvedAmount}</span>
          </div>

          <CheckoutForm
            productType="research_donation"
            productId="research_donation"
            amountUsd={resolvedAmount}
            label={`Donate $${resolvedAmount} via Paystack`}
            onSuccessClose={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

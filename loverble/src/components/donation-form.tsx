import { useMemo, useState } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { formatKes, formatUsd, kesToUsd, KES_RATE, usdToKes } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const PRESETS_USD = [5, 10, 25, 50, 100];

export function DonationForm({ initialUsd }: { initialUsd?: number }) {
  const start = initialUsd && initialUsd >= 1 ? initialUsd : 10;
  const [amountUsd, setAmountUsd] = useState(start);
  const [inputMode, setInputMode] = useState<"usd" | "kes">("kes");
  const [custom, setCustom] = useState(initialUsd && !PRESETS_USD.includes(initialUsd) ? String(initialUsd) : "");

  const resolvedUsd = useMemo(() => {
    if (!custom.trim()) return amountUsd;
    const n = Number(custom);
    if (!n || n <= 0) return amountUsd;
    const usd = inputMode === "kes" ? kesToUsd(n) : n;
    return Math.max(1, Math.round(usd * 100) / 100);
  }, [amountUsd, custom, inputMode]);

  const resolvedKes = usdToKes(resolvedUsd);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-dominant border border-border">
        <button
          type="button"
          onClick={() => {
            setInputMode("kes");
            setCustom(custom ? String(usdToKes(resolvedUsd)) : "");
          }}
          aria-pressed={inputMode === "kes"}
          className={cn(
            "py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
            inputMode === "kes" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Kenyan Shillings
        </button>
        <button
          type="button"
          onClick={() => {
            setInputMode("usd");
            setCustom(custom ? String(resolvedUsd) : "");
          }}
          aria-pressed={inputMode === "usd"}
          className={cn(
            "py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer",
            inputMode === "usd" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          US Dollars
        </button>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Choose an amount</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS_USD.map((p) => {
            const active = !custom && amountUsd === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmountUsd(p);
                  setCustom("");
                }}
                className={cn(
                  "px-3 py-2.5 rounded-lg border text-left transition cursor-pointer",
                  active ? "border-gold bg-gold/10 text-gold" : "border-border bg-card/30 text-muted-foreground hover:border-gold/40",
                )}
              >
                <div className="font-mono text-sm font-semibold text-foreground">{inputMode === "kes" ? formatKes(usdToKes(p)) : formatUsd(p)}</div>
                <div className="text-[10px] mt-0.5">{inputMode === "kes" ? formatUsd(p) : formatKes(usdToKes(p))}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
          Or enter your own amount ({inputMode === "kes" ? "KSh" : "USD"})
        </label>
        <input
          type="number"
          min={inputMode === "kes" ? KES_RATE : 1}
          step={inputMode === "kes" ? 50 : 1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={inputMode === "kes" ? "e.g. 1500" : "e.g. 10"}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
        />
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">You will be charged</div>
        <div className="mt-1 font-display text-2xl font-semibold text-gold">{formatKes(resolvedKes)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatUsd(resolvedUsd)} at the desk rate of 1 USD = {KES_RATE} KES. Paystack checkout is in Kenyan Shillings.
        </p>
      </div>

      <CheckoutForm
        productType="research_donation"
        productId="research_donation"
        amountUsd={resolvedUsd}
        label={`Support with ${formatKes(resolvedKes)}`}
      />
    </div>
  );
}

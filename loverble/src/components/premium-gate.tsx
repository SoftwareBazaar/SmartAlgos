import { Link } from "@tanstack/react-router";
import { Lock, Check } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";

export function PremiumGate({ items, tierId = "research-pro" }: { items: string[]; tierId?: string }) {
  return (
    <div className="mt-6 rounded-lg border border-gold/30 bg-gradient-to-b from-gold/5 to-transparent p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/15">
        <Lock className="h-5 w-5 text-gold" />
      </div>
      <h4 className="font-display text-lg font-semibold">Premium Research</h4>
      <p className="mt-1 text-sm text-muted-foreground">Subscribe to continue reading</p>
      <ul className="mt-4 space-y-2 text-left max-w-sm mx-auto">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-gold shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-5 max-w-sm mx-auto text-left">
        <CheckoutForm
          productType="research_subscription"
          productId={tierId}
          label={`Subscribe — ${tierId === "quant-pro" ? "Quant Pro" : "Research Pro"} via Paystack`}
        />
      </div>
      <Link to="/research" className="mt-3 inline-block text-xs text-muted-foreground hover:text-gold">
        View all subscription tiers →
      </Link>
    </div>
  );
}

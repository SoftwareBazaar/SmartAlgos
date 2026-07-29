import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { subscriptionTiers } from "@/lib/mock-data";
import { CheckoutForm } from "@/components/checkout-form";

export function SubscriptionTiers() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      {subscriptionTiers.map((tier) => (
        <div
          key={tier.id}
          className={`rounded-lg border p-6 flex flex-col ${
            tier.highlight ? "border-gold bg-gold/5" : "border-border bg-card/30"
          }`}
        >
          {tier.highlight && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">Recommended</div>
          )}
          <div className="font-display text-xl font-semibold">{tier.name}</div>
          <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold">{tier.price}</span>
            {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
          </div>
          <ul className="mt-5 space-y-2 flex-1">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {tier.id === "free" ? (
            <Link
              to="/research"
              className="mt-6 w-full text-center rounded-sm border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-card transition"
            >
              {tier.cta}
            </Link>
          ) : (
            <div className="mt-6">
              <CheckoutForm
                productType="research_subscription"
                productId={tier.id}
                amountUsd={"amountUsd" in tier ? tier.amountUsd : undefined}
                label={tier.cta}
                variant={tier.highlight ? "primary" : "outline"}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

const sessionIncludes = [
  "30-minute quant strategy review",
  "Rules & risk framework feedback",
  "Execution and platform guidance",
  "Written follow-up summary (email)",
];

export function AdvisoryDeskSection() {
  return (
    <section className="py-20 border-t border-border bg-secondary-surface/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal className="max-w-5xl mx-auto">
          <MotionItem>
            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              <GlowCard accent className="p-8 flex flex-col">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Strategy desk</div>
                <h2 className="font-display text-section-title text-2xl md:text-3xl">Book a quant advisory session</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Session fee {formatUsd(PRICING.consultation)} secures your calendar slot via Paystack — a deposit toward desk time, not a subscription product.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ongoing live model access: {formatUsd(PRICING.liveRetail)} retail · {formatUsd(PRICING.liveInstitutional)} institutional.
                </p>
                <div className="mt-6 flex-1 flex flex-col justify-end">
                  <CheckoutForm
                    productType="consultation"
                    productId="consultation"
                    amountUsd={PRICING.consultation}
                    label={`Book session — ${formatUsd(PRICING.consultation)} via Paystack`}
                  />
                  <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
                    View all advisory services →
                  </Link>
                </div>
              </GlowCard>

              <GlowCard className="p-8">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">What&apos;s included</div>
                <ul className="space-y-4">
                  {sessionIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-lg border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground leading-relaxed">
                  Best for systematic traders evaluating model design, deployment on QuantConnect, or research-to-production workflow.
                </div>
              </GlowCard>
            </div>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

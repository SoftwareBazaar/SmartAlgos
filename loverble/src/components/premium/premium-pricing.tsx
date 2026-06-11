import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

const tiers = [
  {
    id: "research-pro",
    name: "Methodology Access",
    price: `${formatUsd(PRICING.researchFull)}/report`,
    amountUsd: PRICING.researchFull,
    desc: "One-time unlock per full research note",
    features: ["Per-report purchase", "Full methodology", "Complete findings & PDF"],
    highlight: false,
  },
  {
    id: "live-retail",
    name: "Live Strategy — Retail",
    price: formatUsd(PRICING.liveRetail),
    amountUsd: PRICING.liveRetail,
    desc: "Subscribe to live systematic models",
    features: ["Live signals", "Rules & backtests", "Verification access"],
    highlight: true,
  },
  {
    id: "live-institutional",
    name: "Live Strategy — Institutional",
    price: formatUsd(PRICING.liveInstitutional),
    amountUsd: PRICING.liveInstitutional,
    desc: "Institutional live model access",
    features: ["Everything in Retail", "Priority desk", "Custom reporting"],
    highlight: false,
  },
] as const;

export function PremiumPricingShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-20 border-t border-border bg-dominant">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-secondary-surface/60 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold mb-4"
            animate={reduceMotion ? undefined : { boxShadow: ["0 0 0px oklch(0.78 0.13 85 / 0)", "0 0 24px oklch(0.78 0.13 85 / 0.25)", "0 0 0px oklch(0.78 0.13 85 / 0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3" /> Premium access
          </motion.div>
          <h2 className="font-display text-4xl font-semibold">Subscribe to depth</h2>
          <p className="mt-3 text-muted-foreground">
            Preview research free — unlock individual reports at {formatUsd(PRICING.researchFull)} each, or subscribe to live verified strategies.
          </p>
        </div>

        <MotionReveal className="grid md:grid-cols-3 gap-5">
          {tiers.map((tier) => (
            <MotionItem key={tier.id}>
              <GlowCard accent={tier.highlight} className={`p-6 flex flex-col h-full ${tier.highlight ? "ring-1 ring-gold/30" : ""}`}>
                {tier.highlight && (
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">Most popular</div>
                )}
                <div className="font-display text-lg font-semibold">{tier.name}</div>
                <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
                <div className="mt-4 font-display text-3xl font-bold text-gold">{tier.price}</div>
                <ul className="mt-5 space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <CheckoutForm
                    productType="research_subscription"
                    productId={tier.id}
                    amountUsd={tier.amountUsd}
                    label={tier.id === "research-pro" ? `Unlock — ${tier.price}` : `Subscribe — ${tier.price}`}
                    variant={tier.highlight ? "primary" : "outline"}
                  />
                </div>
              </GlowCard>
            </MotionItem>
          ))}
        </MotionReveal>
      </div>
    </section>
  );
}

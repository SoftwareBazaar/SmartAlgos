import { motion, useReducedMotion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

type Feature = { label: string; included: boolean };

const tiers: {
  id: string;
  kicker: string;
  name: string;
  price: string;
  period: string;
  amountUsd: number;
  desc: string;
  features: Feature[];
  highlight: boolean;
  cta: string;
}[] = [
  {
    id: "research-pro",
    kicker: "On-demand",
    name: "Research Unlock",
    price: formatUsd(PRICING.researchFull),
    period: "/ report",
    amountUsd: PRICING.researchFull,
    desc: "One-time unlock per full research note",
    features: [
      { label: "Single PDF methodology report", included: true },
      { label: "Full backtest Jupyter notebook", included: true },
      { label: "Live signal delivery", included: false },
      { label: "Direct API / webhook access", included: false },
    ],
    highlight: false,
    cta: `Unlock report — ${formatUsd(PRICING.researchFull)}`,
  },
  {
    id: "live-retail",
    kicker: "Retail live",
    name: "Systematic Trader",
    price: formatUsd(PRICING.liveRetail),
    period: "/ month",
    amountUsd: PRICING.liveRetail,
    desc: "Live systematic models with verified logs",
    features: [
      { label: "Access to all research notebooks", included: true },
      { label: "Real-time live signal feed", included: true },
      { label: "QuantConnect verified logs", included: true },
      { label: "Direct API / webhook execution", included: false },
    ],
    highlight: true,
    cta: `Subscribe retail — ${formatUsd(PRICING.liveRetail)}`,
  },
  {
    id: "live-institutional",
    kicker: "Enterprise",
    name: "Institutional",
    price: formatUsd(PRICING.liveInstitutional),
    period: "/ month",
    amountUsd: PRICING.liveInstitutional,
    desc: "API execution, parameters, and priority desk",
    features: [
      { label: "Everything in Retail", included: true },
      { label: "Direct API & webhook execution", included: true },
      { label: "Raw strategy parameter files (.json)", included: true },
      { label: "Priority strategy desk support", included: true },
    ],
    highlight: false,
    cta: `Contact / subscribe — ${formatUsd(PRICING.liveInstitutional)}`,
  },
];

export function PremiumPricingShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="pricing" className="py-20 border-t border-border bg-dominant scroll-mt-24">
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
            Static research vs live execution vs API access — pick the tier that matches how you trade.
          </p>
        </div>

        <MotionReveal className="pricing-grid grid md:grid-cols-3 gap-5 items-stretch">
          {tiers.map((tier) => (
            <MotionItem key={tier.id}>
              <GlowCard
                accent={tier.highlight}
                className={`p-6 flex flex-col h-full cursor-default ${
                  tier.highlight
                    ? "overflow-visible border-2 border-gold md:-translate-y-2 shadow-xl shadow-gold/10 ring-1 ring-gold/30"
                    : ""
                }`}
              >
                {tier.highlight && (
                  <div className="mb-3">
                    <span className="inline-flex bg-gold text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Most popular
                    </span>
                  </div>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-widest ${tier.highlight ? "text-gold" : "text-muted-foreground"}`}>
                  {tier.kicker}
                </span>
                <div className="font-display text-lg font-semibold mt-1">{tier.name}</div>
                <p className="text-xs text-muted-foreground mt-1">{tier.desc}</p>
                <div className="mt-4 font-display text-3xl font-bold text-gold">
                  {tier.price}{" "}
                  <span className="text-sm font-normal text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f.label}
                      className={`flex items-start gap-2 text-sm ${
                        f.included ? "text-muted-foreground" : "text-muted-foreground/40 line-through"
                      }`}
                    >
                      {f.included ? (
                        <Check className="h-3.5 w-3.5 text-bull shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      )}
                      {f.label}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <CheckoutForm
                    productType="research_subscription"
                    productId={tier.id}
                    amountUsd={tier.amountUsd}
                    label={tier.cta}
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

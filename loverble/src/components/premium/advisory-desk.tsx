import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";
import { toast } from "sonner";

const advisoryCategories = [
  "Stocks & equities",
  "Futures",
  "Forex",
  "Commodities",
  "Our live strategies",
  "Systems you want to build",
];

const sessionIncludes = [
  "90-minute guided advisory with our quant desk",
  "Asset-class fit: stocks, futures, forex, commodities",
  "Strategy rules, risk framework, and execution review",
  "Roadmap for systems you want to design or deploy",
];

export function AdvisoryDeskSection() {
  const [freeEmail, setFreeEmail] = useState("");
  const [freeQuestion, setFreeQuestion] = useState("");

  const submitFreeQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeEmail.includes("@") || !freeQuestion.trim()) {
      return toast.error("Email and question are required");
    }
    toast.success("Question received", {
      description: "Free advisory reply within 24–48 hours.",
    });
    setFreeQuestion("");
  };

  return (
    <section className="py-20 border-t border-border bg-secondary-surface/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal className="max-w-5xl mx-auto">
          <MotionItem>
            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              <GlowCard accent className="p-8 flex flex-col">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Strategy desk</div>
                <h2 className="font-display text-section-title text-2xl md:text-3xl">Book an Advisory session</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-gold font-semibold">{formatUsd(PRICING.consultation)} only</span> — a focused{" "}
                  <span className="text-foreground font-medium">90-minute guide</span> with our research desk. One flat
                  session fee, not a subscription.
                </p>

                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">We advise on</div>
                  <div className="flex flex-wrap gap-2">
                    {advisoryCategories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-sm border border-gold/25 bg-gold/5 px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex-1 flex flex-col justify-end">
                  <CheckoutForm
                    productType="consultation"
                    productId="consultation"
                    amountUsd={PRICING.consultation}
                    label={`Reserve 90-min session — ${formatUsd(PRICING.consultation)}`}
                  />
                  <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
                    View all advisory services →
                  </Link>
                </div>
              </GlowCard>

              <div className="flex flex-col gap-6">
                <GlowCard className="p-8 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">What&apos;s included</div>
                  <ul className="space-y-4">
                    {sessionIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-lg border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground leading-relaxed">
                    Investing in stocks, futures, forex, or commodities — or building a systematic model like ours. We map
                    your idea to a concrete next step.
                  </div>
                </GlowCard>

                <GlowCard className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="h-4 w-4 text-gold" />
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Free advisory</div>
                  </div>
                  <h3 className="font-display text-lg font-semibold">Questions only — no fee</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Not ready for a full session? Ask one question and we&apos;ll reply by email within 24–48 hours.
                  </p>
                  <form onSubmit={submitFreeQuestion} className="mt-4 flex flex-col gap-3">
                    <input
                      type="email"
                      value={freeEmail}
                      onChange={(e) => setFreeEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                    />
                    <textarea
                      value={freeQuestion}
                      onChange={(e) => setFreeQuestion(e.target.value)}
                      rows={3}
                      placeholder="Your question — strategy idea, asset class, system design…"
                      className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60 resize-none"
                    />
                    <button
                      type="submit"
                      className="rounded-sm border border-gold/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition cursor-pointer"
                    >
                      Book free question
                    </button>
                  </form>
                </GlowCard>
              </div>
            </div>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { Check, Calendar, Sparkles } from "lucide-react";
import { formatUsd, PRICING } from "@/lib/pricing";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

const advisoryCategories = [
  "Stocks & equities",
  "Futures",
  "Forex",
  "Commodities",
  "Our live strategies",
  "Systems you want to build",
];

const sessionIncludes = [
  "Free 20-minute intro — pick topic, date, and time (7–9 PM EAT daily)",
  "Meeting link sent by email after you book",
  "Optional 90-minute follow-up for deeper strategy work",
  "Asset-class fit: stocks, futures, forex, commodities",
];

export function AdvisoryDeskSection() {
  const followUpPrice = formatUsd(PRICING.consultation);

  return (
    <section className="py-20 border-t border-border bg-secondary-surface/30">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal className="max-w-5xl mx-auto">
          <MotionItem>
            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              <GlowCard accent className="p-8 flex flex-col">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Strategy desk</div>
                <h2 className="font-display text-section-title text-2xl md:text-3xl">Book an advisory session</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Start with a{" "}
                  <span className="text-foreground font-medium">free 20-minute consultation</span> — choose your
                  product focus and a slot between 7–9 PM EAT. We send your meeting link by email.
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
                  <div className="flex items-center gap-2 mb-3 text-gold">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">Free intro</span>
                  </div>
                  <AdvisoryBookingForm variant="free" />
                  <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
                    View all advisory services →
                  </Link>
                </div>
              </GlowCard>

              <div className="flex flex-col gap-6">
                <GlowCard className="p-8 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">How it works</div>
                  <ul className="space-y-4">
                    {sessionIncludes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-lg border border-border/60 bg-background/40 p-4 text-xs text-muted-foreground leading-relaxed">
                    Investing in stocks, futures, forex, or commodities — or building a systematic model like ours. The
                    free call maps your idea to a concrete next step; the follow-up goes deep when you are ready.
                  </div>
                </GlowCard>

                <GlowCard className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Follow-up</div>
                  </div>
                  <h3 className="font-display text-lg font-semibold">90-minute session — {followUpPrice}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    After your free intro, book a paid follow-up if you want extended guidance — same scheduling window,
                    payment via Paystack, meeting link after confirmation.
                  </p>
                  <div className="mt-4">
                    <AdvisoryBookingForm variant="paid" />
                  </div>
                </GlowCard>
              </div>
            </div>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

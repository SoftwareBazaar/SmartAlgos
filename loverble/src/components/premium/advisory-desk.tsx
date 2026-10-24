import { Link } from "@tanstack/react-router";
import { Check, Calendar } from "lucide-react";
import { formatUsd, PRICING } from "@/lib/pricing";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

const topics = [
  "Stocks & equities",
  "Futures",
  "Forex",
  "Commodities",
  "Our live strategies",
  "Systems you want to build",
];

const sessionIncludes = [
  "Free 20-minute intro — pick topic, date, and time (7–9 PM EAT daily)",
  "Times shown in your local timezone with EAT in parentheses",
  "Meeting link sent by email after you book",
  `Optional 90-minute deep-dive at launch rate ${formatUsd(PRICING.consultation)} (regular ${formatUsd(PRICING.consultationRegular)})`,
];

export function AdvisoryDeskSection() {
  return (
    <section id="advisory" className="py-20 border-t border-border bg-secondary-surface/30 scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal className="max-w-5xl mx-auto">
          <MotionItem>
            <div className="grid lg:grid-cols-2 gap-6 items-stretch">
              <GlowCard accent className="p-8 flex flex-col cursor-default">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Book a desk</div>
                <h2 className="font-display text-section-title text-2xl md:text-3xl">Book a desk session</h2>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Free 20-minute intro. Optional 90-minute deep-dive. Educational research discussion — not investment
                  advice and not money management.
                </p>

                <div className="mt-5">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Topics we discuss</div>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((cat) => (
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
                    <span className="text-[10px] uppercase tracking-[0.18em] font-semibold">Book a slot</span>
                  </div>
                  <AdvisoryBookingForm />
                  <Link to="/consultation" className="mt-4 inline-block text-xs text-gold hover:underline cursor-pointer">
                    Full Book a desk page →
                  </Link>
                </div>
              </GlowCard>

              <GlowCard className="p-8 flex flex-col cursor-default">
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
                  Sessions are hosted by the research desk (currently one researcher). We discuss systematic ideas and
                  process — we do not manage your capital or act as a licensed investment adviser.
                </div>
              </GlowCard>
            </div>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { GlowCard } from "./glow-card";
import { MotionReveal, MotionItem } from "@/components/motion-reveal";

/** Honest homepage strip — no illustrative curves labeled as verified. */
export function MiniEquityStrip() {
  return (
    <section id="performance" className="py-16 border-t border-border bg-dominant scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <MotionReveal>
          <MotionItem>
            <GlowCard accent className="p-6 md:p-8">
              <div className="max-w-[70ch]">
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">Track record</div>
                <h2 className="font-display text-section-title text-3xl md:text-4xl font-bold">Live record pending</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  We publish verified third-party performance when QuantConnect listings are live — not illustrative equity curves.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    to="/performance"
                    className="inline-flex items-center gap-2 text-sm text-gold hover:underline cursor-pointer"
                  >
                    Track record status <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://www.quantconnect.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold"
                  >
                    QuantConnect <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </GlowCard>
          </MotionItem>
        </MotionReveal>
      </div>
    </section>
  );
}

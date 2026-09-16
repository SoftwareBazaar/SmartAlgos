import { Calendar } from "lucide-react";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { SectionCard } from "@/components/page-shell";
import { consultationServices, company } from "@/lib/mock-data";
import { formatUsd, PRICING } from "@/lib/pricing";

export function ConsultationPageContent() {
  const followUpPrice = formatUsd(PRICING.consultation);

  return (
    <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-10">
      <header className="max-w-2xl">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">Strategy desk · 7–9 PM EAT daily</div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-foreground leading-tight">
          Book your advisory session
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          Start with a <span className="text-foreground font-medium">free 20-minute consultation</span> with{" "}
          {company.name}, or book a <span className="text-gold font-medium">{followUpPrice} 90-minute follow-up</span>.
          Last 20-min slot starts at 8:40 PM EAT — slots convert to your local time automatically.
        </p>
      </header>

      <SectionCard
        title="Book a session"
        subtitle={`Free intro or ${followUpPrice} deep-dive — one form`}
        action={<Calendar className="h-5 w-5 text-gold" />}
        className="border-gold/20 max-w-xl"
      >
        <p className="text-sm text-muted-foreground mb-4">
          Stocks, futures, forex, commodities, our live models, or a system you want to build. Paystack appears only for
          the paid session.
        </p>
        <AdvisoryBookingForm />
      </SectionCard>

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">What we advise on</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {consultationServices.map((svc) => (
            <div key={svc.id} className="rounded-lg border border-border/80 bg-secondary-surface/40 p-4">
              <h3 className="font-display text-sm font-semibold text-foreground">{svc.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {svc.items.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-gold mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

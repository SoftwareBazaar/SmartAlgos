import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionCard } from "@/components/page-shell";
import { consultationServices, company } from "@/lib/mock-data";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { formatUsd, PRICING } from "@/lib/pricing";
import { Calendar, Sparkles } from "lucide-react";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "Consultation — Smart Algos Capital" },
      {
        name: "description",
        content: "Free 20-minute advisory intro, then optional 90-minute follow-up with our quant desk.",
      },
    ],
  }),
  component: Consultation,
});

function Consultation() {
  const followUpPrice = formatUsd(PRICING.consultation);

  return (
    <PageShell
      eyebrow="Advisory"
      title="Book an advisory session"
      description={`Start with a free 20-minute consultation — pick your topic and a time between 7–9 PM EAT. After the intro, book a ${followUpPrice} 90-minute follow-up if you want to go deeper.`}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultationServices.map((svc) => (
          <SectionCard key={svc.id} title={svc.title}>
            <ul className="space-y-2">
              {svc.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard
          title="Free 20-minute consultation"
          subtitle="No fee · meeting link by email"
          action={<Calendar className="h-5 w-5 text-gold" />}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Choose what you want to discuss with {company.name} — stocks, futures, forex, commodities, our live models,
            or a system you want to build. We email your meeting link after you book.
          </p>
          <AdvisoryBookingForm variant="free" />
        </SectionCard>

        <SectionCard
          title="90-minute follow-up"
          subtitle={`${followUpPrice} — after your free intro`}
          action={<Sparkles className="h-5 w-5 text-gold" />}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Ready to go deeper? This paid session is for clients who completed the free intro and want a focused
            90-minute guide — strategy rules, risk framework, execution review, and next steps.
          </p>
          <AdvisoryBookingForm variant="paid" />
        </SectionCard>
      </div>
    </PageShell>
  );
}

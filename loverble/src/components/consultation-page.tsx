import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { SectionCard } from "@/components/page-shell";
import { consultationServices, company, strategyDeskHost } from "@/lib/mock-data";
import { formatUsd, PRICING } from "@/lib/pricing";

export function ConsultationPageContent() {
  const [topic, setTopic] = useState("");
  const launchPrice = formatUsd(PRICING.consultation);
  const regularPrice = formatUsd(PRICING.consultationRegular);

  const selectTopic = (id: string) => {
    setTopic(id);
    document.getElementById("book-session")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-10">
      <header className="max-w-[70ch]">
        <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-3">Strategy Desk</div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-foreground leading-tight">
          Book a Strategy Desk session
        </h1>
        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          Free 20-minute intro. Optional 90-minute deep-dive. Daily, 7 to 9 PM EAT — times shown in your local timezone.
        </p>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 items-start">
        <SectionCard
          id="book-session"
          title="Book a session"
          subtitle="Choose a topic and time below"
          action={<Calendar className="h-5 w-5 text-gold" />}
          className="border-gold/20 scroll-mt-24"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Free: no payment. Deep-dive: pay securely at confirmation (Paystack).
          </p>
          <AdvisoryBookingForm
            selectedService={topic}
            onServiceChange={setTopic}
          />
        </SectionCard>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-secondary-surface/50 p-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Who you’ll speak with</div>
            <h2 className="font-display text-xl font-semibold">{strategyDeskHost.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{strategyDeskHost.blurb}</p>
            <p className="text-xs text-muted-foreground">{strategyDeskHost.org} · {company.name}</p>
            <Link to="/performance" className="inline-block text-sm text-gold hover:underline">
              Track record status →
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-secondary-surface/50 p-6 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-gold">What happens</div>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Choose a topic and time</li>
              <li>Receive an invite by email</li>
              <li>20-minute call (or 90-minute deep-dive)</li>
              <li>Optional follow-up if you want to continue</li>
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-card/30 p-6 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">What this is not</div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Not personalised investment advice</li>
              <li>Not money management or custody</li>
              <li>Not a licensed investment adviser relationship</li>
            </ul>
          </div>

          <div className="rounded-xl border border-gold/25 bg-gold/5 p-5 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Launch pricing:</span> deep-dive is{" "}
            <span className="text-foreground">{launchPrice}</span> while we build capacity
            (stated regular rate {regularPrice}). Free intro stays free.
          </div>
        </aside>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Topics we discuss — click to preselect
        </div>
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
          {consultationServices.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => selectTopic(svc.id)}
              className={`text-left rounded-lg border p-4 transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                topic === svc.id
                  ? "border-gold/50 bg-gold/5"
                  : "border-border/80 bg-secondary-surface/40 hover:border-gold/30"
              }`}
            >
              <h3 className="font-display text-sm font-semibold text-foreground">{svc.title}</h3>
              <ul className="mt-3 space-y-1.5">
                {svc.items.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-gold mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Calendar, FlaskConical, ArrowRight } from "lucide-react";
import { AdvisoryBookingForm } from "@/components/advisory-booking-form";
import { consultationServices, company, strategyDeskHost } from "@/lib/mock-data";
import { formatUsd, PRICING } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function ConsultationPageContent({
  initialTrack,
}: {
  initialTrack?: "systems" | "quant";
}) {
  const [topic, setTopic] = useState(initialTrack ?? "");
  const launchPrice = formatUsd(PRICING.consultation);
  const regularPrice = formatUsd(PRICING.consultationRegular);

  const selectTopic = (id: string) => {
    setTopic(id);
    document.getElementById("book-session")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, rgb(245 158 11 / 0.1), transparent 50%), radial-gradient(ellipse at 80% 40%, rgb(245 158 11 / 0.04), transparent 40%)",
        }}
      />

      <div className="relative mx-auto max-w-[1160px] px-6 pt-20 pb-16 space-y-12">
        <header className="max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.16em] text-gold">BOOK A DESK</p>
          <h1 className="mt-3 font-display text-[1.85rem] md:text-[2.35rem] font-semibold tracking-tight leading-[1.2]">
            Future-proof your financial infrastructure &amp; trading edge.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-[54ch]">
            Free 20-minute intro or optional 90-minute deep-dive. Daily 7–9 PM EAT — times shown in your local
            timezone. Educational discussion only.
          </p>
        </header>

        {/* Dual track cards — mockup structure, gold system */}
        <section className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => selectTopic("systems")}
            className={cn(
              "group text-left rounded-2xl border p-6 transition outline-none focus-visible:ring-2 focus-visible:ring-gold",
              topic === "systems"
                ? "border-gold/55 bg-gold/[0.07] shadow-[0_0_40px_rgb(245_158_11_/_0.08)]"
                : "border-border/70 bg-[#111827]/55 hover:border-gold/35",
            )}
          >
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <Building2 className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold tracking-tight">B2B financial systems architecture</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              For banks, SACCOs, and financial institutions — core banking, payment gateways, and scalable
              infrastructure.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              Select track <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => selectTopic("quant")}
            className={cn(
              "group text-left rounded-2xl border p-6 transition outline-none focus-visible:ring-2 focus-visible:ring-gold",
              topic === "quant"
                ? "border-gold/55 bg-gold/[0.07] shadow-[0_0_40px_rgb(245_158_11_/_0.08)]"
                : "border-border/70 bg-[#111827]/55 hover:border-gold/35",
            )}
          >
            <span className="inline-grid h-11 w-11 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
              <FlaskConical className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold tracking-tight">Quant strategy &amp; prop automation</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              For prop desks and quantitative teams — strategy review, risk models, and systematic execution design.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
              Select track <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </button>
        </section>

        <section id="book-session" className="scroll-mt-24">
          <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[9px] tracking-[0.14em] text-gold">SCHEDULE &amp; TOPICS</p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight">Book your session</h2>
            </div>
            <p className="text-xs text-muted-foreground">Free intro · deep-dive via Paystack</p>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-6 items-start">
            <div className="rounded-2xl border border-gold/25 bg-[#111827]/70 p-5 md:p-7 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2 text-gold">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Session details</span>
              </div>
              <AdvisoryBookingForm selectedService={topic} onServiceChange={setTopic} />
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-[#111827]/50 p-5 space-y-2.5">
                <p className="font-mono text-[9px] tracking-[0.14em] text-gold">WHO YOU&apos;LL SPEAK WITH</p>
                <h3 className="text-base font-semibold tracking-tight">{strategyDeskHost.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{strategyDeskHost.blurb}</p>
                <p className="text-[11px] text-muted-foreground">
                  {strategyDeskHost.org} · {company.name}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-[#111827]/50 p-5 space-y-2.5">
                <p className="font-mono text-[9px] tracking-[0.14em] text-gold">WHAT HAPPENS</p>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Choose a track, topic, and time</li>
                  <li>Receive an invite by email</li>
                  <li>20-minute call (or 90-minute deep-dive)</li>
                  <li>Optional follow-up if you continue</li>
                </ol>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/20 p-5 space-y-2">
                <p className="font-mono text-[9px] tracking-[0.14em] text-muted-foreground">WHAT THIS IS NOT</p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li>Not personalised investment advice</li>
                  <li>Not money management or custody</li>
                  <li>Not a licensed adviser relationship</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gold/25 bg-gold/[0.05] p-4 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Launch pricing:</span> deep-dive is{" "}
                <span className="text-foreground">{launchPrice}</span> while we build capacity (regular{" "}
                {regularPrice}). Free intro stays free.
              </div>
            </aside>
          </div>
        </section>

        <section>
          <p className="mb-4 font-mono text-[9px] tracking-[0.14em] text-muted-foreground">
            MORE TOPICS — CLICK TO PRESELECT
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {consultationServices.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => selectTopic(svc.id)}
                className={cn(
                  "text-left rounded-xl border p-4 transition outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  topic === svc.id
                    ? "border-gold/50 bg-gold/[0.06]"
                    : "border-border/60 bg-[#111827]/40 hover:border-gold/30",
                )}
              >
                <h3 className="text-sm font-semibold text-foreground tracking-tight">{svc.title}</h3>
                <ul className="mt-2.5 space-y-1.5">
                  {svc.items.slice(0, 2).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-snug">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Prefer email first?{" "}
            <Link to="/contact" className="text-gold hover:underline">
              Contact
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

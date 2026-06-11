import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, SectionCard } from "@/components/page-shell";
import { consultationServices, company } from "@/lib/mock-data";
import { Calendar, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "Consultation — Smart Algos Capital" },
      { name: "description", content: "Quant consulting, trading systems, financial systems, and research advisory." },
    ],
  }),
  component: Consultation,
});

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "";

function Consultation() {
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");

  const bookCalendly = () => {
    if (CALENDLY_URL) {
      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("Calendly integration coming soon", {
      description: "Set VITE_CALENDLY_URL in your environment, or use the contact form below.",
    });
  };

  const askQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !email.trim()) return toast.error("Email and question are required");
    toast.success("Question received", { description: "Our research desk replies within 24–48 hours." });
    setQuestion("");
  };

  return (
    <PageShell
      eyebrow="Immediate Revenue"
      title="Consultation"
      description="Get clients through quant consulting, strategy review, trading system design, and research advisory."
      actions={
        <button
          onClick={bookCalendly}
          className="inline-flex items-center gap-2 rounded-sm bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition"
        >
          <Calendar className="h-4 w-4" /> Book Consultation
        </button>
      }
    >
      <div className="grid md:grid-cols-2 gap-4">
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
        <SectionCard title="Book Consultation" subtitle="Calendly integration — pick a time that works">
          <p className="text-sm text-muted-foreground mb-4">
            Schedule a session with {company.name} for strategy review, alpha evaluation, MT5/Python system design, or financial systems advisory.
          </p>
          <button
            onClick={bookCalendly}
            className="w-full rounded-sm bg-gold px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition inline-flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {CALENDLY_URL ? "Open Calendly" : "Book Consultation"}
            {CALENDLY_URL && <ExternalLink className="h-3.5 w-3.5" />}
          </button>
          {!CALENDLY_URL && (
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Add <code className="text-gold">VITE_CALENDLY_URL</code> to enable direct booking.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Ask a Question" subtitle="Free inquiry — we reply within 24–48h" action={<MessageCircle className="h-5 w-5 text-gold" />}>
          <form onSubmit={askQuestion} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
            />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={5}
              placeholder="Describe your consulting need — strategy review, system design, research engagement…"
              className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60 resize-none"
            />
            <button type="submit" className="rounded-sm border border-gold/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
              Send Inquiry
            </button>
          </form>
        </SectionCard>
      </div>
    </PageShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, Linkedin, Github, Globe } from "lucide-react";
import { PageShell, SectionCard } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Smart Algos Capital" },
      { name: "description", content: "Reach the Smart Algos Capital research desk — quantitative research, alpha development, and consultation enquiries." },
      { property: "og:title", content: "Contact Smart Algos Capital" },
      { property: "og:description", content: "Talk to the Smart Algos research desk." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message received", { description: "We'll reply within 1 business day." });
      (e.target as HTMLFormElement).reset();
      setSubmitting(false);
    }, 600);
  };

  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to the research desk"
      description="For research collaborations, consultation enquiries, or partnerships — we read every message."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard className="lg:col-span-2" title="Send a message" subtitle="Typical reply within one business day">
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
            <input required name="name" placeholder="Full name" className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60" />
            <input required type="email" name="email" placeholder="Email" className="bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60" />
            <input name="company" placeholder="Company / Institution (optional)" className="sm:col-span-2 bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60" />
            <select name="topic" className="sm:col-span-2 bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60">
              <option>General enquiry</option>
              <option>Quantitative research collaboration</option>
              <option>Consultation booking</option>
              <option>Financial systems (Smart Algos)</option>
              <option>Media / press</option>
            </select>
            <textarea required name="message" rows={6} placeholder="Your message…" className="sm:col-span-2 bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60" />
            <button disabled={submitting} type="submit" className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft transition disabled:opacity-60">
              <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Send message"}
            </button>
          </form>
        </SectionCard>

        <div className="flex flex-col gap-4">
          <SectionCard title="Direct" subtitle="Research desk">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3"><Mail className="h-4 w-4 text-gold mt-0.5" /><div><div className="text-muted-foreground text-xs">Email</div><div className="font-mono">research@smartalgos.capital</div></div></div>
              <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-gold mt-0.5" /><div><div className="text-muted-foreground text-xs">Phone</div><div className="font-mono">+254 700 000 000</div></div></div>
              <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-gold mt-0.5" /><div><div className="text-muted-foreground text-xs">HQ</div><div>Nairobi, Kenya</div></div></div>
            </div>
          </SectionCard>
          <SectionCard title="Elsewhere">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[{ i: Linkedin, l: "LinkedIn" }, { i: Github, l: "GitHub" }, { i: Globe, l: "Website" }].map(({ i: I, l }) => (
                <a key={l} href="#" className="flex flex-col items-center gap-1 rounded-sm border border-border bg-card/30 p-3 hover:border-gold/40 transition">
                  <I className="h-4 w-4 text-gold" /><span className="text-muted-foreground">{l}</span>
                </a>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}

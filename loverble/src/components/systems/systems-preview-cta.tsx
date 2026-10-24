import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Mail, Play, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SystemsEngine } from "@/lib/systems-engines";
import { company } from "@/lib/mock-data";
import { sendDeskMessage } from "@/lib/desk-api";

export function SystemsPreviewCta({ engine }: { engine: SystemsEngine }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.includes("@")) {
      toast.error("Name and a valid email are required");
      return;
    }
    setLoading(true);
    try {
      await sendDeskMessage({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: org.trim() || undefined,
        topic: `${engine.name} — architecture enquiry`,
        message:
          message.trim() ||
          `Interested in ${engine.name} (${engine.codename}). Please send more details or propose a meeting.`,
        source: `systems_preview_${engine.slug}`,
      });
      toast.success("Request sent", {
        description: "We'll follow up with details or a meeting slot.",
      });
      setMessage("");
    } catch (err) {
      toast.error((err as Error).message || "Could not send — try email instead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="preview" className="scroll-mt-24 space-y-6">
      <div className="rounded-2xl border border-gold/30 bg-[#111827]/80 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 pt-5 pb-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.14em] text-gold">VIDEO PREVIEW</p>
            <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
              See {engine.name} in action
            </h3>
          </div>
          <Play className="h-5 w-5 text-gold shrink-0" />
        </div>
        <div className="px-5 md:px-6 pb-5">
          {engine.demoVideoUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/70 bg-black">
              <iframe
                src={engine.demoVideoUrl}
                title={`${engine.name} demo`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gold/35 bg-black/40 px-6 text-center">
              <span className="inline-grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                <Play className="h-6 w-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Demo video coming soon</p>
              <p className="max-w-[40ch] text-xs text-muted-foreground leading-relaxed">
                A walkthrough of {engine.name} will appear here. Meanwhile, request details or book a desk
                session below.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-[#0d121c]/90 p-5 md:p-7">
        <p className="font-mono text-[9px] tracking-[0.14em] text-gold">NEXT STEP</p>
        <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight">
          Request details or arrange a meeting
        </h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-[55ch]">
          Source packs are not available for public download. Tell us about your institution and we will share a
          scoped overview, or book an architecture review.
        </p>

        <form onSubmit={submit} className="mt-5 grid sm:grid-cols-2 gap-3">
          <input
            required
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
          />
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
          />
          <input
            name="company"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Bank / SACCO / institution (optional)"
            className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
          />
          <textarea
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`What would you like to know about ${engine.name}?`}
            className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-gold-soft disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Email for more details
          </button>
        </form>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            to="/consultation"
            search={{ track: "systems" }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-gold/40 px-4 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition"
          >
            <Calendar className="h-3.5 w-3.5" /> Arrange a meeting
          </Link>
          <a
            href={`mailto:${company.emails.desk}?subject=${encodeURIComponent(`${engine.name} architecture enquiry`)}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold hover:border-gold/40 hover:text-gold transition"
          >
            <Mail className="h-3.5 w-3.5" /> {company.emails.desk}
          </a>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Prefer the contact form?{" "}
          <Link to="/contact" className="text-gold hover:underline inline-flex items-center gap-1">
            Contact desk <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

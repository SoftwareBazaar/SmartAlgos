import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendDeskMessage } from "@/lib/desk-api";

const inputClass =
  "w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-gold/60";
const labelClass = "text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5 block";

export function CustomQuantSection() {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    try {
      await sendDeskMessage({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        topic: "Custom quant specification",
        message: String(data.get("spec") || ""),
        source: "custom-quant",
      });
      toast.success("Specification received", {
        description: "We'll reply with a confidential quote within one business day.",
      });
      form.reset();
    } catch (err) {
      toast.error((err as Error).message || "Could not send the specification");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="custom-quant" className="py-20 border-t border-border scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-gold mb-2">Bespoke engineering</div>
            <h2 className="font-display text-section-title text-3xl md:text-4xl">Hire a quant for your trading idea</h2>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              Have a discretionary or rules-based system? We translate it into a backtested algorithm with realistic
              slippage, spread, and risk controls — under NDA before any code review.
            </p>
            <ul className="space-y-3 mt-6 text-sm text-muted-foreground">
              {[
                "Multi-asset coding (Python, QuantConnect, Pine Script, C#)",
                "Slippage, spread, and market-impact modeling",
                "Non-disclosure agreement prior to code review",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-secondary-surface border border-border p-6 rounded-xl">
            <h3 className="font-display text-lg font-semibold mb-4">Submit your strategy spec</h3>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className={labelClass}>Your name</label>
                <input name="name" type="text" required placeholder="Jane Doe" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" required placeholder="you@email.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Strategy specification</label>
                <textarea
                  name="spec"
                  required
                  rows={4}
                  placeholder="Entry/exit rules, asset class, timeframe, constraints…"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-12 inline-flex items-center justify-center gap-2 py-3 bg-gold text-primary-foreground font-bold text-sm rounded-lg hover:bg-gold-soft transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Request confidential quote"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

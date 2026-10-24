import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { toast } from "sonner";
import { DonationForm } from "@/components/donation-form";
import { BrandLogo } from "@/components/brand-logo";

type SupportSearch = { amount?: number; thanks?: boolean };

export const Route = createFileRoute("/support")({
  validateSearch: (search: Record<string, unknown>): SupportSearch => {
    const raw = Number(search.amount);
    const thanks =
      search.thanks === true ||
      search.thanks === "1" ||
      search.thanks === "true" ||
      search.thanks === 1;
    return {
      amount: Number.isFinite(raw) && raw >= 1 ? raw : undefined,
      thanks: !!thanks,
    };
  },
  head: () => ({
    meta: [
      { title: "Support Research — Smart Algos & Financial Systems" },
      {
        name: "description",
        content:
          "Support independent quantitative research. Choose an amount in Kenyan Shillings or US Dollars. Secure Paystack checkout in KES.",
      },
      { property: "og:title", content: "Support Research — Smart Algos" },
      { property: "og:url", content: "https://www.smartalgosts.com/support" },
    ],
    links: [{ rel: "canonical", href: "https://www.smartalgosts.com/support" }],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { amount, thanks } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [copied, setCopied] = useState(false);
  const [showThanks, setShowThanks] = useState(!!thanks);

  useEffect(() => {
    if (!thanks) return;
    setShowThanks(true);
    const t = window.setTimeout(() => {
      setShowThanks(false);
      void navigate({ to: "/support", search: { amount }, replace: true });
    }, 5200);
    return () => window.clearTimeout(t);
  }, [thanks, amount, navigate]);

  async function copyLink() {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://smartalgosts.com";
    const url = `${origin}/support`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Support link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showThanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-rose-500/30 bg-[#0d121c] p-8 text-center shadow-[0_24px_80px_rgb(0_0_0_/_0.5)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute h-4 w-4 fill-rose-500/40 text-rose-500/40 animate-pulse"
                  style={{
                    left: `${12 + (i % 4) * 22}%`,
                    top: `${18 + Math.floor(i / 4) * 40}%`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
            <div className="relative mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-500/15 ring-2 ring-rose-500/40">
              <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
            </div>
            <h2 className="relative font-display text-2xl font-semibold">You kept the research going</h2>
            <p className="relative mt-3 text-sm text-muted-foreground leading-relaxed">
              Payment confirmed. Thank you for backing independent notebooks and Decision Math work.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowThanks(false);
                void navigate({ to: "/support", search: { amount }, replace: true });
              }}
              className="relative mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-500 px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-400 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 py-10 md:py-16 w-full">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <BrandLogo variant="auth" />
          </Link>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-rose-400 mb-3">
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> Support research
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Keep the work public</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Independent notebooks, systems references, and Decision Math notes stay public when people chip in. Choose
            an amount in Kenyan Shillings or US Dollars — checkout is charged in KSh via Paystack.
          </p>

          <div className="mt-8">
            <DonationForm initialUsd={amount} />
          </div>

          <button
            type="button"
            onClick={copyLink}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 min-h-12 rounded-lg border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Link copied" : "Copy shareable link"}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2 font-mono">smartalgosts.com/support</p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a voluntary contribution to support research — not an investment.{" "}
          <Link to="/disclaimers" className="text-gold hover:underline">
            Disclaimers
          </Link>
        </p>
      </div>
    </div>
  );
}

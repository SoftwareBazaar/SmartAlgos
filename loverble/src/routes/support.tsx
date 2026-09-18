import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Heart } from "lucide-react";
import { toast } from "sonner";
import { DonationForm } from "@/components/donation-form";
import { BrandLogo } from "@/components/brand-logo";

type SupportSearch = { amount?: number };

export const Route = createFileRoute("/support")({
  validateSearch: (search: Record<string, unknown>): SupportSearch => {
    const raw = Number(search.amount);
    return { amount: Number.isFinite(raw) && raw >= 1 ? raw : undefined };
  },
  head: () => ({
    meta: [
      { title: "Support Research — Smart Algos Capital" },
      {
        name: "description",
        content:
          "Support independent quantitative research. Choose an amount in Kenyan Shillings or US Dollars. Paystack checkout in KES.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { amount } = Route.useSearch();
  const [copied, setCopied] = useState(false);

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
      <div className="max-w-xl mx-auto px-6 py-10 md:py-16 w-full">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <BrandLogo variant="auth" />
          </Link>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-secondary-surface p-6 md:p-8">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gold mb-3">
            <Heart className="h-3.5 w-3.5" /> Support research
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Fund the next notebook</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Share this page with anyone. They choose the amount in Kenyan Shillings or US Dollars. Checkout is charged
            in KSh via Paystack.
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
          This is a voluntary contribution, not an investment.{" "}
          <Link to="/disclaimers" className="text-gold hover:underline">
            Disclaimers
          </Link>
        </p>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Smart Algos Capital" }] }),
  component: Terms,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Terms() {
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
          <FileText className="h-6 w-6 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: {updated}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-gold/40 bg-gold/5 p-5 text-sm">
        <strong className="text-foreground">Important:</strong> By using this platform you agree to these terms. Trading involves substantial risk of loss. We do not provide investment advice.
      </div>

      <Section title="1. Acceptance">
        <p>These Terms constitute a legally binding agreement between you and {company.operator} ("we", "us", "our"). By accessing the platform you agree to be bound by these terms. If you do not agree, do not use the platform.</p>
      </Section>

      <Section title="2. Services">
        <p>We provide quantitative research publications, strategy overviews, consultation services, and financial technology development. We do not provide personalised investment advice or manage funds on your behalf.</p>
      </Section>

      <Section title="3. Subscriptions & Payments">
        <ul className="list-disc list-inside space-y-1">
          <li>Subscriptions are billed in advance and automatically renew unless cancelled</li>
          <li>All fees are stated in USD and processed through our payment processor</li>
          <li>One-time report unlocks are non-refundable after delivery</li>
          <li>Price changes will be communicated with 30 days notice to existing subscribers</li>
        </ul>
      </Section>

      <Section title="4. Intellectual Property">
        <p>All research, algorithms, strategies, and platform content are the property of {company.operator}. You may not reproduce, distribute, or create derivative works without written permission. Your subscription grants you a personal, non-transferable licence to access the content.</p>
      </Section>

      <Section title="5. Prohibited Use">
        <p>You agree not to: share subscription credentials, scrape or copy research content, use the platform for illegal purposes, attempt unauthorised access, or misrepresent our research as your own work.</p>
      </Section>

      <Section title="6. Limitation of Liability">
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY TRADING LOSSES, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID IN THE PRIOR 12 MONTHS.</p>
      </Section>

      <Section title="7. Governing Law">
        <p>These Terms are governed by the laws of Kenya. Disputes shall be resolved through binding arbitration in accordance with Kenyan arbitration laws.</p>
      </Section>

      <Section title="8. Contact">
        <p>Legal enquiries: <a href="mailto:legal@smartalgos.com" className="text-gold hover:underline">legal@smartalgos.com</a></p>
        <p className="mt-1">{company.operator} · Embu, Kenya</p>
      </Section>
    </div>
  );
}

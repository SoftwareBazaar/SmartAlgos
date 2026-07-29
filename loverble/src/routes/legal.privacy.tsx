import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Smart Algos Capital" }] }),
  component: Privacy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Privacy() {
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
          <Shield className="h-6 w-6 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: {updated}</p>
        </div>
      </div>

      <Section title="Overview">
        <p>{company.operator} is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use this platform.</p>
      </Section>

      <Section title="Information We Collect">
        <p>We collect information you voluntarily provide — email address when subscribing or making a payment. We also collect standard usage data (IP address, browser type, pages visited) through our hosting infrastructure.</p>
        <p>We do not collect full payment card details. All payment processing is handled by a PCI-DSS compliant third-party processor.</p>
      </Section>

      <Section title="How We Use Your Information">
        <ul className="list-disc list-inside space-y-1">
          <li>To provide access to subscribed research and strategy content</li>
          <li>To send research updates and newsletters (you can unsubscribe at any time)</li>
          <li>To process payments and send receipts</li>
          <li>To improve the platform and diagnose technical issues</li>
          <li>To comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="Data Sharing">
        <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Payment processors (to handle transactions securely)</li>
          <li>Cloud infrastructure providers (for hosting and data storage)</li>
          <li>Legal authorities if required by law</li>
        </ul>
      </Section>

      <Section title="Data Security">
        <p>We use industry-standard security measures including TLS encryption in transit, AES-256 encryption at rest, and row-level security on our database. We conduct regular security reviews.</p>
      </Section>

      <Section title="Your Rights">
        <p>You may request access to, correction of, or deletion of your personal data by contacting us. If you are in the EU, you have additional rights under GDPR including the right to data portability and the right to withdraw consent.</p>
      </Section>

      <Section title="Cookies">
        <p>We use minimal cookies for session management and analytics. You can control cookies through your browser settings, though disabling them may affect platform functionality.</p>
      </Section>

      <Section title="Contact">
        <p>Privacy questions: <a href="mailto:privacy@smartalgos.com" className="text-gold hover:underline">privacy@smartalgos.com</a></p>
        <p className="mt-1">{company.operator} · Embu, Kenya</p>
      </Section>
    </div>
  );
}

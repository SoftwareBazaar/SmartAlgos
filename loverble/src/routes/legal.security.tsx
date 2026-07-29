import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowLeft } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/legal/security")({
  head: () => ({ meta: [{ title: "Security Policy — Smart Algos Capital" }] }),
  component: Security,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Security() {
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
          <Lock className="h-6 w-6 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Security Policy</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: {updated}</p>
        </div>
      </div>

      <Section title="Platform Security">
        <ul className="list-disc list-inside space-y-1">
          <li>All data in transit is encrypted using TLS 1.2 or higher</li>
          <li>Sensitive data at rest is encrypted using AES-256</li>
          <li>Passwords are hashed with bcrypt and never stored in plain text</li>
          <li>API keys and secrets are stored in encrypted vaults</li>
        </ul>
      </Section>

      <Section title="Infrastructure">
        <ul className="list-disc list-inside space-y-1">
          <li>Hosted on enterprise-grade cloud infrastructure (Supabase — SOC 2 Type II certified)</li>
          <li>Row-level security (RLS) policies ensure users only access their own data</li>
          <li>Firewalls and intrusion detection monitor all traffic</li>
          <li>Regular automated security scans and dependency vulnerability checks</li>
          <li>Automated backups with point-in-time recovery</li>
        </ul>
      </Section>

      <Section title="Payment Security">
        <p>We do not store full card numbers or CVV codes. All payment data is handled by a PCI-DSS Level 1 certified payment processor. Transactions are monitored for fraudulent activity in real time.</p>
      </Section>

      <Section title="Compliance Standards">
        <div className="flex flex-wrap gap-2 mt-2">
          {["GDPR", "PCI-DSS", "ISO 27001", "SOC 2", "AML/KYC"].map((s) => (
            <span key={s} className="inline-flex items-center px-2.5 py-1 rounded border border-gold/30 bg-gold/8 text-xs font-semibold text-gold">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-3">ISO 27001 and SOC 2 compliance is maintained through our infrastructure partner Supabase. GDPR compliance governs our handling of data for EU residents.</p>
      </Section>

      <Section title="Account Security Best Practices">
        <ul className="list-disc list-inside space-y-1">
          <li>Use a strong, unique password not reused elsewhere</li>
          <li>Never share your login credentials</li>
          <li>Log out when using shared or public devices</li>
          <li>Report suspicious activity immediately</li>
        </ul>
      </Section>

      <Section title="Responsible Disclosure">
        <p>If you discover a security vulnerability, please report it privately before public disclosure. We will acknowledge your report within 48 hours and work to resolve it promptly.</p>
        <p className="mt-2">Security reports: <a href="mailto:security@smartalgos.com" className="text-gold hover:underline">security@smartalgos.com</a></p>
      </Section>

      <Section title="Contact">
        <p>{company.operator} · Embu, Kenya</p>
        <p className="mt-1">Security: <a href="mailto:security@smartalgos.com" className="text-gold hover:underline">security@smartalgos.com</a></p>
      </Section>
    </div>
  );
}

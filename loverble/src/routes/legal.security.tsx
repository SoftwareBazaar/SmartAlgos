import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ArrowLeft, Shield, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/legal/security")({
  head: () => ({ meta: [{ title: "Security Policy — Smart Algos Capital" }] }),
  component: Security,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
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
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shrink-0">
          <Lock className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Security Policy</h1>
          <p className="text-xs text-muted-foreground mt-1">Smart Algos Capital · Smart Algos Investment Solution Ltd (Kenya) · Last updated: {updated}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gold/20 bg-gold/5 p-5 text-sm">
        <p className="text-foreground font-medium mb-2">Our commitment</p>
        <p>Smart Algos Investment Solution Ltd takes the security of your data, subscriptions, and payments seriously. We apply industry-standard security practices across our infrastructure and maintain transparency about what protections are in place.</p>
      </div>

      <Block title="1. Compliance Standards">
        <p>Our platform and infrastructure are designed to meet or align with the following standards:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {[
            { label: "GDPR", detail: "General Data Protection Regulation — governs data handling for EU/EEA users" },
            { label: "PCI-DSS", detail: "Payment Card Industry Data Security Standard — via Paystack (Level 1 certified)" },
            { label: "ISO 27001", detail: "Information Security Management — via Supabase infrastructure" },
            { label: "SOC 2 Type II", detail: "Service Organization Controls — via Supabase (certified)" },
            { label: "AML/KYC", detail: "Anti-Money Laundering / Know Your Customer — applied to payment processing" },
          ].map((b) => (
            <span key={b.label} title={b.detail} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-gold/30 bg-gold/8 text-xs font-semibold text-gold cursor-help">
              <CheckCircle className="h-3 w-3" />{b.label}
            </span>
          ))}
        </div>
      </Block>

      <Block title="2. Data Encryption">
        <ul className="list-disc list-inside space-y-1">
          <li>All data transmitted between your device and our servers is encrypted using TLS 1.2 or higher (HTTPS)</li>
          <li>Data stored in our database is encrypted at rest using AES-256</li>
          <li>Passwords and authentication tokens are never stored in plain text — bcrypt hashing with salt is used</li>
          <li>Sensitive environment variables (API keys, payment credentials) are stored in encrypted secret vaults and never committed to source code</li>
        </ul>
      </Block>

      <Block title="3. Infrastructure Security">
        <p>Smart Algos Capital is hosted on enterprise-grade cloud infrastructure:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Vercel</strong> — globally distributed edge hosting with DDoS protection and automated HTTPS</li>
          <li><strong className="text-foreground">Supabase</strong> — SOC 2 Type II certified database and authentication platform with row-level security (RLS) policies ensuring users can only access their own data</li>
          <li>Firewall rules and rate limiting are applied to all authentication and payment endpoints to prevent brute-force attacks</li>
          <li>Automated vulnerability scanning on every deployment detects known dependency weaknesses</li>
          <li>Database access is restricted to authorised services via private networking — no direct public database access is permitted</li>
          <li>Regular automated backups with point-in-time recovery capability</li>
        </ul>
      </Block>

      <Block title="4. Payment Security">
        <p>We do not handle, store, or transmit full payment card numbers, CVV codes, or other raw card data. All payment processing is handled end-to-end by <strong className="text-foreground">Paystack</strong>, a PCI-DSS Level 1 certified payment processor.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>We only receive a transaction reference and payment status from Paystack</li>
          <li>Paystack's payment pages use extended validation (EV) SSL certificates</li>
          <li>Transactions are monitored in real time for fraud and suspicious patterns</li>
          <li>Chargebacks and payment disputes are handled through Paystack's secure portal</li>
        </ul>
      </Block>

      <Block title="5. Access Controls">
        <ul className="list-disc list-inside space-y-1">
          <li>All administrative access to production systems requires multi-factor authentication (MFA)</li>
          <li>Internal access to user data follows the principle of least privilege — team members only access what they need for their role</li>
          <li>All administrative actions on user data are logged and auditable</li>
          <li>Admin sessions are memory-only and do not persist after browser close — they require re-authentication each session</li>
        </ul>
      </Block>

      <Block title="6. Security Monitoring">
        <ul className="list-disc list-inside space-y-1">
          <li>Automated monitoring for unusual login attempts, high request rates, and anomalous access patterns</li>
          <li>Rate limiting on authentication, subscription, and payment endpoints</li>
          <li>Dependency vulnerability alerts through automated package scanning on every build</li>
          <li>Error monitoring and alerting for unexpected server-side failures that could indicate exploitation attempts</li>
        </ul>
      </Block>

      <Block title="7. Incident Response">
        <p>In the event of a confirmed security breach affecting user data, we commit to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Notifying affected users within 72 hours of discovery, where required by applicable law</li>
          <li>Providing clear information about what data was affected, what we are doing to contain the incident, and what steps users should take</li>
          <li>Cooperating with relevant authorities and regulators as required</li>
          <li>Conducting a post-incident review and implementing corrective measures to prevent recurrence</li>
        </ul>
      </Block>

      <Block title="8. Your Responsibility">
        <p>Security is a shared responsibility. To protect your account:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use a strong, unique password not reused across other services</li>
          <li>Never share your login credentials or subscription access with others</li>
          <li>Log out after using the platform on shared or public devices</li>
          <li>Keep your registered email account secure — it is the primary recovery mechanism</li>
          <li>Report any suspicious activity or suspected unauthorised access immediately</li>
        </ul>
      </Block>

      <Block title="9. Responsible Disclosure">
        <p>If you discover a security vulnerability in Smart Algos Capital, we encourage responsible disclosure — please report it to us privately before disclosing it publicly so we can address it promptly.</p>
        <p><strong className="text-foreground">How to report:</strong> Email <a href="mailto:security@smartalgos.com" className="text-gold hover:underline">security@smartalgos.com</a> with a description of the vulnerability, steps to reproduce, and the potential impact. We will acknowledge your report within 48 business hours.</p>
        <p>We will not take legal action against researchers who report vulnerabilities in good faith and follow responsible disclosure practices.</p>
      </Block>

      <Block title="10. Contact">
        <p><strong className="text-foreground">Security reports:</strong> <a href="mailto:security@smartalgos.com" className="text-gold hover:underline">security@smartalgos.com</a></p>
        <p><strong className="text-foreground">General support:</strong> <a href="mailto:support@smartalgos.com" className="text-gold hover:underline">support@smartalgos.com</a></p>
        <p><strong className="text-foreground">Company:</strong> Smart Algos Investment Solution Ltd · Embu, Kenya</p>
      </Block>
    </div>
  );
}

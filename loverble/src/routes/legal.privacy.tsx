import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Smart Algos Capital" }] }),
  component: Privacy,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
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
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shrink-0">
          <Shield className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-1">Smart Algos Capital · Operated by Smart Algos Investment Solution Ltd (Kenya) · Last updated: {updated}</p>
        </div>
      </div>

      <Block title="1. Introduction">
        <p>Smart Algos Investment Solution Ltd ("Smart Algos", "we", "us", "our") operates Smart Algos Capital, a quantitative research and investment technology platform. We are committed to protecting the privacy of everyone who visits or subscribes to our platform.</p>
        <p>This Privacy Policy explains what personal data we collect, why we collect it, how we use it, and your rights in relation to it. By subscribing or using our platform you agree to this policy.</p>
      </Block>

      <Block title="2. What We Collect">
        <p><strong className="text-foreground">Email address</strong> — collected when you subscribe for free access to research and strategy content, or when you make a payment for premium reports or consultation.</p>
        <p><strong className="text-foreground">Payment data</strong> — we do not store card numbers or CVVs. All payment processing is handled by Paystack, a PCI-DSS Level 1 certified processor. We only receive a transaction reference and status confirmation.</p>
        <p><strong className="text-foreground">Usage data</strong> — standard server logs including IP address, browser type, pages visited, and access timestamps, collected automatically by our hosting infrastructure (Vercel, Supabase). This data is used for security monitoring and to improve the platform.</p>
        <p><strong className="text-foreground">Communication data</strong> — any messages you send to us via email or the contact form.</p>
      </Block>

      <Block title="3. How We Use Your Data">
        <ul className="list-disc list-inside space-y-1">
          <li>To provide you with access to subscribed research content and strategy data</li>
          <li>To send research updates, new publications, and platform announcements (you can unsubscribe from any email at any time)</li>
          <li>To process payments and send receipts</li>
          <li>To confirm and manage consultation bookings</li>
          <li>To respond to your enquiries and provide support</li>
          <li>To monitor platform security and detect fraudulent activity</li>
          <li>To comply with applicable laws and regulations</li>
        </ul>
        <p>We do not use your data for automated profiling or advertising, and we do not sell your data to third parties.</p>
      </Block>

      <Block title="4. Legal Basis for Processing (GDPR)">
        <p>For users in the European Economic Area, we process your data under the following legal bases:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Consent</strong> — for email subscriptions and marketing communications</li>
          <li><strong className="text-foreground">Contract performance</strong> — to deliver paid services you have purchased</li>
          <li><strong className="text-foreground">Legitimate interests</strong> — for platform security monitoring and fraud prevention</li>
          <li><strong className="text-foreground">Legal obligation</strong> — where required by applicable law</li>
        </ul>
      </Block>

      <Block title="5. Who We Share Data With">
        <p>We do not sell, trade, or rent your personal information. We share data only with:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Paystack</strong> — our payment processor (PCI-DSS compliant, processes payments securely)</li>
          <li><strong className="text-foreground">Supabase</strong> — our database and authentication provider (SOC 2 Type II certified, data stored in encrypted databases)</li>
          <li><strong className="text-foreground">Vercel</strong> — our hosting and deployment platform</li>
          <li><strong className="text-foreground">Email delivery services</strong> — to send transactional emails and newsletters</li>
          <li><strong className="text-foreground">Legal authorities</strong> — where we are required to disclose data by law, court order, or to protect our rights</li>
        </ul>
      </Block>

      <Block title="6. Data Retention">
        <p>We retain your email address and subscription records for as long as you remain subscribed. If you unsubscribe or request deletion, we will remove your data within 30 days, except where retention is required by law.</p>
        <p>Payment transaction records are retained for 7 years as required by financial regulations in Kenya.</p>
      </Block>

      <Block title="7. Security">
        <p>We implement industry-standard security measures:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>TLS 1.2+ encryption for all data in transit</li>
          <li>AES-256 encryption for data at rest</li>
          <li>Row-level security (RLS) in our database — users can only access their own data</li>
          <li>Regular security reviews and dependency vulnerability scanning</li>
        </ul>
        <p>No method of electronic storage is 100% secure. While we take all reasonable steps to protect your data, we cannot guarantee absolute security.</p>
      </Block>

      <Block title="8. Cookies">
        <p>We use minimal cookies for session management and basic analytics. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though this may affect platform functionality.</p>
      </Block>

      <Block title="9. Your Rights">
        <p>You have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">Access</strong> — request a copy of the data we hold about you</li>
          <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate or incomplete data</li>
          <li><strong className="text-foreground">Deletion</strong> — request deletion of your data (subject to legal retention obligations)</li>
          <li><strong className="text-foreground">Opt-out</strong> — unsubscribe from marketing emails at any time using the unsubscribe link in any email</li>
          <li><strong className="text-foreground">Portability</strong> — receive your data in a machine-readable format (GDPR users)</li>
          <li><strong className="text-foreground">Objection</strong> — object to processing based on legitimate interests (GDPR users)</li>
        </ul>
        <p>To exercise any of these rights, contact us at the address below.</p>
      </Block>

      <Block title="10. International Transfers">
        <p>Our infrastructure providers (Vercel, Supabase) may store or process data in the United States or other jurisdictions. When this occurs, appropriate safeguards are in place, including standard contractual clauses where required by applicable law.</p>
      </Block>

      <Block title="11. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify subscribers of material changes by email. The "Last updated" date at the top of this page reflects the most recent revision.</p>
      </Block>

      <Block title="12. Contact">
        <p>For privacy enquiries, data requests, or to exercise your rights:</p>
        <p><strong className="text-foreground">Email:</strong> <a href="mailto:privacy@smartalgos.com" className="text-gold hover:underline">privacy@smartalgos.com</a></p>
        <p><strong className="text-foreground">Company:</strong> Smart Algos Investment Solution Ltd</p>
        <p><strong className="text-foreground">Location:</strong> Embu, Kenya</p>
      </Block>
    </div>
  );
}

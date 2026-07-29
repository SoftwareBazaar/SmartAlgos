import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Smart Algos Capital" }] }),
  component: Terms,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
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
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 shrink-0">
          <FileText className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
          <p className="text-xs text-muted-foreground mt-1">Smart Algos Capital · Operated by Smart Algos Investment Solution Ltd (Kenya) · Last updated: {updated}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-gold/40 bg-gold/5 p-5 text-sm">
        <strong className="text-foreground">Important:</strong> By accessing or using Smart Algos Capital you agree to these Terms of Service in full. If you do not agree, you must not use the platform. Trading involves substantial risk of loss. We do not provide investment advice.
      </div>

      <Block title="1. About Smart Algos Capital">
        <p>Smart Algos Capital is a quantitative research and investment technology platform operated by Smart Algos Investment Solution Ltd, a company registered in Kenya. The platform provides access to quantitative research publications, strategy performance data, consultation services, and financial technology content.</p>
        <p>We are not a hedge fund, asset manager, broker-dealer, or registered investment adviser. We do not manage money on behalf of clients and do not provide personalised investment advice.</p>
      </Block>

      <Block title="2. Acceptance of Terms">
        <p>By subscribing (providing your email), accessing any gated content, or making a payment, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.</p>
        <p>You must be at least 18 years old and legally capable of entering into binding agreements in your jurisdiction to use this platform.</p>
      </Block>

      <Block title="3. Free Subscription">
        <p>A free email subscription gives you access to research summaries, strategy overviews, and performance data on the platform. This subscription:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Requires only your email address — no payment card is needed</li>
          <li>May include receipt of research update emails from Smart Algos Capital</li>
          <li>Can be cancelled at any time by unsubscribing or contacting us</li>
          <li>Does not grant access to premium full research reports or paid consultation sessions</li>
        </ul>
      </Block>

      <Block title="4. Paid Services">
        <p>We offer paid products including individual research report unlocks, live strategy subscriptions, and consultation sessions. For paid services:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All prices are stated in US Dollars (USD) unless otherwise specified</li>
          <li>Payment is processed by Paystack, a PCI-DSS compliant payment processor</li>
          <li>One-time report unlocks are non-refundable once the report content has been delivered</li>
          <li>Recurring subscriptions renew automatically and can be cancelled before the next renewal date</li>
          <li>Consultation session fees are non-refundable once the session has been confirmed and the meeting link issued</li>
          <li>Price changes will be communicated with at least 30 days' notice to existing subscribers</li>
        </ul>
      </Block>

      <Block title="5. Refund Policy">
        <p>Due to the nature of digital content and advisory services:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Research report unlocks are non-refundable after delivery of the content</li>
          <li>Consultation fees are non-refundable once the session has been confirmed</li>
          <li>If a session is cancelled by us, a full refund will be issued within 5–10 business days</li>
          <li>If you experience a technical issue preventing access to content you have paid for, contact us within 7 days and we will resolve it or issue a refund</li>
        </ul>
        <p>To request a refund or report an issue, email <a href="mailto:support@smartalgos.com" className="text-gold hover:underline">support@smartalgos.com</a>.</p>
      </Block>

      <Block title="6. Intellectual Property">
        <p>All research notes, strategy content, performance data, algorithms, platform design, and other materials on Smart Algos Capital are the intellectual property of Smart Algos Investment Solution Ltd and are protected by copyright and other applicable laws.</p>
        <p>Your subscription grants you a personal, non-transferable, non-exclusive licence to access the content for your own use. You may not:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Reproduce, redistribute, or republish our research without written permission</li>
          <li>Share account credentials or subscription access with others</li>
          <li>Scrape, copy, or systematically extract content from the platform</li>
          <li>Present our research as your own work</li>
          <li>Use content for commercial purposes beyond your personal reference</li>
        </ul>
      </Block>

      <Block title="7. Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Attempt to gain unauthorised access to any part of the platform or its infrastructure</li>
          <li>Use the platform for any unlawful purpose or in violation of any applicable laws</li>
          <li>Transmit malware, viruses, or any harmful code</li>
          <li>Interfere with the operation of the platform or other users' access</li>
          <li>Create multiple accounts to circumvent subscription restrictions</li>
          <li>Misrepresent your identity or affiliation</li>
        </ul>
      </Block>

      <Block title="8. Disclaimers">
        <p>The content on Smart Algos Capital is for informational and educational purposes only. Nothing on this platform constitutes financial, investment, tax, or legal advice. See our <Link to="/disclaimers" className="text-gold hover:underline">Disclaimers</Link> for the full risk disclosure.</p>
        <p>The platform is provided on an "as is" basis without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
      </Block>

      <Block title="9. Limitation of Liability">
        <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SMART ALGOS INVESTMENT SOLUTION LTD AND ITS OFFICERS, DIRECTORS, AND CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY TRADING LOSSES, INVESTMENT LOSSES, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR RELIANCE ON ITS CONTENT.</p>
        <p>Our total liability to you for any claim arising from these Terms or the platform shall not exceed the amount you paid us in the 12 months preceding the claim. If you have not made any payments, our total liability shall not exceed $10 USD.</p>
      </Block>

      <Block title="10. Termination">
        <p>We reserve the right to suspend or terminate your access to the platform at any time if you violate these Terms, engage in abusive or fraudulent conduct, or if we reasonably believe your use creates risk or legal exposure for us.</p>
        <p>You may cancel your subscription at any time. Cancellation will take effect at the end of the current subscription period.</p>
      </Block>

      <Block title="11. Governing Law">
        <p>These Terms are governed by and construed in accordance with the laws of Kenya. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Kenya, or resolved through binding arbitration under Kenyan arbitration law at our election.</p>
      </Block>

      <Block title="12. Changes to These Terms">
        <p>We may update these Terms from time to time. Material changes will be communicated to subscribers by email. Your continued use of the platform after such changes constitutes acceptance of the updated Terms.</p>
      </Block>

      <Block title="13. Contact">
        <p><strong className="text-foreground">Email:</strong> <a href="mailto:legal@smartalgos.com" className="text-gold hover:underline">legal@smartalgos.com</a></p>
        <p><strong className="text-foreground">Company:</strong> Smart Algos Investment Solution Ltd</p>
        <p><strong className="text-foreground">Location:</strong> Embu, Kenya</p>
      </Block>
    </div>
  );
}



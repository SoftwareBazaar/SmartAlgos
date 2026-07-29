import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/legal/disclaimers")({
  head: () => ({ meta: [{ title: "Disclaimers — Smart Algos Capital" }] }),
  component: Disclaimers,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Disclaimers() {
  const updated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
      <Link to="/legal" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Legal
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Disclaimers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Last updated: {updated}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-bear/40 bg-bear/5 p-5 text-sm">
        <strong className="text-foreground">Critical Risk Warning:</strong> Trading financial instruments involves
        substantial risk of loss and is not suitable for all investors. You may lose all or more than your initial
        investment. Past performance is not indicative of future results.
      </div>

      <Section title="No Investment Advice">
        <p>Nothing on this platform constitutes financial, investment, tax, or legal advice. All content — including research, strategies, signals, and commentary — is provided for informational and educational purposes only.</p>
        <p>{company.operator} is not a registered investment adviser or broker-dealer. Always seek qualified financial advice before making any investment decisions.</p>
      </Section>

      <Section title="Trading Risk">
        <ul className="list-disc list-inside space-y-1">
          <li>Markets can move rapidly and unpredictably, causing significant losses</li>
          <li>Leverage amplifies both gains and losses</li>
          <li>You may lose your entire invested capital</li>
          <li>Forex, cryptocurrency, and derivatives carry especially high risk</li>
          <li>Liquidity risk may prevent exiting positions at desired prices</li>
          <li>Technical failures may affect order execution</li>
        </ul>
        <p className="font-medium text-foreground mt-2">Only trade with capital you can afford to lose entirely.</p>
      </Section>

      <Section title="Automated Systems & Strategies">
        <p>Strategies and algorithmic systems displayed on this platform do not guarantee profitability. Past backtested or live results do not guarantee future performance. Strategies may perform differently under varying market conditions.</p>
      </Section>

      <Section title="Performance Data">
        <p>Performance figures shown are for informational purposes only. They may be based on backtested data (which is hypothetical and subject to look-ahead bias), may not account for all fees and slippage, and are not independently audited unless explicitly stated.</p>
      </Section>

      <Section title="Third-Party Content">
        <p>We may reference third-party platforms, data providers, or research. We do not endorse or take responsibility for the accuracy of third-party content or the services of linked platforms.</p>
      </Section>

      <Section title="Jurisdictional">
        <p>This platform may not be appropriate in all jurisdictions. It is your responsibility to ensure use of the platform complies with local laws and regulations applicable to you.</p>
      </Section>

      <Section title="Contact">
        <p>Legal enquiries: <a href="mailto:legal@smartalgos.com" className="text-gold hover:underline">legal@smartalgos.com</a></p>
        <p className="mt-1">{company.operator} · Embu, Kenya</p>
      </Section>
    </div>
  );
}

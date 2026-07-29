import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/disclaimers")({
  head: () => ({ meta: [{ title: "Disclaimers — Smart Algos Capital" }] }),
  component: Disclaimers,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-6 space-y-3">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
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
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
          <AlertTriangle className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold">Disclaimers</h1>
          <p className="text-xs text-muted-foreground mt-1">Smart Algos Capital · Smart Algos Investment Solution Ltd (Kenya) · Last updated: {updated}</p>
        </div>
      </div>

      <div className="rounded-lg border-2 border-red-500/40 bg-red-500/5 p-6 text-sm space-y-2">
        <p className="font-semibold text-foreground text-base">Critical Risk Warning</p>
        <p>Trading and investing in financial instruments involves a <strong className="text-foreground">substantial risk of loss</strong> and is not suitable for all investors. You may lose all or more than your initial investment. Past performance is not indicative of future results. Read all disclaimers carefully before using this platform or acting on any content.</p>
      </div>

      <Block title="1. No Investment Advice">
        <p>Nothing published on Smart Algos Capital constitutes financial, investment, tax, or legal advice. All content — including research notes, strategy summaries, performance data, equity curves, market commentary, and consultation guidance — is provided solely for informational and educational purposes.</p>
        <p>Smart Algos Investment Solution Ltd is not a registered investment adviser, stockbroker, portfolio manager, or financial planner in Kenya, the European Union, the United States, or any other jurisdiction. The information we publish reflects our independent quantitative research and is not tailored to your individual financial circumstances, goals, or risk tolerance.</p>
        <p>Before making any investment or trading decision, you should seek independent professional financial advice from a qualified adviser regulated in your jurisdiction.</p>
      </Block>

      <Block title="2. Trading Risk Disclosure">
        <p>The following risks are inherent in trading and investing. By using this platform you acknowledge all of them:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>Financial markets can move rapidly and unpredictably, leading to significant losses in a short period</li>
          <li>Leverage and margin products amplify both potential gains and potential losses — you may lose more than you deposit</li>
          <li>You may lose your entire invested capital</li>
          <li>Forex, contracts for difference (CFDs), cryptocurrency, and derivatives are especially high-risk instruments</li>
          <li>Slippage, spread widening, and order execution delays can result in worse outcomes than expected, particularly around high-impact news events</li>
          <li>Counterparty and broker risk: the financial soundness of a broker or exchange may affect your funds independently of market movements</li>
          <li>Liquidity risk: you may be unable to exit a position at the desired price, especially in thin or volatile markets</li>
          <li>Currency risk: gains or losses may be affected by exchange rate movements if your account is denominated in a different currency</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Only trade or invest with capital you can afford to lose entirely. Never trade with borrowed money or funds needed for essential living expenses.</p>
      </Block>

      <Block title="3. Automated Strategies and Expert Advisors">
        <p>Smart Algos Capital develops and publishes quantitative trading strategies including automated Expert Advisors (EAs). In relation to these:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Strategies are algorithmic tools — they do not guarantee profitability under any market conditions</li>
          <li>Backtested results are hypothetical and subject to look-ahead bias, overfitting, and data-snooping. They do not represent what actually occurred or what will occur in live trading</li>
          <li>Live performance results shown on the platform may include periods of favourable market conditions that may not persist</li>
          <li>Strategies may perform well in certain market regimes and poorly in others — drawdown periods are expected and normal</li>
          <li>Technical failures, internet connectivity issues, broker outages, and platform downtime can cause strategies to execute incorrectly or not at all</li>
          <li>You are solely responsible for monitoring any automated system running on your account and for all trades executed by it</li>
          <li>Always test any strategy in a demo account for a meaningful period before deploying with real capital</li>
        </ul>
      </Block>

      <Block title="4. Performance Data Disclaimer">
        <p>Performance figures, equity curves, win rates, Sharpe ratios, profit factors, and other metrics shown on this platform:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Are for informational purposes only and are not a guarantee or promise of future results</li>
          <li>Where labelled "illustrative" or "composite", figures are modelled approximations and not actual account results</li>
          <li>Where live figures are linked to QuantConnect or other third-party verification platforms, those figures are subject to the terms and accuracy standards of those platforms</li>
          <li>Do not account for all applicable costs including but not limited to: broker spreads, commissions, swap rates, slippage, and taxes</li>
          <li>Have not been independently audited or verified by a regulated third-party auditor unless explicitly stated</li>
          <li>Reflect performance under specific historical market conditions which may not recur</li>
        </ul>
      </Block>

      <Block title="5. Third-Party Content and Links">
        <p>Smart Algos Capital may reference or link to third-party platforms including but not limited to QuantConnect, Collective2, prop trading firms (Funding Pips, Funded Next, FTMO, MyForexFunds, The5ers, Topstep), and brokers.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>We do not endorse, control, or guarantee the accuracy, completeness, or reliability of any third-party content</li>
          <li>Mention of a prop firm or broker does not constitute a recommendation to trade with that firm</li>
          <li>We are not responsible for losses arising from your use of third-party platforms or services</li>
          <li>Third-party links are provided for reference only and may change or become unavailable without notice</li>
        </ul>
      </Block>

      <Block title="6. Platform Availability">
        <p>We strive to maintain consistent access to Smart Algos Capital but do not guarantee uninterrupted availability:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>The platform may be unavailable during scheduled or unscheduled maintenance</li>
          <li>Technical failures, infrastructure outages, or third-party service interruptions may temporarily affect access</li>
          <li>Real-time data feeds may be delayed or unavailable at times</li>
          <li>We are not liable for losses resulting from platform downtime or data unavailability</li>
        </ul>
      </Block>

      <Block title="7. Jurisdictional Disclaimer">
        <p>Smart Algos Capital is operated from Kenya and is intended primarily for users in Africa and internationally who can legally access and use financial research services. It is your responsibility to ensure that your access and use of this platform complies with all laws and regulations applicable in your jurisdiction, including any restrictions on receiving financial information or trading signals.</p>
        <p>This platform is not directed at or intended for use by persons in jurisdictions where such use would be illegal or require registration or licensing that we do not hold.</p>
      </Block>

      <Block title="8. Forward-Looking Statements">
        <p>Some content on this platform may include forward-looking statements, projections, or targets. These reflect our current research expectations and are subject to significant uncertainty. Actual outcomes may differ materially from any projections made. We do not undertake to update forward-looking statements as circumstances change.</p>
      </Block>

      <Block title="9. Contact">
        <p>For questions about these disclaimers:</p>
        <p><strong className="text-foreground">Email:</strong> <a href="mailto:legal@smartalgos.com" className="text-gold hover:underline">legal@smartalgos.com</a></p>
        <p><strong className="text-foreground">Company:</strong> Smart Algos Investment Solution Ltd · Embu, Kenya</p>
      </Block>
    </div>
  );
}



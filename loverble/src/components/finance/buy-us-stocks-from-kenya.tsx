import type { ReactNode } from "react";
import { AdSlot } from "@/components/finance/ad-slot";
import { Link } from "@tanstack/react-router";

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display text-xl md:text-2xl font-semibold text-foreground pt-2 scroll-mt-24">
      {children}
    </h2>
  );
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground pt-1">{children}</h3>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">{children}</p>;
}

function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
      {children}
    </aside>
  );
}

function TableWrap({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[600px] text-sm">
        <caption className="text-left px-4 pt-3 pb-2 text-[13px] font-semibold text-foreground">
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-2.5 font-medium text-muted-foreground border-b border-border/60 text-left align-top">
      {children}
    </th>
  );
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2.5 border-b border-border/40 text-muted-foreground align-top">{children}</td>;
}

function RowHead({ children }: { children: ReactNode }) {
  return (
    <th
      scope="row"
      className="px-4 py-2.5 border-b border-border/40 text-left align-top font-semibold text-foreground whitespace-nowrap"
    >
      {children}
    </th>
  );
}

function Sup({ n, href }: { n: number; href: string }) {
  return (
    <sup>
      <a href={href} className="text-gold hover:underline text-[11px] no-underline">
        [{n}]
      </a>
    </sup>
  );
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
      {children}
    </a>
  );
}

export function BuyUsStocksFromKenya() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <P>
          US-listed stocks such as those on the Nasdaq and NYSE are open to Kenyan residents through two broad routes: a
          Kenyan-facing app that routes orders to US broker partners, or a global broker where you open an account
          directly
          <Sup n={3} href="#s3" />. Neither route is better for everyone. The right choice depends on how much you
          invest, how you want to fund the account, and how much investor protection you want inside Kenya.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="compare">Hisa and Interactive Brokers compared</H2>
        <TableWrap caption="Two common routes for Kenyan residents">
          <thead>
            <tr>
              <Th />
              <Th>Hisa</Th>
              <Th>Interactive Brokers (IBKR)</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <RowHead>What it is</RowHead>
              <Td>
                Kenyan-facing app covering US stocks and ETFs plus Nairobi Securities Exchange (NSE) shares, with
                fractional shares and KES and USD wallets. Published by Rise Vest Technologies Limited
                <Sup n={1} href="#s1" />.
              </Td>
              <Td>
                Global broker that accepts Kenyan residents and offers a wide range of US stocks
                <Sup n={3} href="#s3" />.
              </Td>
            </tr>
            <tr>
              <RowHead>Funding</RowHead>
              <Td>
                Mobile money and in-app wallets, per the app listing and press reports
                <Sup n={1} href="#s1" />.
              </Td>
              <Td>Mainly bank wire (SWIFT). Your Kenyan bank’s wire fee and currency conversion apply.</Td>
            </tr>
            <tr>
              <RowHead>Regulation</RowHead>
              <Td>
                The app listing says it operates in line with Capital Markets Authority (CMA) requirements
                <Sup n={1} href="#s1" />. An earlier version of the product was reported to have a CMA no-objection
                through a licensed broker partner
                <Sup n={2} href="#s2" />. Confirm the current position on the CMA register.
              </Td>
              <Td>
                A foreign broker is outside Kenyan investor-protection schemes
                <Sup n={4} href="#s4" />. Check which IBKR entity holds your account and its home-country protections.
              </Td>
            </tr>
            <tr>
              <RowHead>Suits</RowHead>
              <Td>Small, regular purchases and investors who prefer a mobile app.</Td>
              <Td>Hands-on investors who want the widest choice and can handle bank wires.</Td>
            </tr>
            <tr>
              <RowHead>Official site</RowHead>
              <Td>
                <Ext href="https://hisa.co">hisa.co</Ext>
              </Td>
              <Td>
                <Ext href="https://www.interactivebrokers.com">interactivebrokers.com</Ext>
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Fees differ between sources and change over time, so we do not quote them. Use each provider’s own fee page,
          and see “Total cost” below.
        </p>

        <H3>A note on Hisa</H3>
        <P>
          Hisa has changed ownership and branding in recent years, and the current app was relaunched in 2026 under Rise
          Vest Technologies
          <Sup n={1} href="#s1" />. Store ratings for the new app were mixed when we checked in May 2026, so read recent
          user reviews and test with a small amount first.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="steps">Step by step</H2>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Check the licence.</strong> For any Kenya-based provider, look it up on
            the CMA register at <Ext href="https://www.cma.or.ke">cma.or.ke</Ext> before you deposit. For a foreign
            broker, check its home regulator instead.
          </li>
          <li>
            <strong className="text-foreground">Open the account and verify your identity.</strong> Expect ID and
            proof-of-address checks.
          </li>
          <li>
            <strong className="text-foreground">Complete the US tax form.</strong> Non-US investors usually sign a
            W-8BEN (
            <Ext href="https://www.irs.gov/forms-pubs/about-form-w-8-ben">IRS guidance</Ext>)
            <Sup n={4} href="#s4" />.
          </li>
          <li>
            <strong className="text-foreground">Fund the account.</strong> Start with an amount you can afford to lose
            entirely, and check the conversion rate you are given.
          </li>
          <li>
            <strong className="text-foreground">Place the order.</strong> Search the ticker and use a limit order, which
            caps the price you will pay. Market orders can fill far from the last price in a fast market.
          </li>
          <li>
            <strong className="text-foreground">Keep records.</strong> Save trade confirmations and statements for your
            KRA filings.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <H2 id="hours">Trading hours in EAT</H2>
        <P>
          The US cash session runs 9:30 to 16:00 New York time. In winter (US standard time) that is{" "}
          <strong className="text-foreground">17:30 to 00:00 EAT</strong>. During US daylight saving time it is{" "}
          <strong className="text-foreground">16:30 to 23:00 EAT</strong>. Newly listed stocks may open later than 9:30,
          because the exchange sets the first-trade time.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="trading">Investing versus active trading</H2>
        <P>
          Buying a stock to hold and trading in and out are different activities with different costs. Frequent trading
          multiplies commissions, conversion spreads and wire fees, and each round trip must overcome them before you
          profit. A few points apply to active traders:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Settlement.</strong> US stock trades settle one business day after the
            trade (T+1), so sale proceeds are not always available instantly in a cash account.
          </li>
          <li>
            <strong className="text-foreground">Margin and day-trading rules.</strong> Margin accounts add borrowing
            costs and US rules such as the pattern day trader rule may limit frequent trading in small accounts. These
            rules have been under review, so ask your broker for the current requirements.
          </li>
          <li>
            <strong className="text-foreground">Practice first.</strong> Use a demo or paper account to test your
            process before risking money.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <H2 id="brokers">Using other brokers</H2>
        <P>
          Hisa and Interactive Brokers are not the only options. Before you open an account with any other broker, run
          the same checks:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Licence.</strong> Online forex and CFD brokers serving Kenya need a CMA
            licence under the Capital Markets (Online Foreign Exchange Trading) Regulations, 2017, and the CMA has
            warned about unlicensed platforms
            <Sup n={5} href="#s5" />. Reports name licensed brokers such as EGM Securities (FX Pesa), SCFM (Scope
            Markets) and Pepperstone Markets Kenya, and the register changes, so confirm on{" "}
            <Ext href="https://www.cma.or.ke">cma.or.ke</Ext>
            <Sup n={6} href="#s6" />.
          </li>
          <li>
            <strong className="text-foreground">What the licence covers.</strong> A forex licence does not mean the firm
            sells you real shares. Ask whether you would own the stock or hold a CFD.
          </li>
          <li>
            <strong className="text-foreground">Regulator and custody.</strong> For a foreign broker, find its home
            regulator, whether client money is segregated and what protection applies. Kenyan schemes may not cover it
            <Sup n={4} href="#s4" />.
          </li>
          <li>
            <strong className="text-foreground">Funding and withdrawals.</strong> Check the deposit and withdrawal
            methods, fees and processing times, and test a small withdrawal early.
          </li>
          <li>
            <strong className="text-foreground">Red flags.</strong> Walk away from guaranteed returns, pressure to
            deposit quickly, “signal” sellers who ask you to fund an account they control, and any firm you cannot find
            on a regulator’s register.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <H2 id="tradingview">Using TradingView</H2>
        <P>
          TradingView is a charting, screening and alerts platform, not a broker. You can use it alone to analyse a stock
          and paper trade, or connect a supported broker and place orders from the chart
          <Sup n={7} href="#s7" />. Search for the ticker with the right exchange, for example{" "}
          <strong className="text-foreground">ANT</strong> on Nasdaq, so you do not chart a similarly named symbol.
        </P>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            Open a chart on <Ext href="https://www.tradingview.com">tradingview.com</Ext> and click the Trade button in
            the upper-right corner
            <Sup n={7} href="#s7" />.
          </li>
          <li>
            Choose your broker from the list of integrated brokers and log in with your broker credentials
            <Sup n={7} href="#s7" />.
          </li>
          <li>
            Place and manage orders from the chart, or keep TradingView for analysis and trade in your broker’s own app.
          </li>
        </ol>
        <P>
          Interactive Brokers and Pepperstone are among the brokers reported as supported
          <Sup n={8} href="#s8" />
          <Sup n={9} href="#s9" />. We could not confirm that Hisa is on TradingView’s list, so check the list in the
          Trade panel. Three practical points: free plans may show delayed prices for some exchanges, so check the data
          options before you rely on a chart; some broker connections have their own conditions; and an indicator signal
          is not a trade recommendation.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="cost">Total cost</H2>
        <P>The broker’s commission is only one part. Add these when you compare:</P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>the currency conversion spread between KES and USD, on the way in and the way out</li>
          <li>bank wire fees or mobile-money charges</li>
          <li>any platform or inactivity fee</li>
          <li>
            US withholding tax on dividends, which reports put at 30% for Kenyan residents
            <Sup n={4} href="#s4" />
          </li>
        </ul>
        <P>
          On a small purchase, a fixed wire fee can cost more than the commission. That is one reason app-based routes
          with mobile-money funding suit small amounts, while a wire to a global broker suits larger ones.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="tax">Tax and reporting</H2>
        <P>
          How foreign-listed shares are taxed in Kenya, including gains and dividends, is a matter for the{" "}
          <Ext href="https://www.kra.go.ke">Kenya Revenue Authority</Ext> and a qualified tax professional. We do not
          give tax advice here. Rules change, so check the current position before you file.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="cfds">Shares are not CFDs</H2>
        <P>
          Buying a share through a stockbroker means you own the share. Contracts for difference (CFDs) only track its
          price, usually with leverage and overnight financing charges, and many retail CFD accounts lose money. If a
          provider offers “stocks” on a forex-style platform, check which one you are getting.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="faq">Common questions</H2>
        <H3>Can I buy US stocks from Kenya?</H3>
        <P>
          Yes. Kenyan residents can use a Kenyan app that offers US stocks or a global broker that accepts Kenyan
          clients
          <Sup n={3} href="#s3" />.
        </P>
        <H3>How much do I need to start?</H3>
        <P>
          It depends on the platform. Fractional-share apps allow very small purchases, while a wire to a global broker
          is usually worth doing for larger amounts. Check the current minimums.
        </P>
        <H3>Can I use TradingView with Hisa?</H3>
        <P>
          We could not confirm that Hisa is an integrated broker on TradingView. You can still use TradingView for
          charts and alerts and place the order in the Hisa app.
        </P>
        <H3>Can I buy a stock on its first day of trading?</H3>
        <P>
          Often yes in the open market, but availability of a new ticker can lag on some platforms. Confirm that the
          ticker is listed on your platform before you plan around it.
        </P>
      </section>

      <Note>
        <strong className="text-gold">Educational research only.</strong> This is not personalized investment, tax or
        credit advice, and Smart Algos Investment Solution Ltd is not a licensed investment adviser. Links go to
        official provider sites and are not recommendations. If we add referral or affiliate links in future, we will
        disclose them here. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </Note>

      <section className="space-y-3">
        <H2 id="sources">Sources</H2>
        <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          <li id="s1">
            <Ext href="https://apps.apple.com/ke/app/hisa/id6760774430">
              Apple App Store (Kenya): Hisa listing, Rise Vest Technologies Limited
            </Ext>
          </li>
          <li id="s2">
            <Ext href="https://hapakenya.com/2021/12/07/hisa-app-to-enable-kenyans-to-invest-in-us-stocks-etfs">
              HapaKenya: Hisa CMA no-objection and broker partners (2021)
            </Ext>
          </li>
          <li id="s3">
            <Ext href="https://kenyammfcalculator.co.ke/how-to-trade-global-stocks-from-kenya/">
              Kenyan MMF Calculator: how to trade global stocks from Kenya
            </Ext>
          </li>
          <li id="s4">
            <Ext href="https://nashthuo.com/how-to-buy-us-stocks-from-kenya/">
              Nash Thuo: how to buy US stocks from Kenya
            </Ext>
          </li>
          <li id="s5">
            <Ext href="https://www.cmarcp.or.ke/images/Docs/news/OnlineForex.pdf">
              Capital Markets Authority: cautionary statement on online forex trading by unlicensed entities
            </Ext>
          </li>
          <li id="s6">
            <Ext href="https://serrarigroup.com/?p=46733">
              Serrari: CMA warning and list of licensed online forex brokers
            </Ext>
          </li>
          <li id="s7">
            <Ext href="https://vn.tradingview.com/support/solutions/43000784715/">
              TradingView Support: finding your broker on TradingView
            </Ext>
          </li>
          <li id="s8">
            <Ext href="https://nexusfi.com/a/platforms/tradingview-broker-integration">
              NexusFi: TradingView broker integration
            </Ext>
          </li>
          <li id="s9">
            <Ext href="https://tradingbeasts.com/how-to-connect-broker-to-tradingview/">
              TradingBeasts: how to connect a broker to TradingView
            </Ext>
          </li>
        </ol>
      </section>
    </div>
  );
}

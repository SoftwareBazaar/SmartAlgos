import type { ReactNode } from "react";
import { AdSlot } from "@/components/finance/ad-slot";
import { Link } from "@tanstack/react-router";
import { US_ANTHROPIC_IPO_SLUG, US_BUY_STOCKS_KE_SLUG } from "@/lib/finance-notes";

function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-display text-xl md:text-2xl font-semibold text-foreground pt-2 scroll-mt-24">
      {children}
    </h2>
  );
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

function Brief({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-xl border border-border/60 border-l-4 border-l-gold bg-card/30 px-4 py-4 text-sm text-muted-foreground leading-relaxed">
      {children}
    </aside>
  );
}

function TableWrap({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[560px] text-sm tabular-nums">
        <caption className="text-left px-4 pt-3 pb-2 text-[13px] font-semibold text-foreground">
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-2.5 font-medium text-muted-foreground border-b border-border/60 ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

type CellTone = "up" | "down" | "flat" | "pivot";

const TONE: Record<CellTone, string> = {
  up: "text-emerald-400 font-semibold",
  down: "text-rose-400 font-semibold",
  flat: "text-amber-200/90 font-medium",
  pivot: "text-gold font-semibold",
};

function Td({
  children,
  right,
  strong,
  tone,
}: {
  children: ReactNode;
  right?: boolean;
  strong?: boolean;
  tone?: CellTone;
}) {
  return (
    <td
      className={`px-4 py-2.5 border-b border-border/40 ${right ? "text-right" : "text-left"} ${
        tone ? TONE[tone] : strong ? "font-semibold text-foreground" : "text-muted-foreground"
      }`}
    >
      {children}
    </td>
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

function Formula({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border/60 bg-card/40 px-4 py-3 font-mono text-[13px] md:text-sm text-foreground/90 leading-relaxed">
      {children}
    </pre>
  );
}

export function Nov20SellOffAnalysis() {
  return (
    <div className="space-y-8 text-foreground">
      <Brief>
        <p className="font-semibold text-gold mb-2">In brief</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">Established:</strong> the S&amp;P 500 fell 3.7% to 6,910.39, its seventh
            straight loss. The Nasdaq Composite fell 5.3%, and the VIX rose 26% to 35.89
            <Sup n={1} href="#s1" />
            <Sup n={4} href="#s4" />.
          </li>
          <li>
            <strong className="text-foreground">The rate story needs care:</strong> the 10-year Treasury yield{" "}
            <em className="text-foreground">fell</em> 12 basis points to 4.92% that day
            <Sup n={4} href="#s4" />. Elevated yields are background, not Friday’s trigger.
          </li>
          <li>
            <strong className="text-foreground">Immediate catalyst:</strong> Nvidia fell 14% after Reuters reported that
            SEC staff are examining its accounting. Reuters said the probe does not establish wrongdoing
            <Sup n={3} href="#s3" />.
          </li>
          <li>
            <strong className="text-foreground">Volatility feedback is plausible but unmeasured:</strong> we found no
            public data showing how much systematic selling occurred.
          </li>
          <li>
            <strong className="text-foreground">Defensives held up best but still fell on the week:</strong> all 11
            sector funds ended the week lower
            <Sup n={3} href="#s3" />.
          </li>
        </ul>
      </Brief>

      <section className="space-y-4">
        <H2 id="facts">What happened</H2>
        <TableWrap caption="Closing data, Friday 20 Nov 2026">
          <thead>
            <tr>
              <Th>Measure</Th>
              <Th right>Close</Th>
              <Th right>Friday</Th>
              <Th right>Week</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td strong>S&amp;P 500</Td>
              <Td right>6,910.39</Td>
              <Td right tone="down">
                −3.70%
              </Td>
              <Td right tone="down">
                −8.6%
              </Td>
            </tr>
            <tr>
              <Td strong>Nasdaq Composite</Td>
              <Td right>22,617.73</Td>
              <Td right tone="down">
                −5.28%
              </Td>
              <Td right tone="down">
                −10.0%
              </Td>
            </tr>
            <tr>
              <Td>Dow Jones Industrial Average</Td>
              <Td right>48,147.33</Td>
              <Td right tone="down">
                −1.93%
              </Td>
              <Td right tone="down">
                −8.0%
              </Td>
            </tr>
            <tr>
              <Td>Russell 2000</Td>
              <Td right>2,581.79</Td>
              <Td right tone="down">
                −2.76%
              </Td>
              <Td right tone="down">
                −7.5%
              </Td>
            </tr>
            <tr>
              <Td>VIX</Td>
              <Td right tone="pivot">
                35.89
              </Td>
              <Td right tone="down">
                +26.2%
              </Td>
              <Td right>—</Td>
            </tr>
            <tr>
              <Td>10-year Treasury yield</Td>
              <Td right>4.92%</Td>
              <Td right tone="up">
                −12 bp
              </Td>
              <Td right tone="flat">
                about −20 bp
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Sources: <a href="#s2" className="text-gold hover:underline">[2]</a>,{" "}
          <a href="#s3" className="text-gold hover:underline">[3]</a>,{" "}
          <a href="#s4" className="text-gold hover:underline">[4]</a>,{" "}
          <a href="#s7" className="text-gold hover:underline">[7]</a>. Sources differ slightly on the 10-year
          (4.91–4.95%) depending on the cut-off time.
        </p>

        <P>
          Both the S&amp;P 500 and the Dow closed more than 10% below their records, the usual definition of a
          correction
          <Sup n={2} href="#s2" />. The S&amp;P ended 11.6% under its 6 October record close
          <Sup n={3} href="#s3" />. It was the S&amp;P’s worst week since April 2025, and the Dow’s worst since March
          2020
          <Sup n={2} href="#s2" />
          <Sup n={3} href="#s3" />. For the year, the Nasdaq Composite is down 2.7%, while the S&amp;P 500 is still up
          0.9% and the Dow up 0.2%
          <Sup n={8} href="#s8" />.
        </P>
        <P>
          The damage was concentrated. Technology fell about 7% on the day, and the Philadelphia Semiconductor Index
          fell 10.7%
          <Sup n={9} href="#s9" />. Nvidia closed at $125.53 (−14.01%), AMD fell 13.25% and Micron 13.89%
          <Sup n={10} href="#s10" />. Decliners outnumbered advancers 376 to 123 in the S&amp;P 500, and consumer
          staples, up 0.67%, was the only sector to rise
          <Sup n={4} href="#s4" />. Anthropic (ANT) fell 8.5% to $88.91 on its second day, after a gain of about 17% on
          its debut
          <Sup n={6} href="#s6" />
          <Sup n={7} href="#s7" />. That is still above the $83 IPO price. Our{" "}
          <Link
            to="/finance/us/$slug"
            params={{ slug: US_ANTHROPIC_IPO_SLUG }}
            className="text-gold hover:underline"
          >
            IPO note
          </Link>{" "}
          covers the terms; Kenyan investors can see{" "}
          <Link
            to="/finance/us/$slug"
            params={{ slug: US_BUY_STOCKS_KE_SLUG }}
            className="text-gold hover:underline"
          >
            how to buy US stocks via Hisa or IBKR
          </Link>
          .
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="drivers">Four explanations, tested</H2>
        <P>
          Most commentary offers a single cause. The evidence supports several partial ones, and some rest on thin
          support.
        </P>
        <TableWrap caption="Evidence for and against each explanation">
          <thead>
            <tr>
              <Th>Explanation</Th>
              <Th>What supports it</Th>
              <Th>What limits it</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>
                <strong className="text-foreground">Nvidia accounting report</strong>
              </Td>
              <Td>
                Nvidia fell 14.01% on the Reuters report, its worst day since January 2025, and AMD, Micron and Broadcom
                fell 12–14%
                <Sup n={3} href="#s3" />
                <Sup n={9} href="#s9" />.
              </Td>
              <Td>
                The report does not establish wrongdoing. Nvidia had already lost about 10% earlier in the week despite
                beating on revenue and guidance
                <Sup n={3} href="#s3" />.
              </Td>
            </tr>
            <tr>
              <Td>
                <strong className="text-foreground">AI valuation anxiety</strong>
              </Td>
              <Td>
                Analysts quoted on the day framed the week as an earnings test the chips passed and a valuation test the
                AI IPO did not
                <Sup n={5} href="#s5" />.
              </Td>
              <Td>
                This is commentary, not a measurement. ANT closing above its IPO price weakens the idea that the IPO
                alone drove it.
              </Td>
            </tr>
            <tr>
              <Td>
                <strong className="text-foreground">High rates</strong>
              </Td>
              <Td>
                The 10-year had closed above 5% for six sessions before Friday
                <Sup n={6} href="#s6" />. One report put the odds of a December Fed hike above 90%
                <Sup n={12} href="#s12" />.
              </Td>
              <Td>
                On Friday the yield fell as investors bought Treasuries, which signals a flight to safety. A rate shock
                does not explain that day.
              </Td>
            </tr>
            <tr>
              <Td>
                <strong className="text-foreground">Year-end positioning</strong>
              </Td>
              <Td>
                One strategist said investors were trying to keep their gains for the year
                <Sup n={5} href="#s5" />.
              </Td>
              <Td>A single quote, with no flow data behind it.</Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          <strong className="text-foreground">Our reading:</strong> the week combined a chip-sector shock, anxiety about
          AI valuations and a high-rate backdrop. Friday’s speed came from a specific catalyst meeting a fragile market.
          Assigning percentages to each cause would claim more precision than the data allows.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="duration">Equity duration: why long-dated growth is rate-sensitive</H2>
        <P>
          A stock’s price is the discounted value of its future cash flows. If cash flows grow at a constant rate{" "}
          <code className="rounded border border-border/50 bg-card/40 px-1.5 py-0.5 font-mono text-[12px]">g</code> and
          are discounted at{" "}
          <code className="rounded border border-border/50 bg-card/40 px-1.5 py-0.5 font-mono text-[12px]">r</code>, the
          Gordon growth formula gives:
        </P>
        <Formula>{`P₀ = CF₁ / (r − g)        D = −∂ln P / ∂r = 1 / (r − g)`}</Formula>
        <P>
          Duration D is the percentage price change for a one-unit change in r, and it depends on the spread r − g. The
          narrower the spread, the more of the value sits in distant cash flows and the more sensitive the price is to
          the discount rate. This is why high-growth equities are described as long-duration.
        </P>
        <TableWrap caption="Stylized example: a +0.50 percentage point rise in r, with g unchanged">
          <thead>
            <tr>
              <Th>r − g</Th>
              <Th right>Duration (years)</Th>
              <Th right>First-order price change</Th>
              <Th right>Exact price change</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>3% (growth-heavy)</Td>
              <Td right tone="pivot">
                33.3
              </Td>
              <Td right tone="down">
                −16.7%
              </Td>
              <Td right tone="down">
                −14.3%
              </Td>
            </tr>
            <tr>
              <Td>5% (index-like)</Td>
              <Td right>20.0</Td>
              <Td right tone="down">
                −10.0%
              </Td>
              <Td right tone="down">
                −9.1%
              </Td>
            </tr>
            <tr>
              <Td>10% (cash-generative)</Td>
              <Td right>10.0</Td>
              <Td right tone="down">
                −5.0%
              </Td>
              <Td right tone="down">
                −4.8%
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Smart Algos calculation. The first-order figure is D × 0.5%. The exact figure compares 1/(r − g) before and
          after, which captures convexity. These are illustrations, not estimates for any actual stock or sector.
        </p>
        <P>
          <strong className="text-foreground">The limits of the argument.</strong> The sensitivity holds only if g does
          not change. If yields rise because growth expectations rise, g rises with r and the effect shrinks. If yields
          rise because of inflation or a higher required return, the full effect applies. Duration therefore explains{" "}
          <em>why</em> long-dated stocks react strongly to rates, but it cannot show that rates caused this sell-off.
          And on Friday itself, yields fell while growth stocks fell hardest.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="vol">Volatility feedback: the mechanism and its limits</H2>
        <P>Volatility-targeting and some risk-parity strategies set exposure from estimated volatility. A common rule is:</P>
        <Formula>{`weight = min( max_weight , target_vol / estimated_vol )`}</Formula>
        <TableWrap caption="Hypothetical equity weight under a 10% volatility target">
          <thead>
            <tr>
              <Th>Estimated volatility</Th>
              <Th right>Equity weight</Th>
              <Th right>Cut from 100%</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>10%</Td>
              <Td right tone="up">
                100%
              </Td>
              <Td right>0%</Td>
            </tr>
            <tr>
              <Td>15%</Td>
              <Td right tone="flat">
                67%
              </Td>
              <Td right tone="down">
                −33%
              </Td>
            </tr>
            <tr>
              <Td>25%</Td>
              <Td right tone="down">
                40%
              </Td>
              <Td right tone="down">
                −60%
              </Td>
            </tr>
            <tr>
              <Td>36% ≈ Friday VIX</Td>
              <Td right tone="down">
                28%
              </Td>
              <Td right tone="down">
                −72%
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">Smart Algos calculation of the rule itself, not of any actual fund.</p>
        <P>
          Volatility also clusters: large moves tend to follow large moves. A standard model captures this with{" "}
          <code className="rounded border border-border/50 bg-card/40 px-1.5 py-0.5 font-mono text-[12px]">
            σ²ₜ = ω + α·r²ₜ₋₁ + β·σ²ₜ₋₁
          </code>
          , where α + β is typically close to 1 for equity indices, so a shock to volatility fades slowly. If falling
          prices raise estimated volatility, rule-based funds sell, which can push prices lower still. That is the
          feedback loop.
        </P>
        <P>
          <strong className="text-foreground">What we cannot show.</strong> Three points keep this from being a
          conclusion. First, the VIX is an <em>implied</em> volatility measure and most funds use <em>realized</em>{" "}
          volatility over a window, so their estimates move more slowly than the VIX. Second, the VIX closed on Thursday
          at about 28.4, so markets were already stressed before Friday; it was not a calm market that suddenly broke
          <Sup n={5} href="#s5" />. If a fund had used the VIX as its input, the move from 28.4 to 35.9 would have cut
          its equity weight by about <strong className="text-gold">21%</strong>, a meaningful but not dramatic amount
          (our calculation). Third, we found no public data on actual volatility-fund or trend-follower flows on 20
          November. The mechanism is real. Its size on this day is unknown.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="defensives">Defensives: what held up, and the crowding question</H2>
        <P>
          Consumer staples rose 0.67% on Friday, led by Walmart (+1.52% to $127.95) and Costco (+0.76%), with Johnson
          &amp; Johnson and Procter &amp; Gamble up about 1%
          <Sup n={1} href="#s1" />
          <Sup n={10} href="#s10" />. Three caveats matter:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Relative, not absolute.</strong> For the week, staples fell 2.05%, the
            best of 11 sectors, against a 12.5% fall in technology
            <Sup n={3} href="#s3" />. Defensives lost less. They were not unscathed.
          </li>
          <li>
            <strong className="text-foreground">Not all rotation.</strong> Walmart had raised its outlook the day
            before, so part of its gain reflects company news
            <Sup n={11} href="#s11" />.
          </li>
          <li>
            <strong className="text-foreground">Possible crowding.</strong> Costco, Coca-Cola and Procter &amp; Gamble
            hit 52-week highs on 16 November while the market fell
            <Sup n={11} href="#s11" />. When many investors seek safety in the same names, valuations can stretch and
            later returns depend more on mean reversion than on the defensive label. That is a hypothesis to monitor. We
            have not measured crowding.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <H2 id="models">Ideas for model builders, not rules</H2>
        <P>
          The sell-off suggests three areas worth testing. None has been backtested here, and we make no performance
          claim.
        </P>
        <ol className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Rate-sensitivity filter.</strong> Scale growth exposure down when the
            10-year yield exceeds a threshold, for example{" "}
            <code className="rounded border border-border/50 bg-card/40 px-1.5 py-0.5 font-mono text-[12px]">
              exp(−γ · D · max(0, Y₁₀ − Y*))
            </code>
            . The threshold Y* and the coefficient γ are free parameters, so they invite overfitting. Yields were above
            5% for six sessions before Friday, so a threshold near 4.5–5% would have been tripped earlier. Whether that
            would have helped is untested.
          </li>
          <li>
            <strong className="text-foreground">VIX regime switch.</strong> Halve exposure when the VIX is 25–35 and go
            to cash above 35. Note that the VIX closed at 35.89, so this rule would have moved to cash only after an
            11.6% drawdown. Rules like this risk selling near lows and missing rebounds, so test them with transaction
            costs and out-of-sample data.
          </li>
          <li>
            <strong className="text-foreground">Crowding and valuation filter.</strong> Cap a defensive factor when a
            crowding z-score exceeds +2.0 and its valuation spread to the 10-year median exceeds +1.5 standard
            deviations. Both thresholds are illustrative.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <H2 id="watch">What to watch next</H2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Whether the 10-year yield stays below 5% or returns above it.</li>
          <li>Whether the VIX falls back below 30 or holds above 35.</li>
          <li>Further reporting on the Nvidia inquiry, and whether the chip selloff extends.</li>
          <li>
            Anthropic’s trading relative to its $83 IPO price, and its expected Nasdaq-100 entry on 21 December (see our{" "}
            <Link
              to="/finance/us/$slug"
              params={{ slug: US_ANTHROPIC_IPO_SLUG }}
              className="text-gold hover:underline"
            >
              IPO note
            </Link>
            ).
          </li>
        </ul>
      </section>

      <Note>
        <strong className="text-gold">Educational research only.</strong> This is not personalized investment, tax or
        credit advice, and Smart Algos Investment Solution Ltd is not a licensed investment adviser. Models and examples
        are illustrations, not forecasts. Closing figures come from press summaries and should be checked against
        official exchange data before any decision. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </Note>

      <section className="space-y-4">
        <H2 id="method">Method and corrections</H2>
        <P>
          Facts carry a bracketed source number. Anything marked “our calculation” is derived here and the working is
          shown. We did not include claims we could not tie to a source. If you find an error, write to{" "}
          <a href="mailto:desk@smartalgosts.com" className="text-gold hover:underline">
            desk@smartalgosts.com
          </a>{" "}
          and we will correct it and log the change here.
        </P>
        <P>
          <strong className="text-foreground">Update log:</strong> 21 Nov 2026 — first publication.
        </P>
      </section>

      <section className="space-y-3">
        <H2 id="sources">Sources</H2>
        <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          <li id="s1">
            <Ext href="https://www.cnbc.com/amp/2026/11/19/stock-market-today-live-updates.html">
              CNBC: S&amp;P 500 and Dow close in correction (20 Nov live coverage)
            </Ext>
          </li>
          <li id="s2">
            <Ext href="https://www.upi.com/Top_News/US/2026/11/20/stocks-dow-jones-nasdaq-correction-territory/1061795214998/">
              UPI: Dow, S&amp;P 500 enter correction as Nasdaq plunges
            </Ext>
          </li>
          <li id="s3">
            <Ext href="https://theglassdesk.substack.com/p/weekly-market-review-nov-20-2026">
              The Glass Desk: Weekly Market Review, 20 Nov 2026
            </Ext>
          </li>
          <li id="s4">
            <Ext href="https://cappnotes.substack.com/p/closing-look-friday-november-20-2026">
              Capp Notes: Closing Look, Friday 20 Nov 2026
            </Ext>
          </li>
          <li id="s5">
            <Ext href="https://finance.yahoo.com/markets/stocks/articles/nasdaq-plunges-5-day-anthropic-211724232.html">
              Yahoo Finance: Nasdaq plunges 5% a day after Anthropic debut
            </Ext>
          </li>
          <li id="s6">
            <Ext href="https://finance.yahoo.com/markets/crypto/articles/anthropic-bitcoin-both-falling-where-123100764.html">
              Yahoo Finance: Anthropic and Bitcoin are both falling
            </Ext>
          </li>
          <li id="s7">
            <Ext href="https://newsable.asianetnews.com/markets/the-weekly-spread-what-shaped-us-treasury-yields-and-the-dollar-this-week-articleshow-op4hz6e">
              The Weekly Spread: US Treasury yields and the dollar, week ending 20 Nov
            </Ext>
          </li>
          <li id="s8">
            <Ext href="https://www.nacionale.com/en/articles/is-the-stock-market-down-for-the-year-2026-sp-500-dow-nasdaq-year-to-date-november-20">
              AP data via Nacionale: year-to-date index performance
            </Ext>
          </li>
          <li id="s9">
            <Ext href="https://www.theclosingprint.net/2026/11/post-market-and-weekly-summary-2026-11-20/">
              The Closing Print: post-market and weekly summary, 20 Nov
            </Ext>
          </li>
          <li id="s10">
            <Ext href="https://avaloncapitalresearch.substack.com/p/closing-bell-chip-stocks-sink-as">
              Avalon Capital Research: Closing Bell, 20 Nov
            </Ext>
          </li>
          <li id="s11">
            <Ext href="https://www.nacionale.com/en/articles/what-are-defensive-stocks-walmart-consumer-staples-rose-market-fell-november-20">
              Nacionale: why Walmart and other staples rose on 20 Nov
            </Ext>
          </li>
          <li id="s12">
            <Ext href="https://economy.com.pk/wall-streets-ai-reckoning-nasdaq-erases-2026-gains-as-anthropics-historic-ipo-fails-to-halt-tech-rout/">
              The Economy: Nasdaq erases 2026 gains (cites CME FedWatch; single secondary source)
            </Ext>
          </li>
        </ol>
      </section>
    </div>
  );
}

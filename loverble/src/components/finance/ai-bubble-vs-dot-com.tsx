import type { ReactNode } from "react";
import { AdSlot } from "@/components/finance/ad-slot";
import { Link } from "@tanstack/react-router";
import {
  US_ANTHROPIC_IPO_SLUG,
  US_NOV20_SELL_OFF_SLUG,
} from "@/lib/finance-notes";

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
      <table className="w-full min-w-[600px] text-sm tabular-nums">
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
      className={`px-4 py-2.5 border-b border-border/40 align-top ${right ? "text-right" : "text-left"} ${
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

export function AiBubbleVsDotCom() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <P>
          <strong className="text-foreground">
            In March 2000, Cisco was worth about $450 billion, briefly the most valuable company on earth, and it was
            making billions in profit.
          </strong>
          <Sup n={24} href="#s24" /> Within three years the Nasdaq had fallen 78%. Today’s AI leaders are profitable
          too. This year the four biggest hyperscalers plan to spend about $730 billion on data centres, and in the
          latest quarter that spending ran ahead of the cash they earned. So is this the same story with better balance
          sheets, or a genuinely different one? The answer is both, and the split matters for anyone who owns an index
          fund.
        </P>
      </section>

      <Brief>
        <p className="font-semibold text-gold mb-2">The thesis in five lines</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-foreground">The common claim is half right.</strong> AI leaders do have real
            revenue, profits and cash flow. But the dot-com bubble was not “just startups”: Cisco and Lucent were large
            and profitable too.
          </li>
          <li>
            <strong className="text-foreground">Where AI is genuinely different:</strong> earnings, valuations (on most
            measures) and demand are stronger than in 2000.
          </li>
          <li>
            <strong className="text-foreground">Where it rhymes:</strong> capex is outrunning cash flow, assets lose
            value faster, some financing is circular, and the market is more concentrated than in 2000.
          </li>
          <li>
            <strong className="text-foreground">The risk is not “no revenue”.</strong> It is revenue that grows more
            slowly than the cost of the build.
          </li>
          <li>
            <strong className="text-foreground">Our verdict:</strong> not a repeat of 2000, but not immune. The weak
            points are financing and capex, not earnings.
          </li>
        </ul>
      </Brief>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="premise">1. The premise needs fixing: the dot-com bust hit profitable companies</H2>
        <P>
          The dot-com era’s best-known failures, such as Pets.com, were profitless startups. The boom’s centre of
          gravity was not. Telecom equipment makers and networking companies earned billions while building the
          internet’s infrastructure.
        </P>
        <TableWrap caption="Two dot-com leaders in fiscal 2000">
          <thead>
            <tr>
              <Th>Company</Th>
              <Th right>Revenue</Th>
              <Th right>Net income</Th>
              <Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td strong>Cisco Systems</Td>
              <Td right>$18.93B</Td>
              <Td right tone="up">
                $2.67B
              </Td>
              <Td>
                Pro forma net income $3.91B. Revenue up 55%
                <Sup n={1} href="#s1" />.
              </Td>
            </tr>
            <tr>
              <Td strong>Lucent Technologies</Td>
              <Td right>$33.81B</Td>
              <Td right tone="up">
                $1.22B
              </Td>
              <Td>
                Income from continuing operations $1.68B
                <Sup n={2} href="#s2" />
                <Sup n={3} href="#s3" />.
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          Then the cycle turned. The S&amp;P 500 fell 49.1% from its 24 March 2000 close of 1,527.46 to 776.76 on 9
          October 2002
          <Sup n={4} href="#s4" />. The Nasdaq Composite fell 78.4%, from 5,048.62 on 10 March 2000 to 1,114.11 on 9
          October 2002, and took until April 2015 to regain its peak. Lucent’s own filings show how fast profit
          evaporated: revenue in its December 2000 quarter fell to $5.84B from $8.07B a year earlier, and it recorded a
          net loss
          <Sup n={5} href="#s5" />. Profitable companies can still be overbuilt, overfinanced and overvalued.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="different">2. Where AI genuinely differs</H2>
        <TableWrap caption="Measured differences between the two eras">
          <thead>
            <tr>
              <Th>Dimension</Th>
              <Th>Dot-com peak (1999–2000)</Th>
              <Th>AI era (2026)</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Share of S&amp;P 500 earnings from tech</Td>
              <Td>About half today’s share in Q1 2000</Td>
              <Td>
                Over 25% of trailing net income, almost twice the Q1 2000 share
                <Sup n={6} href="#s6" />
              </Td>
            </tr>
            <tr>
              <Td>Tech-sector forward P/E</Td>
              <Td>Almost 50x</Td>
              <Td>
                29.5x (2025 reading)
                <Sup n={7} href="#s7" />
              </Td>
            </tr>
            <tr>
              <Td>Real revenue at the frontier</Td>
              <Td>Mostly telecom and enterprise spending</Td>
              <Td>
                Company-stated run-rates: Anthropic about $81B (31 Oct), OpenAI about $50B (30 Sept)
                <Sup n={8} href="#s8" />
                <Sup n={9} href="#s9" />
              </Td>
            </tr>
            <tr>
              <Td>Profit engine</Td>
              <Td>Equipment sales into a debt-funded customer base</Td>
              <Td>
                Alphabet Q3 2026: revenue $127.6B (+25%), operating margin 31.8%
                <Sup n={10} href="#s10" />
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Run-rates are company statements, not audited revenue, and definitions differ. OpenAI’s figure was corrected
          from $68–70B to about $50B after partner gross revenue was counted
          <Sup n={9} href="#s9" />. Anthropic’s S-1 sets out its own definition
          <Sup n={8} href="#s8" />.
        </p>
        <P>
          This is the part of the bull case that holds up. These are earnings, not promises. The measure where today
          looks similar to 2000 is the Shiller CAPE: it peaked near 44 in December 1999 and stood at 38.8 on 12
          November, before last week’s sell-off
          <Sup n={11} href="#s11" />. On forward earnings the S&amp;P 500 traded at 19.0x in JPMorgan’s autumn guide
          against a 30-year average of 17.2x
          <Sup n={12} href="#s12" />.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="rhyme">3. Where the two eras rhyme</H2>
        <H3>Capex is now larger than the cash that funds it</H3>
        <P>
          The four biggest hyperscalers have guided to $720–740B of 2026 capex: Amazon about $220B, Alphabet $195–205B,
          Microsoft about $170B and Meta $135–145B
          <Sup n={13} href="#s13" />. In Q3 2026 their combined capex ran at about 115% of operating cash flow, up from
          61% a year earlier
          <Sup n={14} href="#s14" />.
        </P>
        <TableWrap caption="Q3 2026 capex versus operating cash flow">
          <thead>
            <tr>
              <Th>Company</Th>
              <Th right>Capex ($B)</Th>
              <Th right>Operating cash flow ($B)</Th>
              <Th right>Capex / cash flow</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Amazon</Td>
              <Td right>77.3</Td>
              <Td right>42.4</Td>
              <Td right tone="down">
                182%
              </Td>
            </tr>
            <tr>
              <Td>Alphabet</Td>
              <Td right>51.4</Td>
              <Td right>42.3</Td>
              <Td right tone="down">
                121%
              </Td>
            </tr>
            <tr>
              <Td>Meta</Td>
              <Td right>34.9</Td>
              <Td right>32.8</Td>
              <Td right tone="flat">
                106%
              </Td>
            </tr>
            <tr>
              <Td>Microsoft</Td>
              <Td right>39.4</Td>
              <Td right>58.0</Td>
              <Td right tone="up">
                68%
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Figures use cash capex as compiled from the companies’ Q3 reports
          <Sup n={15} href="#s15" />. Companies define capex and free cash flow differently, so totals vary by source
          ($202–209B for the quarter).
        </p>
        <P>
          Alphabet’s free cash flow was negative $9.1B, and its stock fell 12.6% on the day it reported
          <Sup n={15} href="#s15" />. Only Microsoft’s cash flow covered its spending. Counter-evidence exists:
          Alphabet reports a $561B cloud backlog
          <Sup n={10} href="#s10" />. A backlog is contracted demand, not cash, and part of it comes from AI labs that
          are themselves cash-negative.
        </P>

        <H3>Concentration is higher than in 2000</H3>
        <P>
          The ten largest S&amp;P 500 companies made up about 27–29% of the index at the March 2000 peak
          <Sup n={4} href="#s4" />
          <Sup n={16} href="#s16" />. In November 2026 they made up 39.2%, after a record 41.7% in October 2025
          <Sup n={17} href="#s17" />. The tech sector’s weight reached a record above 39% in June, against roughly
          33–35% in 2000
          <Sup n={6} href="#s6" />. Passive investors now hold more of the same trade than they did in 2000.
        </P>

        <H3>Vendor financing: then and now</H3>
        <P>
          At 30 September 2000 Lucent had committed about $6.7B of credit to customers, roughly 20% of its fiscal 2000
          revenue, with about $1.3B actually advanced and $1.4B of customer-debt guarantees
          <Sup n={2} href="#s2" />. When customers failed, the losses came back to the supplier. Winstar, which Lucent
          had financed, sued it for $10B in April 2001
          <Sup n={18} href="#s18" />. Today’s parallel is the web of cross-investments between chip makers, clouds and
          labs. Reports describe Nvidia’s plan to invest up to $100B in OpenAI and a $6.3B capacity backstop for
          CoreWeave, and whether those loops inflate demand is contested. We did not verify those deals against filings,
          so treat them as reported.
        </P>

        <H3>Assets that lose value faster</H3>
        <P>
          Fibre laid in 1999 was usable for decades, so overbuilding left cheap capacity that the later internet used.
          Hyperscalers book servers over roughly five to six years, and each chip generation can make the last one less
          competitive. Overbuilding in GPUs may therefore turn into write-downs faster than overbuilding in fibre did.
          That is an argument, not an observed outcome.
        </P>

        <H3>Frontier labs: real revenue, bigger losses</H3>
        <P>
          OpenAI booked $13.07B of revenue in 2025 with an operating loss of $20.92B
          <Sup n={19} href="#s19" />. A plan reported by the Financial Times shows $278B of cumulative negative free
          cash flow over 2026–2030
          <Sup n={20} href="#s20" />. Anthropic’s S-1/A reports 9M 2026 revenue of $33.24B, a GAAP operating loss of
          $1.26B, adjusted operating income of $4.08B and operating cash flow of $6.57B, alongside about $900.9B of
          compute commitments
          <Sup n={8} href="#s8" />. Our{" "}
          <Link
            to="/finance/us/$slug"
            params={{ slug: US_ANTHROPIC_IPO_SLUG }}
            className="text-gold hover:underline"
          >
            IPO note
          </Link>{" "}
          covers those figures.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="math">4. The math: what revenue does the build need?</H2>
        <P>
          Sequoia’s David Cahn framed the test in 2024
          <Sup n={21} href="#s21" />. Take Nvidia’s annual revenue, double it to cover the full data-centre cost (power,
          buildings, networking), then double again so that end customers pay roughly twice the compute cost, which
          leaves a 50% gross margin:
        </P>
        <Formula>{`Required end-user revenue ≈ Nvidia revenue × 2 × 2
2024:  $150B × 4 = $600B
Today: $215.9B (FY2026) × 4 ≈ $864B`}</Formula>
        <p className="text-xs text-muted-foreground">
          Our calculation. The $215.9B figure is Nvidia’s fiscal 2026 revenue as given in our research notebook; we did
          not verify it against Nvidia’s filing. The multipliers are Sequoia’s assumptions, and the formula treats all
          Nvidia revenue as AI infrastructure.
        </p>
        <P>
          Two readings follow. First, the bar has risen as spending grew. Second, the “$500B gap” that circulated in
          2024 assumed end-user AI revenue of $75–100B. Two labs alone now report run-rates of roughly $131B combined,
          though those include resale through clouds and some overlap, so they are not a clean offset. The revenue gap
          is smaller than the headline, but it is not closed.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="failures">5. Failure points: what broke in 2000 and what to watch now</H2>
        <TableWrap caption="Failure mechanisms compared">
          <thead>
            <tr>
              <Th>Mechanism</Th>
              <Th>2000–2002</Th>
              <Th>2026 indicator</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td strong>Customers cannot repay</Td>
              <Td>Carriers financed by vendors defaulted (Winstar)</Td>
              <Td>
                Lab cash burn against commitments; whether IPO windows stay open. Anthropic has listed. OpenAI’s CEO has
                ruled out an IPO in 2026
                <Sup n={9} href="#s9" />.
              </Td>
            </tr>
            <tr>
              <Td strong>Tighter money</Td>
              <Td>Fed raised rates six times, from 4.75% to 6.50%, between June 1999 and May 2000</Td>
              <Td>
                Fed hiked in September 2026 for the first time since 2023 and held at 3.75–4.00% on 28 Oct, with markets
                pricing another hike
                <Sup n={22} href="#s22" />. The 10-year yield was 4.92% on 20 Nov.
              </Td>
            </tr>
            <tr>
              <Td strong>Capex outruns cash</Td>
              <Td>Debt-funded telecom builders spent more than they earned</Td>
              <Td>
                Combined capex at 115% of operating cash flow in Q3, negative free cash flow at three of four
                hyperscalers
                <Sup n={14} href="#s14" />
              </Td>
            </tr>
            <tr>
              <Td strong>Accounting questions</Td>
              <Td>Restatements and probes followed the bust (Lucent, Enron, WorldCom)</Td>
              <Td>
                Reports of an SEC examination at Nvidia, which does not establish wrongdoing. See our{" "}
                <Link
                  to="/finance/us/$slug"
                  params={{ slug: US_NOV20_SELL_OFF_SLUG }}
                  className="text-gold hover:underline"
                >
                  sell-off analysis
                </Link>
                .
              </Td>
            </tr>
            <tr>
              <Td strong>Asset obsolescence</Td>
              <Td>Limited, because fibre kept its value</Td>
              <Td>Faster GPU generations against 5–6 year book lives</Td>
            </tr>
            <tr>
              <Td strong>Weak enterprise payback</Td>
              <Td>Monetization lagged infrastructure</Td>
              <Td>
                Contested evidence: McKinsey reports broad use, while an MIT study says most pilots show no P&amp;L
                impact. The study’s method has been criticised.
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          One correction to common commentary: the Fed ended quantitative tightening on 1 December 2025, so
          balance-sheet runoff is not currently draining liquidity
          <Sup n={23} href="#s23" />.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="scenarios">6. Scenarios (illustrative arithmetic, not forecasts)</H2>
        <P>
          We start with the S&amp;P 500’s forward P/E of 19.0x and ask what return each path implies over three years.
          Earnings growth rates are our assumptions, and no probabilities can be sourced, so we assign none.
        </P>
        <TableWrap caption="Three-year paths for the S&P 500">
          <thead>
            <tr>
              <Th>Path</Th>
              <Th>Assumptions</Th>
              <Th right>Result</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>
                <span className="text-emerald-400 font-semibold">Bull:</span> build pays off
              </Td>
              <Td>P/E stays 19.0x. Earnings grow 12% a year.</Td>
              <Td right tone="up">
                +40.5% (about 12% a year)
              </Td>
            </tr>
            <tr>
              <Td>
                <span className="text-amber-200 font-semibold">Base:</span> digestion
              </Td>
              <Td>P/E eases to 17.2x, the 30-year average. Earnings grow 8% a year.</Td>
              <Td right tone="flat">
                +14.0% (about 4.5% a year)
              </Td>
            </tr>
            <tr>
              <Td>
                <span className="text-rose-400 font-semibold">Bear:</span> overbuild unwinds
              </Td>
              <Td>P/E falls to 15x and earnings fall 18%.</Td>
              <Td right tone="down">
                −35.3%
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground">
          Bear case: (15 / 19.0) × 0.82 = 0.647. Base case: (17.2 / 19.0) × 1.08³ = 1.140. Bull case: 1.12³ = 1.405.
        </p>
        <P>
          Even our bear case is shallower than the 49.1% S&amp;P 500 fall from 2000 to 2002 because it assumes earnings
          dip but do not collapse. A deeper outcome would need a larger earnings loss, which would depend on financing
          stress spreading beyond the AI trade.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="verdict">7. Verdict: ten questions, scored</H2>
        <TableWrap caption="How alike are the two eras?">
          <thead>
            <tr>
              <Th>Dimension</Th>
              <Th>Verdict</Th>
              <Th>Confidence</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Corporate profits</Td>
              <Td>Different. Leaders earn real profits (but so did Cisco in 2000).</Td>
              <Td tone="up">High</Td>
            </tr>
            <tr>
              <Td>Valuation vs earnings</Td>
              <Td>Mixed. Tech multiple lower than 2000, CAPE close to it.</Td>
              <Td tone="up">High</Td>
            </tr>
            <tr>
              <Td>Market concentration</Td>
              <Td>More extreme today</Td>
              <Td tone="up">High</Td>
            </tr>
            <tr>
              <Td>Capex vs cash flow</Td>
              <Td tone="flat">Rhymes</Td>
              <Td tone="up">High</Td>
            </tr>
            <tr>
              <Td>Financing structure</Td>
              <Td>Mixed. More cash-funded, but off-balance-sheet and private credit are growing.</Td>
              <Td tone="flat">Medium</Td>
            </tr>
            <tr>
              <Td>Circular deals</Td>
              <Td>Rhymes, but contested</Td>
              <Td tone="flat">Medium</Td>
            </tr>
            <tr>
              <Td>Asset life</Td>
              <Td>Worse today (faster obsolescence)</Td>
              <Td tone="flat">Medium</Td>
            </tr>
            <tr>
              <Td>Customer demand</Td>
              <Td>Stronger today, with the payback evidence still mixed</Td>
              <Td tone="flat">Medium</Td>
            </tr>
            <tr>
              <Td>Interest rates</Td>
              <Td>Rhymes in direction (tightening into a boom), lower in level</Td>
              <Td tone="up">High</Td>
            </tr>
            <tr>
              <Td>Systemic spillover</Td>
              <Td>Unknown. Banks have limited direct exposure, but private credit is a channel.</Td>
              <Td tone="down">Low</Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          The strongest counter-argument to “AI is different because it has real income” is simple: income in one part
          of a company does not protect the market from spending in another. Alphabet’s profits are real, and so is a
          $9.1B quarterly cash shortfall after capex.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="watch">What would change our view</H2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-emerald-400">More bullish:</strong> operating cash flow catching up with capex, and
            end-customer AI revenue growing faster than capex guidance.
          </li>
          <li>
            <strong className="text-rose-400">More bearish:</strong> cuts to capex guidance by one or two hyperscalers, a
            failed or repriced AI financing, or write-downs on GPU assets.
          </li>
          <li>
            <strong className="text-gold">Dates:</strong> the December Fed meeting, Q4 earnings in early 2027 and any
            OpenAI listing plans.
          </li>
        </ul>
      </section>

      <Note>
        <strong className="text-gold">Educational research only.</strong> This is not personalized investment, tax or
        credit advice, and Smart Algos Investment Solution Ltd is not a licensed investment adviser. Scenario figures
        are illustrations, not forecasts. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </Note>

      <section className="space-y-4">
        <H2 id="method">Method and corrections</H2>
        <P>
          Facts carry a bracketed source. “Our calculation” marks derived figures, with the working shown. We replaced
          several figures in our research notebook after checking them: Lucent’s fiscal 2000 revenue is $33.8B, not $61B
          (an inflation-adjusted figure); its customer-credit commitments at year end were $6.7B, not $8.1B; hyperscaler
          capex is measured against cash flow in Q3, not on full-year estimates; and index concentration is compared top
          10 against top 10. Report errors to{" "}
          <a href="mailto:desk@smartalgosts.com" className="text-gold hover:underline">
            desk@smartalgosts.com
          </a>
          .
        </P>
        <P>
          <strong className="text-foreground">Update log:</strong> 23 Nov 2026 — first publication.
        </P>
      </section>

      <section className="space-y-3">
        <H2 id="sources">Sources</H2>
        <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          <li id="s1">
            <Ext href="https://newsroom.cisco.com/c/r/newsroom/en/us/a/y2000/m08/cisco-systems-reports-fourth-quarter-earnings.html">
              Cisco: fourth-quarter and fiscal 2000 results
            </Ext>
          </li>
          <li id="s2">
            <Ext href="https://www.sec.gov/Archives/edgar/data/0001006240/000095012300011855/y43690e10-k405.txt">
              Lucent Technologies, Form 10-K405, fiscal 2000 (SEC)
            </Ext>
          </li>
          <li id="s3">
            <Ext href="https://www.sec.gov/Archives/edgar/data/0001006240/000095012301503418/y49457ae10-ka.txt">
              Lucent Technologies, Form 10-K/A, fiscal 2000 (SEC)
            </Ext>
          </li>
          <li id="s4">
            <Ext href="https://www.morningstar.com/news/marketwatch/20251011182/why-your-sp-500-index-fund-might-be-more-risky-than-the-internet-bubble">
              MarketWatch via Morningstar: S&amp;P 500 concentration and the dot-com peak
            </Ext>
          </li>
          <li id="s5">
            <Ext href="https://www.sec.gov/Archives/edgar/data/0001006240/000095011701500564/a29849.txt">
              Lucent Technologies, Form 10-Q/A, December 2000 quarter (SEC)
            </Ext>
          </li>
          <li id="s6">
            <Ext href="https://www.thestar.com.my/tech/tech-news/2026/06/03/analysis-us-tech-stocks039-market-dominance-reaches-new-heights-and-presents-new-risks">
              Reuters via The Star: US tech dominance reaches new heights (3 Jun 2026)
            </Ext>
          </li>
          <li id="s7">
            <Ext href="https://my.tradingview.com/news/reuters.com,2025:newsml_L6N3TJ0PL:0-is-today-s-ai-boom-bigger-than-the-dotcom-bubble-mcgeever">
              Reuters via TradingView: Is today’s AI boom bigger than the dotcom bubble?
            </Ext>
          </li>
          <li id="s8">
            Anthropic S-1/A No. 2 and reporting (see our{" "}
            <Link
              to="/finance/us/$slug"
              params={{ slug: US_ANTHROPIC_IPO_SLUG }}
              className="text-gold hover:underline"
            >
              IPO note
            </Link>{" "}
            for filing links)
          </li>
          <li id="s9">
            <Ext href="https://financefeeds.com/openais-revenue-shrinks-by-20b-after-accounting/">
              FinanceFeeds: OpenAI run rate cut to $50B from $68B
            </Ext>
          </li>
          <li id="s10">
            <Ext href="https://www.useluminix.com/reports/industry-analysis/hyperscaler-capex-q3-2026">
              Luminix: Alphabet Q3 2026 earnings, capex and cloud
            </Ext>
          </li>
          <li id="s11">
            <Ext href="https://chartrow.com/sp500/shiller-pe">
              Chartrow: S&amp;P 500 Shiller P/E (CAPE), 12 Nov 2026
            </Ext>
          </li>
          <li id="s12">
            <Ext href="https://am.jpmorgan.com/content/dam/jpm-am-aem/global/en/insights/market-insights/guide-to-the-markets/mi-guide-to-the-markets-us.pdf">
              J.P. Morgan Asset Management: Guide to the Markets, US
            </Ext>
          </li>
          <li id="s13">
            <Ext href="https://www.decodingdiscontinuity.com/p/hyperscaler-ai-cash-flow">
              Decoding Discontinuity: hyperscaler capex and free cash flow
            </Ext>
          </li>
          <li id="s14">
            <Ext href="https://walnutinvest.com/stats/ai-capex-statistics">Walnut: AI capex tracker, Q3 2026</Ext>
          </li>
          <li id="s15">
            <Ext href="https://averin.com/en/journal/ruslan-averin-big-tech-q3-2026-earnings-ai-capex-stress-test-microsoft-alphabet-meta-amazon-apple">
              Ruslan Averin: Big Tech Q3 2026 capex stress test
            </Ext>
          </li>
          <li id="s16">
            <Ext href="https://ajg.com/-/media/files/gallagher/us/news-and-insights/2025/tech-stock-mania-1990s-vs-today.pdf">
              Gallagher (FactSet data): tech stock mania, 1990s versus today
            </Ext>
          </li>
          <li id="s17">
            <Ext href="https://chartrow.com/visuals/index-concentration">
              Chartrow: S&amp;P 500 concentration, November 2026
            </Ext>
          </li>
          <li id="s18">
            <Ext href="https://www.eweek.com/de/news/vendor-financing-backfires/">
              eWeek: Vendor financing backfires (Apr 2001)
            </Ext>
          </li>
          <li id="s19">
            <Ext href="https://theaireceipts.com/blog/how-much-does-openai-make/">
              AI Receipts: OpenAI revenue and losses, as reported
            </Ext>
          </li>
          <li id="s20">
            <Ext href="https://valueaddvc.com/blog/openai-revenue-2026-20b-arr-4b-month-path-to-profitability">
              ValueAdd VC: OpenAI revenue 2026 and cash-burn plan
            </Ext>
          </li>
          <li id="s21">
            <Ext href="https://www.sequoiacap.com/article/ais-600b-question/">
              Sequoia Capital: AI’s $600B Question
            </Ext>
          </li>
          <li id="s22">
            <Ext href="https://www.advisorperspectives.com/dshort/updates/2026/10/28/feds-interest-rate-decision-october-28-2026">
              Advisor Perspectives: Fed decision, 28 Oct 2026 (see also FOMC minutes)
            </Ext>
          </li>
          <li id="s23">
            <Ext href="https://www.pnc.com/content/dam/pnc-com/pdf/aboutpnc/EconomicReports/EconomicUpdates/2025/PNC%20Economics%20Research%20-%20Weekly%20Economic%20Roundup%20-%2003%20November%202025.pdf">
              PNC Economics: Fed ends quantitative tightening from 1 Dec 2025
            </Ext>
          </li>
          <li id="s24">
            <Ext href="https://blogs.cuit.columbia.edu/gjb2124/?p=524">
              Columbia University blog: circular financing and the dot-com parallel (Cisco market value, March 2000)
            </Ext>
          </li>
        </ol>
      </section>
    </div>
  );
}

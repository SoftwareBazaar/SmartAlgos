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
      <table className="w-full min-w-[520px] text-sm tabular-nums">
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

type CellTone = "up" | "down" | "flat" | "pivot" | "ratioGood" | "ratioOk" | "ratioThin" | "ratioBad";

const TONE: Record<CellTone, string> = {
  up: "text-emerald-400 font-semibold",
  down: "text-rose-400 font-semibold",
  flat: "text-amber-200/90 font-medium",
  pivot: "text-gold font-semibold",
  ratioGood: "text-emerald-400 font-semibold",
  ratioOk: "text-teal-300 font-semibold",
  ratioThin: "text-amber-300 font-semibold",
  ratioBad: "text-rose-400 font-semibold",
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

function TrDecision({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <tr className={active ? "bg-gold/10 border-l-2 border-l-gold" : undefined}>{children}</tr>
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

const GLANCE = [
  { label: "IPO price", value: "$83.00" },
  { label: "Base offering", value: "980M shares" },
  { label: "Base gross proceeds", value: "$81.34B" },
  { label: "Implied valuation", value: "~$1.5T" },
] as const;

export function AnthropicIpoAntValuation() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 rounded-xl border border-border/60 overflow-hidden bg-card/20">
        {GLANCE.map((g) => (
          <div key={g.label} className="border-r border-b border-border/50 p-4 last:border-r-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-gold tabular-nums">{g.value}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <P>
          Anthropic priced its initial public offering at <strong className="text-foreground">$83</strong> per share
          on Wednesday, 18 November 2026, above the $70–$78 range it marketed a week earlier. Shares were expected to
          begin trading on the Nasdaq on Thursday, 19 November under the ticker{" "}
          <strong className="text-foreground">ANT</strong>
          <Sup n={2} href="#s2" />. This note separates three kinds of information: what the SEC filing states, what
          press reports state, and what we calculate ourselves. First-day trading results are not included; we will
          update this page after verified closes are available.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="terms">Deal terms</H2>
        <TableWrap caption="Marketed terms versus final pricing">
          <thead>
            <tr>
              <Th>Item</Th>
              <Th right>Marketed</Th>
              <Th right>Final</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Price per share</Td>
              <Td right>$70–$78</Td>
              <Td right strong>
                $83.00
              </Td>
            </tr>
            <tr>
              <Td>Base shares (Class A)</Td>
              <Td right>825M</Td>
              <Td right>980M</Td>
            </tr>
            <tr>
              <Td>Of which sold by Anthropic</Td>
              <Td right>801,351,354</Td>
              <Td right>956,351,354*</Td>
            </tr>
            <tr>
              <Td>Of which sold by co-founders</Td>
              <Td right>23,648,646</Td>
              <Td right>23,648,646</Td>
            </tr>
            <tr>
              <Td>Base gross proceeds</Td>
              <Td right>$61.05B at $74 midpoint*</Td>
              <Td right strong>
                $81.34B
              </Td>
            </tr>
            <tr>
              <Td>Over-allotment option</Td>
              <Td right>123.75M shares*</Td>
              <Td right>147M shares, $12.20B</Td>
            </tr>
            <tr>
              <Td>Concurrent private placement</Td>
              <Td right>$26B</Td>
              <Td right>$26B</Td>
            </tr>
            <tr>
              <Td>Base offering plus placement</Td>
              <Td right>—</Td>
              <Td right>$107.34B*</Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="text-xs text-muted-foreground leading-relaxed">
          * Smart Algos calculation from reported share counts and price. Share counts and the $26B placement:{" "}
          <a href="#s4" className="text-gold hover:underline">
            [4]
          </a>
          ,{" "}
          <a href="#s6" className="text-gold hover:underline">
            [6]
          </a>
          . Seller split:{" "}
          <a href="#s10" className="text-gold hover:underline">
            [10]
          </a>
          . Final price and upsizing:{" "}
          <a href="#s2" className="text-gold hover:underline">
            [2]
          </a>
          ,{" "}
          <a href="#s3" className="text-gold hover:underline">
            [3]
          </a>
          .
        </p>
        <P>
          The final price is <strong className="text-foreground">12.2%</strong> above the $74 midpoint and{" "}
          <strong className="text-foreground">6.4%</strong> above the top of the range (our calculation). Press reports
          put the valuation near $1.5 trillion
          <Sup n={3} href="#s3" />; that figure is on a fully diluted basis, so any multiple built from it should say
          so. Before the upsize, the marketed range implied roughly $1.26–$1.41 trillion
          <Sup n={20} href="#s20" />.
        </P>
        <P>
          On “largest IPO ever”: CNN reports $81.3B against SpaceX’s $75B
          <Sup n={3} href="#s3" />. Other sources list the SpaceX raise at $86B
          <Sup n={19} href="#s19" />. The ranking depends on whether over-allotment shares are counted, so we state the
          Anthropic base figure and leave the ranking to the reader.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="control">Who controls Anthropic after the IPO</H2>
        <P>Anthropic is a Delaware public benefit corporation. Control and economics are deliberately separated:</P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Class A</strong> is what IPO buyers receive: one vote per share, with
            public holders’ combined vote fixed at 49.9%
            <Sup n={12} href="#s12" />.
          </li>
          <li>
            <strong className="text-foreground">Class F</strong> is one share held by a Founder LLC of the seven
            co-founders. It carries a fixed 50.1% of the vote on general stockholder matters and no economic rights
            <Sup n={12} href="#s12" />.
          </li>
          <li>
            <strong className="text-foreground">Class T</strong> is one share held by the Long-Term Benefit Trust. It
            elects and removes the directors who form the board majority, reported as four of seven
            <Sup n={13} href="#s13" />.
          </li>
        </ul>
        <P>
          The practical reading: Class A holders own the economics but cannot, by vote alone, change who runs the
          company. The filing itself warns that the structure may effectively eliminate Class A holders’ ability to
          influence major decisions
          <Sup n={1} href="#s1" />.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="financials">What the S-1 shows</H2>
        <TableWrap caption="Reported results, US$ millions (unaudited for 2026 periods)">
          <thead>
            <tr>
              <Th>Metric</Th>
              <Th right>FY2024</Th>
              <Th right>FY2025</Th>
              <Th right>9M 2025</Th>
              <Th right>9M 2026</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Revenue</Td>
              <Td right>386</Td>
              <Td right>4,585</Td>
              <Td right>2,545</Td>
              <Td right strong>
                33,242
              </Td>
            </tr>
            <tr>
              <Td>Net loss</Td>
              <Td right>(8,309)</Td>
              <Td right>(41,965)</Td>
              <Td right>(25,107)</Td>
              <Td right strong>
                (104,039)
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          Revenue was $41M in 2023, and the 9M 2025 net loss comes from the same filing data
          <Sup n={7} href="#s7" />
          <Sup n={21} href="#s21" />. These are recognized revenue figures, not annual recurring revenue.
        </P>

        <H3>Why a $104 billion loss is not a $104 billion cash burn</H3>
        <P>
          About <strong className="text-foreground">$94.3B</strong> of the nine-month net loss is a non-cash charge from
          changes in the fair value of convertible notes, derivatives and SAFEs, which rises when the private valuation
          rises
          <Sup n={9} href="#s9" />. The GAAP operating loss for the period was $1.26B
          <Sup n={9} href="#s9" />. Q2 2026 showed a $974M operating profit and Q3 a $567M operating loss
          <Sup n={5} href="#s5" />. On the company’s own non-GAAP measure, adjusted operating income was $4.081B for
          nine months (12% margin), including $2.463B (15%) in Q3. Operating cash flow was $6.569B
          <Sup n={8} href="#s8" />
          <Sup n={5} href="#s5" />. Adjusted operating income adds back items such as stock-based compensation and
          non-cash charitable contributions, so it is not comparable with GAAP profit.
        </P>
        <P>
          The private marks behind that charge: a $30B Series G at $380B post-money in February 2026
          <Sup n={14} href="#s14" />, and a $965B valuation in the May 2026 Series H
          <Sup n={15} href="#s15" />.
        </P>

        <H3>Run-rate versus recognized revenue</H3>
        <P>
          Amendment No. 2 reports run-rate revenue of about $81B at 31 October 2026, up from roughly $71B a month
          earlier. The company defines it as trailing 28-day usage fees multiplied by 13, plus monthly subscription fees
          multiplied by 12, so one strong month inflates it. The filing also warns that growth could slow sharply
          <Sup n={5} href="#s5" />. Q3 recognized revenue of about $17.0B annualizes to roughly $67.8B
          <Sup n={6} href="#s6" />. We show both bases below.
        </P>
      </section>

      <AdSlot />

      <section className="space-y-4">
        <H2 id="compute">The compute bill</H2>
        <P>
          Aggregate purchase commitments and leases, substantially all for compute and infrastructure, total about{" "}
          <strong className="text-foreground">$900.9B</strong> per the latest amendment, with about $70.7B due in the 12
          months after 30 September 2026
          <Sup n={6} href="#s6" />. The earlier $895.4B figure is superseded.
        </P>
        <TableWrap caption="Named counterparties from the S-1">
          <thead>
            <tr>
              <Th>Counterparty</Th>
              <Th right>Commitment</Th>
              <Th>Term</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Google Cloud</Td>
              <Td right>at least ~$114.5B</Td>
              <Td>Apr 2026–Jul 2033</Td>
            </tr>
            <tr>
              <Td>SpaceXAI (NVIDIA GPUs)</Td>
              <Td right>up to $120.5B</Td>
              <Td>into 2029</Td>
            </tr>
            <tr>
              <Td>Amazon (AWS)</Td>
              <Td right>$110.0B</Td>
              <Td>through Apr 2036</Td>
            </tr>
            <tr>
              <Td>Microsoft Azure</Td>
              <Td right>at least $44.9B</Td>
              <Td>Nov 2026–May 2033</Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          Three cautions. Some reports show Google at $121.3B
          <Sup n={16} href="#s16" />; the S-1 text states about $114.5B
          <Sup n={1} href="#s1" />, and we use that. Additional Google TPU capacity (estimated $125–$150B for 2028–2031)
          and the AMD Helios arrangement (expected above $20B) sit outside the $900.9B total
          <Sup n={1} href="#s1" />. And the named counterparties do not sum to the total, because other providers such as
          Broadcom, Nscale and Lambda make up the balance
          <Sup n={17} href="#s17" />.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="valuation">Valuation math (Smart Algos calculations)</H2>
        <TableWrap caption="Implied multiples at $83, using ~$1.49T fully diluted value">
          <thead>
            <tr>
              <Th>Basis</Th>
              <Th right>Revenue base</Th>
              <Th right>Multiple</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Equity value ÷ Oct-31 run-rate</Td>
              <Td right>$81.0B</Td>
              <Td right strong>
                18.4x
              </Td>
            </tr>
            <tr>
              <Td>Equity value ÷ Q3 revenue × 4</Td>
              <Td right>$67.8B</Td>
              <Td right>22.0x</Td>
            </tr>
            <tr>
              <Td>EV ÷ Oct-31 run-rate (EV ≈ $1.39T)</Td>
              <Td right>$81.0B</Td>
              <Td right>17.2x</Td>
            </tr>
          </tbody>
        </TableWrap>
        <P>
          EV here subtracts only the roughly $105B of net new cash (about $79.4B primary proceeds plus the $26B
          placement, before fees). Anthropic also held cash before the offering, so a full EV would be lower still. We
          omit peer multiples for private companies such as OpenAI and xAI, because no audited public figures exist to
          cite.
        </P>
        <P>
          <strong className="text-foreground">Funding coverage.</strong> Annualizing nine-month operating cash flow
          gives about $8.8B, which covers roughly 12% of the $70.7B due in the next twelve months. The ~$105B net raise
          equals about 1.5 years of that obligation, before any growth in revenue. Both are simple ratios, not forecasts.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="scenarios">Scenario model</H2>
        <P>
          The table below is an illustration with transparent inputs. The target prices and probabilities are{" "}
          <strong className="text-foreground">Smart Algos assumptions</strong>, not forecasts and not analyst consensus.
          Change them and the answer changes.
        </P>
        <TableWrap caption="Scenario assumptions and returns versus the $83 IPO price">
          <thead>
            <tr>
              <Th>Scenario</Th>
              <Th right>Target</Th>
              <Th right>vs $83</Th>
              <Th right>Probability</Th>
              <Th right>Weighted</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>
                <span className="text-emerald-400/90">Bull</span>
                <span className="text-muted-foreground">: enterprise agent adoption sustains hypergrowth</span>
              </Td>
              <Td right>$140</Td>
              <Td right tone="up">
                +68.7%
              </Td>
              <Td right>30%</Td>
              <Td right tone="up">
                $42.00
              </Td>
            </tr>
            <tr>
              <Td>
                <span className="text-amber-200/90">Base</span>
                <span className="text-muted-foreground">: growth moderates, margins hold</span>
              </Td>
              <Td right>$82</Td>
              <Td right tone="flat">
                −1.2%
              </Td>
              <Td right>45%</Td>
              <Td right>$36.90</Td>
            </tr>
            <tr>
              <Td>
                <span className="text-rose-400/90">Bear</span>
                <span className="text-muted-foreground">: fixed compute costs squeeze margins</span>
              </Td>
              <Td right>$38</Td>
              <Td right tone="down">
                −54.2%
              </Td>
              <Td right>25%</Td>
              <Td right>$9.50</Td>
            </tr>
            <TrDecision active>
              <Td>
                <strong className="text-gold">Expected value</strong>
              </Td>
              <Td right />
              <Td right tone="pivot">
                +6.5%
              </Td>
              <Td right />
              <Td right tone="pivot">
                $88.40
              </Td>
            </TrDecision>
          </tbody>
        </TableWrap>
        <TableWrap caption="Sensitivity to entry price, same assumptions">
          <thead>
            <tr>
              <Th>Entry</Th>
              <Th right>Expected return</Th>
              <Th right>Bear-case loss</Th>
              <Th right>Bull gain ÷ bear loss</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>$68</Td>
              <Td right tone="up">
                +30.0%
              </Td>
              <Td right tone="down">
                −44.1%
              </Td>
              <Td right tone="ratioGood">
                2.40
              </Td>
            </tr>
            <tr>
              <Td>$70</Td>
              <Td right tone="up">
                +26.3%
              </Td>
              <Td right tone="down">
                −45.7%
              </Td>
              <Td right tone="ratioGood">
                2.19
              </Td>
            </tr>
            <tr>
              <Td>$74 (old midpoint)</Td>
              <Td right tone="up">
                +19.5%
              </Td>
              <Td right tone="down">
                −48.6%
              </Td>
              <Td right tone="ratioOk">
                1.83
              </Td>
            </tr>
            <tr>
              <Td>$75</Td>
              <Td right tone="up">
                +17.9%
              </Td>
              <Td right tone="down">
                −49.3%
              </Td>
              <Td right tone="ratioOk">
                1.76
              </Td>
            </tr>
            <TrDecision active>
              <Td>
                <strong className="text-gold">$83 (IPO price)</strong>
              </Td>
              <Td right tone="pivot">
                +6.5%
              </Td>
              <Td right tone="down">
                −54.2%
              </Td>
              <Td right tone="ratioThin">
                1.27
              </Td>
            </TrDecision>
            <tr>
              <Td>$90</Td>
              <Td right tone="down">
                −1.8%
              </Td>
              <Td right tone="down">
                −57.8%
              </Td>
              <Td right tone="ratioBad">
                0.96
              </Td>
            </tr>
          </tbody>
        </TableWrap>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-mono tracking-wide">
          <span>
            <span className="text-emerald-400">■</span> upside / ratio ≥ 2.0
          </span>
          <span>
            <span className="text-teal-300">■</span> ratio 1.5–2.0
          </span>
          <span>
            <span className="text-amber-300">■</span> thin edge (&lt; 1.5)
          </span>
          <span>
            <span className="text-rose-400">■</span> downside / ratio &lt; 1
          </span>
          <span>
            <span className="text-gold">■</span> decision pivot
          </span>
        </p>
        <P>
          The point of the table is the shape, not the numbers: the upsized $83 price cut expected return from +19.5% at
          the old midpoint to +6.5% while widening the bear-case loss, and under these assumptions expected value turns
          negative around $88. We deliberately do not convert this into a position size. The probabilities are
          subjective, and a sizing rule built on them would imply precision the inputs do not have.
        </P>
        <P>
          Market backdrop: the Nasdaq-100 fell from its 6 October high near 31,350 to a 5 November low near 26,600 and
          had recovered part of that by mid-November
          <Sup n={18} href="#s18" />.
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="how-to-buy">How to buy ANT from Kenya</H2>
        <P>
          Kenyan residents can access US-listed stocks such as ANT through a Kenyan-facing app or a global broker. Two
          common routes:
        </P>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Hisa</strong> — mobile app with US stocks/ETFs and KES funding via{" "}
            <a href="https://hisa.co" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              hisa.co
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Interactive Brokers (IBKR)</strong> — global broker accepting Kenyan
            residents, typically funded by bank wire via{" "}
            <a
              href="https://www.interactivebrokers.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              interactivebrokers.com
            </a>
            .
          </li>
        </ul>
        <P>
          Check the CMA register before depositing with any Kenya-based provider, complete a W-8BEN for US tax
          withholding, and prefer limit orders on a new listing. Full steps, costs and TradingView notes:{" "}
          <Link
            to="/finance/us/$slug"
            params={{ slug: "buy-us-stocks-from-kenya-hisa-interactive-brokers" }}
            className="text-gold hover:underline"
          >
            Buy &amp; trade US stocks from Kenya
          </Link>
          .
        </P>
      </section>

      <section className="space-y-4">
        <H2 id="calendar">Lock-up and index calendar</H2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Lock-up is staged, not a single cliff.</strong> About 15.5 billion shares
            are restricted for up to 180 days, or up to 365 days for the co-founders and certain large holders. Up to 10%
            of non-founder directors’, officers’ and employees’ holdings can be sold from the first trading day
            <Sup n={9} href="#s9" />. Most holders are released at the earlier of a first-quarter 2027 earnings trigger
            or day 180, and the co-founders at the earlier of a third-quarter 2027 trigger or day 365
            <Sup n={10} href="#s10" />. Day 180 from the 19 November debut falls on{" "}
            <strong className="text-foreground">18 May 2027</strong> (our calculation).
          </li>
          <li>
            <strong className="text-foreground">Nasdaq-100.</strong> Anthropic is on track to join at the open on 21
            December under the fast-entry rule, with the change announced after the close on 11 December, per Bloomberg’s
            reporting
            <Sup n={11} href="#s11" />. This is expected, not final.
          </li>
          <li>
            <strong className="text-foreground">First earnings.</strong> The date had not been confirmed in the sources
            we could verify, so we do not state one.
          </li>
        </ul>
      </section>

      <Note>
        <strong className="text-gold">Educational research only.</strong> This note is not personalized investment, tax
        or credit advice, and Smart Algos Investment Solution Ltd is not a licensed investment adviser. Scenario inputs
        are assumptions. Past results are not indicative of future returns. See our{" "}
        <Link to="/financial-disclaimer" className="text-gold hover:underline">
          Financial Disclaimer
        </Link>
        .
      </Note>

      <section className="space-y-4">
        <H2 id="method">Method and corrections</H2>
        <P>
          Figures marked with a bracketed number come from the sources below. Anything marked “our calculation” or
          “Smart Algos” is derived here from those figures, and the derivation is shown. We exclude items we could not
          tie to a filing or named report. If you spot an error, write to{" "}
          <a href="mailto:desk@smartalgosts.com" className="text-gold hover:underline">
            desk@smartalgosts.com
          </a>{" "}
          and we will correct it and log the change here.
        </P>
        <P>
          <strong className="text-foreground">Update log:</strong> 19 Nov 2026 — published around the debut window. A
          post-debut update will follow once first-day closes are verified.
        </P>
      </section>

      <section className="space-y-3">
        <H2 id="sources">Sources</H2>
        <ol className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          <li id="s1">
            <a
              className="text-gold hover:underline"
              href="https://www.sec.gov/Archives/edgar/data/0002130357/000162828026067168/anthropicpbc-sx1.htm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anthropic, PBC, Form S-1 (SEC EDGAR)
            </a>
          </li>
          <li id="s2">
            <a
              className="text-gold hover:underline"
              href="https://www.cnbc.com/2026/11/18/anthropic-ipo-ai-offering-price.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              CNBC, 18 Nov 2026: Anthropic IPO raises over $81 billion
            </a>
          </li>
          <li id="s3">
            <a
              className="text-gold hover:underline"
              href="https://www.cnn.com/2026/11/18/investing/anthropic-ipo-price-stock"
              target="_blank"
              rel="noopener noreferrer"
            >
              CNN, 18 Nov 2026: Anthropic’s $83 IPO price
            </a>
          </li>
          <li id="s4">
            <a
              className="text-gold hover:underline"
              href="https://www.thestatesman.com/business/anthropic-ipo-priced-at-83-81-34-billion-offering-set-for-nasdaq-debut-1503664154.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Statesman: Anthropic IPO priced at $83
            </a>
          </li>
          <li id="s5">
            <a
              className="text-gold hover:underline"
              href="https://finance.yahoo.com/technology/ai/articles/anthropic-says-revenue-run-rate-200343777.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yahoo Finance: Anthropic revenue run rate, S-1/A No. 2
            </a>
          </li>
          <li id="s6">
            <a
              className="text-gold hover:underline"
              href="https://www.indmoney.com/blog/us-stocks/anthropic-ipo-s1-filing-explained"
              target="_blank"
              rel="noopener noreferrer"
            >
              INDmoney: Anthropic S-1 explained
            </a>
          </li>
          <li id="s7">
            <a
              className="text-gold hover:underline"
              href="https://www.kadoa.com/companies/ipos/anthropic"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kadoa: Anthropic S-1 financials
            </a>
          </li>
          <li id="s8">
            <a
              className="text-gold hover:underline"
              href="https://www.tldr.money/articles/ipo/anthropic-ipo-financials-s1"
              target="_blank"
              rel="noopener noreferrer"
            >
              tldr.money: Anthropic IPO financials
            </a>
          </li>
          <li id="s9">
            <a
              className="text-gold hover:underline"
              href="https://mlq.ai/news/anthropic-prices-its-ipo-at-83-a-share-above-its-70-to-78-range-sources-say/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MLQ.ai (Reuters-based): pricing, losses and lock-ups
            </a>
          </li>
          <li id="s10">
            <a
              className="text-gold hover:underline"
              href="https://www.techi.com/anthropic-ipo-lock-up-share-release-calendar/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TECHi: lock-up release calendar
            </a>
          </li>
          <li id="s11">
            <a
              className="text-gold hover:underline"
              href="https://stockanalysis.com/news/anthropic-nasdaq-100-funds-december-21/"
              target="_blank"
              rel="noopener noreferrer"
            >
              StockAnalysis: Nasdaq-100 on 21 December
            </a>
          </li>
          <li id="s12">
            <a
              className="text-gold hover:underline"
              href="https://leverageshares.com/us/insights/who-controls-anthropic/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leverage Shares: who controls Anthropic
            </a>
          </li>
          <li id="s13">
            <a
              className="text-gold hover:underline"
              href="https://fourweekmba.com/anthropic-public-benefit-corporation/"
              target="_blank"
              rel="noopener noreferrer"
            >
              FourWeekMBA: Trust, Class F and board seats
            </a>
          </li>
          <li id="s14">
            <a
              className="text-gold hover:underline"
              href="https://www.anthropic.com/news/anthropic-raises-30-billion-series-g-funding-380-billion-post-money-valuation"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anthropic: Series G announcement
            </a>
          </li>
          <li id="s15">
            <a
              className="text-gold hover:underline"
              href="https://en.wikipedia.org/wiki/Anthropic"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia: Anthropic (Series H)
            </a>
          </li>
          <li id="s16">
            <a
              className="text-gold hover:underline"
              href="https://www.datacenterdynamics.com/en/news/anthropic-s-1-update-reveals-8954bn-in-cloud-and-data-center-commitments/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Data Center Dynamics: S-1 compute commitments
            </a>
          </li>
          <li id="s17">
            <a
              className="text-gold hover:underline"
              href="https://www.futuriom.com/articles/news/why-anthropic-is-banking-on-future-compute/2026/10"
              target="_blank"
              rel="noopener noreferrer"
            >
              Futuriom: Anthropic’s compute contracts
            </a>
          </li>
          <li id="s18">
            <a
              className="text-gold hover:underline"
              href="https://www.fxstreet.com/news/ai-stocks-rebound-and-carry-the-nasdaq-100-to-a-one-week-high-202611112158"
              target="_blank"
              rel="noopener noreferrer"
            >
              FXStreet: Nasdaq-100 recovery, 11 Nov 2026
            </a>
          </li>
          <li id="s19">
            <a
              className="text-gold hover:underline"
              href="https://en.wikipedia.org/wiki/Initial_public_offering_of_SpaceX"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia: Initial public offering of SpaceX
            </a>
          </li>
          <li id="s20">
            <a
              className="text-gold hover:underline"
              href="https://www.newsweek.com/anthropic-ipo-why-1t-bet-matters-even-if-you-dont-own-stocks-12734879"
              target="_blank"
              rel="noopener noreferrer"
            >
              Newsweek: Anthropic IPO and the lock-up
            </a>
          </li>
          <li id="s21">
            <a
              className="text-gold hover:underline"
              href="https://quashbugs.com/blog/anthropic-statistics-funding-valuation-revenue"
              target="_blank"
              rel="noopener noreferrer"
            >
              Quash: Anthropic 2026 statistics from the S-1
            </a>
          </li>
        </ol>
      </section>
    </div>
  );
}

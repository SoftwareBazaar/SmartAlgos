import type { ReactNode } from "react";
import { Day02Charts } from "@/components/finance/day-02-charts";
import { AdSlot } from "@/components/finance/ad-slot";

function Formula({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border/60 bg-card/40 px-4 py-3 font-mono text-xs md:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground pt-2">
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

const PARAM_ROWS = [
  ["B₀", "Initial revolving debt principal", "$15,000.00", "B₀ > 0"],
  ["APR_orig", "Baseline APR (nominal)", "26.99%", "r_orig = 0.022492 / mo"],
  ["f", "Upfront BT fee percentage", "4.00%", "Issuer range 3%–5%"],
  ["Fee_upfront", "Upfront transfer fee drag", "$600.00", "B₀ · f"],
  ["B_trans", "Starting transferred balance", "$15,600.00", "B₀ · (1 + f)"],
  ["T_promo", "Promotional window", "18 months", "Typical 12–21 mo"],
  ["APR_post", "Post-intro reset rate", "28.99%", "r_post = 0.024158 / mo"],
] as const;

const TIMELINE_A = [
  ["1", "15600.00", "866.67", "0.00", "866.67", "14733.33", "14837.38"],
  ["6", "11266.67", "866.67", "0.00", "866.67", "10400.00", "13958.05"],
  ["12", "6066.67", "866.67", "0.00", "866.67", "5200.00", "12692.65"],
  ["18", "866.67", "866.67", "0.00", "866.67", "0.00", "11090.81"],
] as const;

const TIMELINE_B = [
  ["18", "7100.00", "500.00", "0.00", "500.00", "6600.00", "11090.81"],
  ["19", "6600.00", "500.00", "159.45", "340.55", "6259.45", "10790.35"],
  ["24", "4833.02", "500.00", "116.76", "383.24", "4449.78", "9132.84"],
  ["30", "2397.64", "500.00", "57.92", "442.08", "1955.56", "6745.38"],
  ["35", "44.32", "45.39", "1.07", "44.32", "0.00", "4337.89"],
] as const;

const TIMELINE_C = [
  ["18", "13150.31", "131.90", "0.00", "131.90", "13018.41", "11090.81"],
  ["36", "11883.33", "368.10", "287.08", "81.02", "11802.31", "3866.19"],
  ["51", "10815.11", "335.03", "261.27", "73.76", "10741.35", "0.00"],
  ["323", "3.51", "3.59", "0.08", "3.51", "0.00", "0.00"],
] as const;

function TimelineTable({
  caption,
  rows,
}: {
  caption: string;
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full min-w-[820px] text-left text-[11px] md:text-xs font-mono">
        <caption className="caption-top px-3 pt-3 pb-2 text-left text-[10px] uppercase tracking-[0.14em] text-gold font-sans">
          {caption}
        </caption>
        <thead className="bg-card/50 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
          <tr>
            <th className="px-2 py-2 font-medium">Period</th>
            <th className="px-2 py-2 font-medium">Begin</th>
            <th className="px-2 py-2 font-medium">Payment</th>
            <th className="px-2 py-2 font-medium">Interest</th>
            <th className="px-2 py-2 font-medium">Principal</th>
            <th className="px-2 py-2 font-medium">End</th>
            <th className="px-2 py-2 font-medium">Baseline</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${caption}-${row[0]}-${row[5]}`} className="border-t border-border/50 text-muted-foreground">
              {row.map((cell, i) => (
                <td key={`${row[0]}-${i}`} className={`px-2 py-2 ${i === 0 ? "text-gold font-medium" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Day02BalanceTransferArbitrage() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <H2>Executive summary & parameter definitions</H2>
        <P>
          Credit card balance transfer promotions offering 0% introductory APR (12–21 months) are
          marketed as cost-free debt elimination shortcuts. Quantitative analysis shows that upfront
          transfer fees (3%–5%) and post-introductory rate resets (24.99%–29.99%) create structural
          drag. When the balance is not fully amortized before the promotional cliff, fees and
          interest resets frequently erase anticipated savings.
        </P>
        <P>
          This note evaluates a{" "}
          <strong className="text-foreground">$15,000</strong> liability moved at{" "}
          <strong className="text-foreground">4% fee</strong> into an{" "}
          <strong className="text-foreground">18-month 0% window</strong>, then reset to{" "}
          <strong className="text-foreground">28.99% APR</strong> — versus staying on a{" "}
          <strong className="text-foreground">26.99% APR</strong> original card.
        </P>

        <H3>Primary scenario micro-variables</H3>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[640px] text-left text-xs md:text-sm">
            <thead className="bg-card/50 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Symbol</th>
                <th className="px-3 py-2.5 font-medium">Parameter</th>
                <th className="px-3 py-2.5 font-medium">Baseline</th>
                <th className="px-3 py-2.5 font-medium">Bounds</th>
              </tr>
            </thead>
            <tbody>
              {PARAM_ROWS.map(([sym, desc, val, bound]) => (
                <tr key={sym} className="border-t border-border/50">
                  <td className="px-3 py-2.5 font-mono text-gold">{sym}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{desc}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{val}</td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-[11px]">{bound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <H2>Visual models</H2>
        <Day02Charts />
      </section>

      <AdSlot id="day02-inline-1" />

      <section className="space-y-4">
        <H2>Mathematical framework</H2>
        <P>NPV advantage of transferring versus remaining on the original facility:</P>
        <Formula>
          {"ΔNPV = Σ I_t^orig / (1+d)^t  −  [ f·B₀ + Σ I_t^bt / (1+d)^t ]"}
        </Formula>
        <P>Arbitrage feasibility (interest avoided during promo must exceed the fee):</P>
        <Formula>{"Σ_{t=1..T_promo} I_t^orig  >  f · B₀"}</Formula>
        <P>Breakeven horizon on fee recovery:</P>
        <Formula>
          {"T_breakeven = min { t ∈ ℕ | Σ_{k=1..t} B_{k-1}^orig · r_orig  ≥  f · B₀ }"}
        </Formula>
        <P>Post-promo recurrence after the rate cliff:</P>
        <Formula>{"B_t = B_{t-1} · (1 + r_post) − M_t"}</Formula>
        <P>Effective APR inclusive of fee drag:</P>
        <Formula>
          {"APR_effective = ( Fee_upfront + Σ I_t^bt ) / B₀  ·  (12 / T_total)"}
        </Formula>
      </section>

      <section className="space-y-4">
        <H2>Tokenized payoff timelines</H2>
        <P>
          Three borrower strategies on the transferred book (B_trans = $15,600), compared to the
          baseline balance that would remain on the original 26.99% card.
        </P>
        <TimelineTable caption="Strategy A — full-clearance sinking fund ($866.67/mo)" rows={TIMELINE_A} />
        <TimelineTable caption="Strategy B — parity payments ($500/mo through cliff)" rows={TIMELINE_B} />
        <TimelineTable caption="Strategy C — promotional slacker (minimums → reset)" rows={TIMELINE_C} />
      </section>

      <AdSlot id="day02-inline-2" />

      <section className="space-y-4">
        <H2>Economic analysis</H2>
        <H3>1. Upfront fee friction</H3>
        <P>
          The transfer incurs an immediate capital tax f. On $15,000 at 4%, principal inflates to
          $15,600 — a $600 fee. Against the original 26.99% APR interest stream, that fee is fully
          offset by interest savings by roughly{" "}
          <strong className="text-foreground">month 1.78</strong> (breakeven index).
        </P>
        <H3>2. Promotional expiry cliff</H3>
        <P>
          Paying only mandatory minimums in the 18-month window leaves ~$13,018 at month 18. On
          month 19 the post-intro rate (28.99%) activates. Interest jumps toward hundreds of dollars
          per month under dynamic minimums, turning a 0% offer into a{" "}
          <strong className="text-foreground">323-month / $45,351.51</strong> trap — about{" "}
          <strong className="text-foreground">$20,102 worse</strong> than a disciplined baseline
          payoff on the original card.
        </P>
      </section>

      <section className="space-y-4">
        <H2>Decision rules</H2>
        <H3>Rule 1 — Full-clearance sinking fund</H3>
        <Formula>{"M_clear = (B₀ · (1 + f)) / T_promo = 15600 / 18 = $866.67"}</Formula>
        <P>
          Clears $15,600 in 18 months with $0 interest and saves about{" "}
          <strong className="text-foreground">$9,649.52</strong> versus the stay-put baseline path.
        </P>
        <H3>Rule 2 — NPV feasibility boundary</H3>
        <Formula>{"Execute only if  f  <  APR_orig · (T_promo / 12)"}</Formula>
        <P>
          Check: 0.04 &lt; 0.2699 · 1.5 = 0.40485 — <strong className="text-foreground">VALID</strong>.
          Confirms positive arbitrage potential before the transfer is executed. Validity does not
          replace Rule 1: without clearance funding, the cliff can destroy the NPV edge.
        </P>

        <div className="overflow-x-auto rounded-lg border border-gold/30 bg-secondary-surface/40">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="caption-top px-4 pt-4 pb-2 text-left text-[10px] uppercase tracking-[0.18em] text-gold">
              Strategy scorecard — $15,000 @ 4% fee / 18-mo 0%
            </caption>
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Strategy</th>
                <th className="px-4 py-2 font-medium">Payment rule</th>
                <th className="px-4 py-2 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">A Clearance</td>
                <td className="px-4 py-2.5">$866.67 / mo</td>
                <td className="px-4 py-2.5 text-gold">Paid off month 18 · $0 interest</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">B Parity</td>
                <td className="px-4 py-2.5">$500 / mo</td>
                <td className="px-4 py-2.5">Clears ~month 35 after 28.99% reset</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">C Slacker</td>
                <td className="px-4 py-2.5">Minimums</td>
                <td className="px-4 py-2.5">323 months · $45,351.51 total paid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="day02-inline-3" />

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
        Educational systems note — illustrative scenario math, not personalized financial advice.
        Transfer terms, fee floors, and reset APRs vary by issuer.
      </p>
    </div>
  );
}

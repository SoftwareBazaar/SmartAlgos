import type { ReactNode } from "react";

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

function CompareBar({
  label,
  value,
  widthPct,
  accent,
}: {
  label: string;
  value: string;
  widthPct: number;
  accent?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={accent ? "text-gold font-medium" : "text-foreground"}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-border/50 overflow-hidden">
        <div
          className={`h-full rounded-full ${accent ? "bg-gold" : "bg-foreground/40"}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

const PARAM_ROWS = [
  ["B₀", "Initial revolving principal balance", "$10,000.00", "B₀ > 0"],
  ["APR", "Annual percentage rate (nominal)", "24.99%", "r = 0.2499/12 = 0.020825"],
  ["p", "Principal repayment percentage factor", "1.00% (0.01)", "Issuer range: 1.0%–2.0%"],
  ["M_floor", "Mandatory minimum payment floor", "$35.00", "Typical $25–$40"],
  ["Fₜ", "Penalty fees & assessment charges", "$0.00", "Fₜ ≥ 0"],
] as const;

const TIMELINE_ROWS = [
  ["1", "10000.00", "308.25", "208.25", "100.00", "9900.00", "300.00", "9908.25"],
  ["6", "9509.90", "293.14", "198.04", "95.10", "9414.80", "300.00", "9438.41"],
  ["12", "8953.38", "275.98", "186.45", "89.53", "8863.85", "300.00", "8763.72"],
  ["24", "7936.15", "244.63", "165.27", "79.36", "7856.79", "300.00", "7180.53"],
  ["36", "7034.42", "216.84", "146.49", "70.35", "6964.07", "300.00", "5147.20"],
  ["48", "6235.26", "192.20", "129.85", "62.35", "6172.91", "300.00", "2556.71"],
  ["58", "5634.33", "173.68", "117.33", "56.34", "5577.99", "125.10", "0.00"],
  ["72", "4898.90", "151.01", "102.02", "48.99", "4849.91", "0.00", "0.00"],
  ["120", "3024.06", "93.22", "62.98", "30.24", "2993.82", "0.00", "0.00"],
  ["180", "1654.64", "51.01", "34.46", "16.55", "1638.09", "0.00", "0.00"],
  ["215", "1172.10", "36.62", "24.41", "12.21", "1159.89", "0.00", "0.00"],
  ["240", "813.09", "35.00", "16.93", "18.07", "795.02", "0.00", "0.00"],
  ["272", "2.79", "2.85", "0.06", "2.79", "0.00", "0.00", "0.00"],
] as const;

export function Day01CreditCardMinimumPaymentDecay() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <H2>Executive summary & parameter definitions</H2>
        <P>
          Standard credit card agreements calculate mandatory monthly minimum payments using a
          dynamic decay formula where required payments decrease proportionally as the outstanding
          principal balance is reduced. Commercial personal finance engines routinely misrepresent
          unaccelerated debt trajectories by applying static payment assumptions, drastically
          understating total interest expenditures and payoff timelines.
        </P>
        <P>
          This quantitative study deconstructs the mathematical mechanics of dynamic minimum payment
          decay for a <strong className="text-foreground">$10,000.00</strong> revolving balance at{" "}
          <strong className="text-foreground">24.99% APR</strong> under a standard
          percentage-plus-interest contract structure (p = 1.0%, M_floor = $35.00). We contrast
          real-world dynamic decay with commercial static payment assumption models, proving that
          dynamic decay extends the debt elimination timeline from{" "}
          <strong className="text-foreground">4.8 years to 22.7 years (272 months)</strong> and
          inflates cumulative interest charges by{" "}
          <strong className="text-foreground">$11,992.00 (a 165.5% increase)</strong>.
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
        <H2>Mathematical framework</H2>
        <P>
          A credit card&apos;s dynamic minimum payment at period t, denoted Mₜ, is determined by a
          piecewise maximum function combining a percentage of the previous ending principal balance
          Bₜ₋₁, accrued monthly interest Iₜ, periodic fees Fₜ, and a contractual cash floor M_floor:
        </P>
        <Formula>{"M_t = max( M_floor ,  B_{t-1} · p + I_t + F_t )"}</Formula>
        <P>
          The periodic interest charge Iₜ is calculated from the preceding period&apos;s ending
          balance using the periodic monthly rate r:
        </P>
        <Formula>{"I_t = B_{t-1} · r = B_{t-1} · (APR / 12)"}</Formula>
        <P>
          Substituting Iₜ into the dynamic payment formula (assuming Fₜ = 0 and Mₜ &gt; M_floor)
          yields:
        </P>
        <Formula>{"M_t = B_{t-1} · p + B_{t-1} · r = B_{t-1} · (p + r)"}</Formula>
        <P>
          The principal reduction portion Pₜ for billing cycle t is total payment minus accrued
          interest:
        </P>
        <Formula>{"P_t = M_t − I_t = B_{t-1} · (p + r) − B_{t-1} · r = B_{t-1} · p"}</Formula>
        <P>
          Consequently, ending principal Bₜ obeys a first-order homogenous linear difference
          equation:
        </P>
        <Formula>{"B_t = B_{t-1} − P_t = B_{t-1} · (1 − p)"}</Formula>
        <P>
          Expanding from initial principal B₀ yields the closed-form geometric decay for the active
          dynamic period (prior to reaching M_floor):
        </P>
        <Formula>{"B_t = B_0 · (1 − p)^t"}</Formula>
        <P>
          When Mₜ decays to M_floor, the system transitions to a linear difference equation with a
          constant payment term:
        </P>
        <Formula>{"B_t = B_{t-1} · (1 + r) − M_floor"}</Formula>
      </section>

      <section className="space-y-4">
        <H2>Tokenized multi-variable payoff timeline</H2>
        <P>
          Month-by-month trajectory for a $10,000 liability at 24.99% APR: real-world dynamic decay
          Mₜ = max($35, 0.01 · Bₜ₋₁ + Iₜ) versus a commercial static model with M_fixed = $300.00.
        </P>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[900px] text-left text-[11px] md:text-xs font-mono">
            <thead className="bg-card/50 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
              <tr>
                <th className="px-2 py-2 font-medium">Period</th>
                <th className="px-2 py-2 font-medium">Begin bal.</th>
                <th className="px-2 py-2 font-medium">Dyn. min</th>
                <th className="px-2 py-2 font-medium">Interest</th>
                <th className="px-2 py-2 font-medium">Principal</th>
                <th className="px-2 py-2 font-medium">End bal.</th>
                <th className="px-2 py-2 font-medium">Static pay</th>
                <th className="px-2 py-2 font-medium">Static bal.</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE_ROWS.map((row) => (
                <tr key={row[0]} className="border-t border-border/50 text-muted-foreground">
                  {row.map((cell, i) => (
                    <td
                      key={`${row[0]}-${i}`}
                      className={`px-2 py-2 ${i === 0 ? "text-gold font-medium" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          On month 215, the calculated payment ($36.62) approaches M_floor = $35.00. From month 217
          onward, Mₜ is fixed at $35.00, accelerating final principal clearance.
        </P>
      </section>

      <section className="space-y-4">
        <H2>Quantitative narrative & economic analysis</H2>
        <H3>1. Deconstructing the minimum payment decay illusion</H3>
        <P>
          The fundamental trap of revolving credit is auto-adjusting minimums. Because principal
          reduction is a fixed percentage of the remaining balance, dollars allocated to principal
          decay exponentially:
        </P>
        <Formula>{"P_t = B_0 · p · (1 − p)^{t−1}"}</Formula>
        <P>
          During month 1 on a $10,000 balance, $100.00 goes to principal while $208.25 is consumed by
          interest. By month 48, the balance is $6,235.26 and the minimum has fallen from $308.25 to
          $192.20 — principal repayment slows to $62.35/month.
        </P>
        <P>
          This structure keeps the borrower in an asymptotic decay loop: as the balance shrinks, the
          required principal payment shrinks in parallel, sustaining utilization and maximizing
          cumulative interest collection.
        </P>

        <H3>2. Exposing commercial lead-generation calculator flaws</H3>
        <P>
          Commercial debt platforms routinely simplify payoff engines by treating the initial
          minimum (M₁ ≈ $308.25, often rounded to $300) as a fixed amortizing payment for the entire
          term.
        </P>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>
            <strong className="text-foreground">Commercial static model:</strong> 58 months (4.8
            years) · total interest $7,244.58
          </li>
          <li>
            <strong className="text-foreground">Real-world dynamic decay:</strong> 272 months (22.7
            years) · total interest $19,236.58
          </li>
        </ul>
        <P>
          Ignoring dynamic decay understates the payoff horizon by{" "}
          <strong className="text-foreground">17.9 years (214 months)</strong> and understates
          cumulative interest by{" "}
          <strong className="text-foreground">$11,992.00 (165.5% error)</strong>.
        </P>
        <div className="rounded-lg border border-border/60 bg-card/30 p-4 md:p-5 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gold">Cumulative interest comparison</p>
          <CompareBar label="Real-world dynamic decay" value="$19,236.58" widthPct={100} accent />
          <CompareBar label="Commercial static model" value="$7,244.58" widthPct={38} />
          <CompareBar label="Understated drag (165.5% error)" value="$11,992.00" widthPct={62} />
        </div>
        <P>
          Platforms perpetuate the flaw because a 22.7-year debt trap highlights unaccelerated
          minimums — steering users toward balance transfers or personal loans and CPA affiliate
          economics ($50–$250 per conversion).
        </P>
      </section>

      <section className="space-y-4">
        <H2>Strategic takeaways & decision rules</H2>
        <H3>Rule 1: Override dynamic decay via fixed payment pinning</H3>
        <P>
          Manually freeze monthly contribution at the initial payment amount (M_override = M₁ =
          $308.25) instead of following the issuer&apos;s decreasing minimum.
        </P>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Dynamic minimum decay: 272 months · $19,236.58 total interest</li>
          <li>Pinned payment ($308.25/mo): 56 months · $7,025.10 total interest</li>
          <li>
            <strong className="text-foreground">Net efficiency:</strong> 18.0 years saved · $12,211.48
            interest avoided
          </li>
        </ul>

        <H3>Rule 2: Execute discretionary cash-flow injection (ΔCₜ)</H3>
        <P>
          Allocating an extra ΔCₜ = $191.75 pushes total monthly service to a clean $500.00/mo.
        </P>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Accelerated strategy ($500.00/mo): 25 months · $2,382.10 total interest</li>
          <li>
            <strong className="text-foreground">Savings vs dynamic baseline:</strong> 20.6 years ·
            $16,854.48 interest saved
          </li>
        </ul>

        <div className="overflow-x-auto rounded-lg border border-gold/30 bg-secondary-surface/40">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="caption-top px-4 pt-4 pb-2 text-left text-[10px] uppercase tracking-[0.18em] text-gold">
              Strategy matrix — $10,000 balance @ 24.99% APR
            </caption>
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Repayment strategy</th>
                <th className="px-4 py-2 font-medium">Horizon</th>
                <th className="px-4 py-2 font-medium">Total interest</th>
                <th className="px-4 py-2 font-medium">Net savings</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">Unaccelerated dynamic minimum</td>
                <td className="px-4 py-2.5">272 months</td>
                <td className="px-4 py-2.5">$19,236.58</td>
                <td className="px-4 py-2.5">$0.00</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">Fixed pinned ($308.25/mo)</td>
                <td className="px-4 py-2.5">56 months</td>
                <td className="px-4 py-2.5">$7,025.10</td>
                <td className="px-4 py-2.5 text-gold">$12,211.48</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">Accelerated fixed ($500.00/mo)</td>
                <td className="px-4 py-2.5">25 months</td>
                <td className="px-4 py-2.5">$2,382.10</td>
                <td className="px-4 py-2.5 text-gold">$16,854.48</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
        Educational systems note — illustrative scenario math, not personalized financial advice.
        Contract terms vary by issuer.
      </p>
    </div>
  );
}

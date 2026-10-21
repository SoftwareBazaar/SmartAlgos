import type { ReactNode } from "react";
import { Day04Charts } from "@/components/finance/day-04-charts";
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
  ["B₀", "Direct federal student loan principal", "$75,000.00", "Direct Unsub / Grad PLUS"],
  ["APR", "Weighted average nominal interest rate", "6.80%", "r = 0.005667 / mo"],
  ["I_month", "Accrued monthly interest charge", "$425.00", "B₀ · (APR / 12)"],
  ["AGI_borrower", "Borrower adjusted gross income", "$85,000.00", "MFS tax return baseline"],
  ["AGI_spouse", "Spouse adjusted gross income", "$75,000.00", "Zero student loan liability"],
  ["AGI_household", "Combined household AGI", "$160,000.00", "MFJ tax return baseline"],
  ["FPL₁", "2026 FPL (family size 1)", "$15,060.00", "225% = $33,885.00"],
  ["FPL₂", "2026 FPL (family size 2)", "$20,460.00", "225% = $46,035.00"],
] as const;

const TIMELINE_ROWS = [
  ["Standard_10Yr", "Single_or_MFJ", "Amortized_10Yr", "863.10", "10,357.20", "0.00", "0.00", "0.00"],
  ["MFJ_10Pct", "Married_Joint", "IDR_10Pct_Grad", "949.71", "11,396.52", "0.00", "0.00", "-1,039.32"],
  ["MFS_10Pct", "Married_Separate", "IDR_10Pct_Grad", "425.96", "5,111.52", "1,850.00", "0.00", "+4,435.00"],
  ["MFS_5Pct", "Married_Separate", "IDR_5Pct_Undergrad", "212.98", "2,555.76", "1,850.00", "2,544.24", "+6,979.24"],
] as const;

export function Day04StudentLoanIdrRecertification() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <H2>Executive summary & parameter definitions</H2>
        <P>
          Income-Driven Repayment (IDR) plans for Direct Federal Student Loans calculate mandatory
          monthly payments as a percentage of discretionary income rather than underlying loan
          principal or interest rates. A critical arbitrage opportunity exists for married
          borrowers: choosing between Married Filing Separately (MFS) and Married Filing Jointly
          (MFJ) to isolate borrower income from household income.
        </P>
        <P>
          This study analyzes a <strong className="text-foreground">$75,000.00</strong> Direct
          Federal Student Loan at a weighted average{" "}
          <strong className="text-foreground">6.80% APR</strong> ($425.00/month interest accrual).
          We evaluate a married borrower earning{" "}
          <strong className="text-foreground">$85,000.00 AGI</strong> whose spouse earns{" "}
          <strong className="text-foreground">$75,000.00 AGI</strong> with zero student debt
          (household AGI = $160,000.00). Four configurations are contrasted: Standard 10-Year
          ($863.10/mo), MFJ 10% IDR ($949.71/mo), MFS 10% IDR ($425.96/mo), and MFS 5% Undergraduate
          IDR ($212.98/mo).
        </P>
        <P>
          Filing MFS reduces monthly payments from $949.71 to $425.96 —{" "}
          <strong className="text-foreground">$6,285.00/year</strong> in gross debt-service savings.
          After a <strong className="text-foreground">$1,850.00/year</strong> MFS tax penalty, net
          cash-flow arbitrage is{" "}
          <strong className="text-foreground">$4,435.00/year</strong>. Under the 5% undergraduate
          formula, an additional{" "}
          <strong className="text-foreground">$2,544.24/year</strong> government interest subsidy
          halts negative amortization.
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
        <Day04Charts />
      </section>

      <AdSlot id="day04-inline-1" />

      <section className="space-y-4">
        <H2>Mathematical framework</H2>
        <P>
          IDR monthly payments (M_IDR) apply a percentage factor α (0.05 undergraduate / 0.10
          graduate) to discretionary income (DI). DI equals AGI minus β · FPL where β = 2.25:
        </P>
        <Formula>{"DI = max(0,  AGI − β · FPL)\nM_IDR = (α · DI) / 12"}</Formula>
        <P>Married Filing Jointly aggregates incomes and uses FPL₂:</P>
        <Formula>
          {"M_IDR^MFJ = α · ( (AGI_borrower + AGI_spouse) − β · FPL₂ ) / 12"}
        </Formula>
        <P>Married Filing Separately isolates borrower AGI and FPL₁:</P>
        <Formula>{"M_IDR^MFS = α · ( AGI_borrower − β · FPL₁ ) / 12"}</Formula>
        <P>Annual debt-service delta from switching MFJ → MFS:</P>
        <Formula>
          {"ΔD = 12 · (M_IDR^MFJ − M_IDR^MFS)\n   = α · ( AGI_spouse − β · (FPL₂ − FPL₁) )"}
        </Formula>
        <P>Net annual arbitrage after the MFS tax penalty T_penalty:</P>
        <Formula>{"G_net = ΔD − T_penalty"}</Formula>
        <P>
          When M_IDR &lt; I_month, unpaid interest is 100% subsidized under current IDR rules:
        </P>
        <Formula>{"S_interest = 12 · max(0,  I_month − M_IDR)"}</Formula>
      </section>

      <section className="space-y-4">
        <H2>Tokenized multi-variable payoff timeline</H2>
        <P>
          Annual cash-flow outcomes, tax penalties, and government interest subsidies for a
          $75,000.00 balance across filing configurations. Under MFS 5% Undergraduate IDR, the
          borrower pays $212.98/mo, receives $2,544.24/yr in interest subsidies, and achieves
          $6,979.24/yr in combined net cash-flow and interest benefit.
        </P>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[960px] text-left text-[11px] md:text-xs font-mono">
            <caption className="caption-top px-3 pt-3 pb-2 text-left text-[10px] uppercase tracking-[0.14em] text-gold font-sans">
              Student loan IDR — annual filing / formula comparison
            </caption>
            <thead className="bg-card/50 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
              <tr>
                <th className="px-2 py-2 font-medium">Scenario</th>
                <th className="px-2 py-2 font-medium">Filing</th>
                <th className="px-2 py-2 font-medium">Formula</th>
                <th className="px-2 py-2 font-medium">Monthly</th>
                <th className="px-2 py-2 font-medium">Annual Paid</th>
                <th className="px-2 py-2 font-medium">Tax Penalty</th>
                <th className="px-2 py-2 font-medium">Gov Subsidy</th>
                <th className="px-2 py-2 font-medium">Net Gain</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE_ROWS.map((row) => (
                <tr
                  key={row[0]}
                  className="border-t border-border/50 text-muted-foreground"
                >
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
      </section>

      <AdSlot id="day04-inline-2" />

      <section className="space-y-4">
        <H2>Economic analysis & decision rules</H2>

        <div className="overflow-x-auto rounded-lg border border-gold/30 bg-secondary-surface/40">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="caption-top px-4 pt-4 pb-2 text-left text-[10px] uppercase tracking-[0.18em] text-gold">
              Annual cash-flow & subsidy arbitrage — $75K @ 6.8%
            </caption>
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Strategy</th>
                <th className="px-4 py-2 font-medium">Annual paid</th>
                <th className="px-4 py-2 font-medium">Subsidy</th>
                <th className="px-4 py-2 font-medium">Net vs baseline</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">MFJ 10% IDR</td>
                <td className="px-4 py-2.5">$11,396.52</td>
                <td className="px-4 py-2.5">$0</td>
                <td className="px-4 py-2.5">−$1,039</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">Standard 10-Year</td>
                <td className="px-4 py-2.5">$10,357.20</td>
                <td className="px-4 py-2.5">$0</td>
                <td className="px-4 py-2.5">$0 baseline</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">MFS 10% IDR (Grad)</td>
                <td className="px-4 py-2.5">$5,111.52</td>
                <td className="px-4 py-2.5">$0</td>
                <td className="px-4 py-2.5 text-gold">+$4,435</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">MFS 5% IDR (Undergrad)</td>
                <td className="px-4 py-2.5">$2,555.76</td>
                <td className="px-4 py-2.5 text-gold">$2,544</td>
                <td className="px-4 py-2.5 text-gold">+$6,979</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H3>1. Spousal income contamination trap</H3>
        <P>
          Filing MFJ aggregates both spouses&apos; incomes. Adding a $75,000 spouse with zero loans
          lifts household discretionary income from $51,115.00 to $113,965.00, pushing the IDR
          payment from $425.96/mo to $949.71/mo —{" "}
          <strong className="text-foreground">$86.61/mo higher</strong> than Standard 10-Year
          amortization and eliminating IDR&apos;s liquidity benefit.
        </P>

        <H3>2. MFS tax penalty vs interest subsidy</H3>
        <P>
          MFS isolates the borrower&apos;s $85,000 AGI but raises federal tax liability (lost
          $2,500 student loan interest deduction, compressed brackets). On $160,000 combined income,
          the MFS penalty is about <strong className="text-foreground">$1,850/year</strong>.
        </P>
        <P>
          Gross loan reduction $6,285 − tax penalty $1,850 ={" "}
          <strong className="text-foreground">+$4,435/year</strong> net cash-flow. Under 5%
          undergraduate IDR ($212.98/mo &lt; $425.00 interest), unpaid interest ($212.02/mo) is
          waived — <strong className="text-foreground">$2,544.24/year</strong> subsidy preventing
          negative amortization.
        </P>

        <H3>Rule 1 — Execute the MFS arbitrage test</H3>
        <Formula>
          {
            "ΔD = 12 · (M_IDR^MFJ − M_IDR^MFS) = $6,285.00 / year\nIf ΔD > T_penalty  →  $6,285 > $1,850  →  EXECUTE MFS FILING"
          }
        </Formula>
        <P>
          Because ΔD exceeds T_penalty by $4,435/year, file MFS to maximize household wealth (subject
          to individual tax circumstances).
        </P>

        <H3>Rule 2 — Compress AGI with pre-tax deductions</H3>
        <P>
          IDR uses AGI, not gross income. Every $1.00 to a pre-tax 401(k), 403(b), HSA, or
          Traditional IRA reduces AGI dollar-for-dollar. A $10,000 pre-tax contribution cuts AGI
          from $85,000 to $75,000 and reduces a 10% IDR payment by{" "}
          <strong className="text-foreground">$83.33/month</strong> ($1,000/year) — an immediate 10%
          cash-flow bonus on top of ordinary tax savings.
        </P>
        <Formula>{"ΔM_month = (α · ΔAGI) / 12 = (0.10 · $10,000) / 12 = $83.33"}</Formula>
      </section>

      <AdSlot id="day04-inline-3" />

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
        Educational systems note — illustrative scenario math, not personalized tax or student-loan
        advice. IDR formulas, FPL thresholds, and subsidy rules change; confirm current Department of
        Education and IRS guidance before filing or recertifying.
      </p>
    </div>
  );
}

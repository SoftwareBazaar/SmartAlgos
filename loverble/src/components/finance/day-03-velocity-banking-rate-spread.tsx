import type { ReactNode } from "react";
import { Day03Charts } from "@/components/finance/day-03-charts";
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
  ["P_mort", "Primary mortgage principal balance", "$300,000.00", "P_mort > 0"],
  ["APR_mort", "Primary mortgage fixed interest rate", "3.50%", "r_mort = 0.002917 / mo"],
  ["M_mort", "Mandatory monthly P&I payment", "$1,347.13", "30-year amortizing"],
  ["C_HELOC", "HELOC credit line limit", "$25,000.00", "Second lien position"],
  ["APR_HELOC", "HELOC floating interest rate", "9.50% / 12.50%", "SOFR + margin"],
  ["B_chunk", "Lump-sum mortgage principal chunk", "$10,000.00", "≤ C_HELOC"],
  ["Y_income", "Monthly gross income (Day 1 sweep)", "$8,000.00", "Deposited into HELOC"],
  ["E_expenses", "Monthly living expenses (30d outflow)", "$5,500.00", "Charged from HELOC"],
  ["S_net", "Net monthly surplus cash-flow", "$2,500.00", "Y_income − E_expenses"],
] as const;

const TIMELINE_ROWS = [
  ["M12", "Baseline", "294,711.62", "1,347.13", "0.00", "0.00", "294,224.08", "10,389.64"],
  ["M60", "Baseline", "268,903.11", "1,347.13", "0.00", "0.00", "268,331.58", "48,159.38"],
  ["M12", "Direct_Extra_Sweep", "266,159.08", "1,347.13", "2,500.00", "0.00", "264,428.18", "9,484.34"],
  ["M60", "Direct_Extra_Sweep", "117,283.42", "1,347.13", "2,500.00", "0.00", "114,978.38", "35,821.05"],
  ["M12", "HELOC_Optimal", "266,580.40", "1,347.13", "2,462.40", "338.43", "264,853.53", "9,832.32"],
  ["M60", "HELOC_Optimal", "118,356.12", "1,347.13", "2,462.40", "1,692.15", "116,057.17", "37,572.84"],
  ["M12", "HELOC_Spread_Failure", "289,352.12", "1,347.13", "440.10", "718.80", "288,848.91", "11,028.44"],
  ["M60", "HELOC_Spread_Failure", "241,280.11", "1,347.13", "440.10", "3,594.00", "240,636.98", "49,021.28"],
] as const;

export function Day03VelocityBankingRateSpread() {
  return (
    <div className="space-y-8 text-foreground">
      <section className="space-y-4">
        <H2>Executive summary & parameter definitions</H2>
        <P>
          Velocity banking—the strategy of using a revolving Home Equity Line of Credit (HELOC) to
          chunk down primary mortgage principal—is heavily promoted as a shortcut to debt freedom.
          Advocates claim that routing gross monthly income directly into a HELOC minimizes Average
          Daily Balance (ADB) interest charges while accelerating mortgage amortization.
        </P>
        <P>
          Quantitative modeling shows significant interest rate spread risk and operational friction.
          When a borrower chunks a low-rate primary mortgage (e.g.,{" "}
          <strong className="text-foreground">3.50% fixed</strong>) with a high-rate floating HELOC
          (e.g., <strong className="text-foreground">9.50%–12.50% variable</strong>), the spread{" "}
          <span className="font-mono text-foreground/90">ΔR = APR_HELOC − APR_mort</span> works
          against the borrower. Unless net monthly surplus is exceptionally large relative to chunk
          size, HELOC interest routinely exceeds interest saved on the mortgage.
        </P>
        <P>
          This study evaluates a <strong className="text-foreground">$300,000.00</strong> primary
          mortgage at <strong className="text-foreground">3.50% fixed</strong> ($1,347.13/mo P&I)
          paired with a <strong className="text-foreground">$25,000.00 HELOC</strong> at{" "}
          <strong className="text-foreground">9.50% variable</strong>. We model a{" "}
          <strong className="text-foreground">$10,000.00</strong> principal chunk under Optimal
          Cash-Flow ($2,500.00/mo surplus) and Spread Failure ($500.00/mo surplus at 12.50% HELOC
          APR). Direct Principal Sweeping achieves equal or superior principal reduction while
          eliminating 100% of HELOC interest drag, closing costs, and floating rate risk.
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
        <Day03Charts />
      </section>

      <AdSlot id="day03-inline-1" />

      <section className="space-y-4">
        <H2>Mathematical framework</H2>
        <P>
          A HELOC calculates monthly interest using Average Daily Balance (ADB) accounting. When
          gross income Y_income is swept on Day 1 and living expenses E_expenses are drawn linearly
          over D = 30 days:
        </P>
        <Formula>
          {"ADB = B_chunk − Y_income + ∫₀¹ E_expenses · t dt  =  B_chunk − Y_income + E_expenses / 2"}
        </Formula>
        <P>Baseline substitution (B_chunk = $10,000, Y_income = $8,000, E_expenses = $5,500):</P>
        <Formula>{"ADB = $10,000 − $8,000 + $5,500 / 2  =  $4,750.00"}</Formula>
        <P>Monthly HELOC interest charge:</P>
        <Formula>
          {"I_HELOC = ADB · (APR_HELOC / 12)  =  $4,750.00 · (0.095 / 12)  =  $37.60 / month"}
        </Formula>
        <P>Interest saved by injecting $10,000 into the 3.50% mortgage:</P>
        <Formula>
          {"ΔI_mort = B_chunk · (APR_mort / 12)  =  $10,000 · (0.035 / 12)  =  $29.17 / month"}
        </Formula>
        <P>
          Arbitrage deficit: paying <strong className="text-foreground">$37.60/mo</strong> in HELOC
          interest to save <strong className="text-foreground">$29.17/mo</strong> on the mortgage
          creates a <strong className="text-foreground">−$8.43/mo</strong> net loss before HELOC
          maintenance fees or closing costs.
        </P>
      </section>

      <section className="space-y-4">
        <H2>Tokenized multi-variable payoff timeline</H2>
        <P>
          Five-year amortization outcomes for a $300,000.00 liability at 3.50% APR across four
          execution models. Direct Extra Principal Sweep achieves the lowest ending balance
          ($114,978.38 at Month 60) and lowest total interest ($35,821.05) with zero HELOC drag.
        </P>
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full min-w-[960px] text-left text-[11px] md:text-xs font-mono">
            <caption className="caption-top px-3 pt-3 pb-2 text-left text-[10px] uppercase tracking-[0.14em] text-gold font-sans">
              Mortgage_Primary_03 — 5-year strategy comparison
            </caption>
            <thead className="bg-card/50 text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans">
              <tr>
                <th className="px-2 py-2 font-medium">Period</th>
                <th className="px-2 py-2 font-medium">Strategy</th>
                <th className="px-2 py-2 font-medium">Beg Mort</th>
                <th className="px-2 py-2 font-medium">P&amp;I</th>
                <th className="px-2 py-2 font-medium">Extra Sweep</th>
                <th className="px-2 py-2 font-medium">HELOC Int YTD</th>
                <th className="px-2 py-2 font-medium">End Mort</th>
                <th className="px-2 py-2 font-medium">Total Int YTD</th>
              </tr>
            </thead>
            <tbody>
              {TIMELINE_ROWS.map((row) => (
                <tr
                  key={`${row[0]}-${row[1]}`}
                  className="border-t border-border/50 text-muted-foreground"
                >
                  {row.map((cell, i) => (
                    <td
                      key={`${row[0]}-${row[1]}-${i}`}
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

      <AdSlot id="day03-inline-2" />

      <section className="space-y-4">
        <H2>Economic analysis & decision rules</H2>

        <div className="overflow-x-auto rounded-lg border border-gold/30 bg-secondary-surface/40">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="caption-top px-4 pt-4 pb-2 text-left text-[10px] uppercase tracking-[0.18em] text-gold">
              5-year cumulative outflow — $300K @ 3.5%
            </caption>
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Strategy</th>
                <th className="px-4 py-2 font-medium">Remaining bal</th>
                <th className="px-4 py-2 font-medium">Interest</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">
                  Direct Extra Principal Sweep ($2,500/mo)
                </td>
                <td className="px-4 py-2.5 text-gold">$114,978.38</td>
                <td className="px-4 py-2.5 text-gold">$35,821</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">
                  HELOC Chunking Optimal ($2,500/mo @ 9.5%)
                </td>
                <td className="px-4 py-2.5">$116,057.17</td>
                <td className="px-4 py-2.5">$37,572</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">Baseline Mortgage ($1,347/mo P&amp;I)</td>
                <td className="px-4 py-2.5">$268,331.58</td>
                <td className="px-4 py-2.5">$48,159</td>
              </tr>
              <tr className="border-t border-border/50">
                <td className="px-4 py-2.5 text-muted-foreground">
                  HELOC Spread Failure ($500/mo @ 12.5%)
                </td>
                <td className="px-4 py-2.5">$240,636.98</td>
                <td className="px-4 py-2.5">$49,021</td>
              </tr>
            </tbody>
          </table>
        </div>

        <H3>Rule 1 — Apply the direct cash sweep strategy</H3>
        <P>
          If a borrower possesses monthly surplus S_net, apply it directly to primary mortgage
          principal as an unbudgeted curtailment.
        </P>
        <P>
          Direct Sweep: <strong className="text-foreground">$114,978.38</strong> ending balance in 5
          years with $0.00 HELOC fees/interest. HELOC Chunking:{" "}
          <strong className="text-foreground">$116,057.17</strong> ending balance while incurring{" "}
          <strong className="text-foreground">$1,692.15</strong> in unnecessary HELOC interest. Net
          gain: direct sweeping preserves <strong className="text-foreground">$1,078.79</strong> more
          equity and eliminates second-lien encumbrance.
        </P>

        <H3>Rule 2 — Enforce the rate spread circuit breaker</H3>
        <P>
          Before executing any revolving credit line chunking strategy, verify that effective HELOC
          interest on the Average Daily Balance does not exceed the primary debt rate:
        </P>
        <Formula>
          {
            "APR_HELOC · (ADB / B_chunk) < APR_mort\n0.095 · ($4,750 / $10,000) = 4.5125%  >  3.50%   →  CIRCUIT BREAKER TRIPPED"
          }
        </Formula>
        <P>
          Because <strong className="text-foreground">4.5125% &gt; 3.50%</strong>, the strategy is
          mathematically negative-value and must be aborted in favor of direct principal
          curtailment.
        </P>
      </section>

      <AdSlot id="day03-inline-3" />

      <p className="text-xs text-muted-foreground border-t border-border/50 pt-4">
        Educational systems note — illustrative scenario math, not personalized financial advice.
        HELOC APRs, ADB methods, and mortgage curtailment rules vary by lender.
      </p>
    </div>
  );
}

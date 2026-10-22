import {
  KE_FOREX_HOURS_SLUG,
  KE_FULIZA_SLUG,
  KE_HELB_SLUG,
  KE_MMF_TBILL_SLUG,
  KE_NET_SALARY_SLUG,
} from "@/lib/finance-notes";

import netSalary from "@/content/finance-ke/net-salary-calculator-paye-sha-housing-levy.md?raw";
import fuliza from "@/content/finance-ke/fuliza-charges-mobile-loan-apr-calculator.md?raw";
import mmf from "@/content/finance-ke/money-market-fund-vs-treasury-bills-kenya-net-returns.md?raw";
import forex from "@/content/finance-ke/forex-trading-hours-kenya-eat-cma-tax-guide.md?raw";
import helb from "@/content/finance-ke/helb-loan-repayment-penalty-waiver-strategy.md?raw";

export const kenyaMarkdownBySlug: Record<string, string> = {
  [KE_NET_SALARY_SLUG]: netSalary,
  [KE_FULIZA_SLUG]: fuliza,
  [KE_MMF_TBILL_SLUG]: mmf,
  [KE_FOREX_HOURS_SLUG]: forex,
  [KE_HELB_SLUG]: helb,
};

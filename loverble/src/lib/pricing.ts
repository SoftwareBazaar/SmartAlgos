export const PRICING = {
  consultation: 7.99,
  researchFull: 10,
  liveRetail: 149.99,
  liveInstitutional: 499.99,
  strategyFile: 49,
} as const;

/** Paystack Capital checkout is charged in KES at this fixed desk rate. */
export const KES_RATE = 150;

export function usdToKes(usd: number): number {
  return Math.round(Number(usd) * KES_RATE);
}

export function kesToUsd(kes: number): number {
  return Math.round((Number(kes) / KES_RATE) * 100) / 100;
}

export function formatUsd(amount: number): string {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

export function formatKes(amount: number): string {
  const n = Math.round(Number(amount) || 0);
  return `KSh ${n.toLocaleString("en-KE")}`;
}

export function formatUsdWithKes(usd: number): string {
  return `${formatUsd(usd)} · ${formatKes(usdToKes(usd))}`;
}

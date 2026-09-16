export const PRICING = {
  consultation: 7.99,
  researchFull: 10,
  liveRetail: 149.99,
  liveInstitutional: 499.99,
  strategyFile: 49,
} as const;

export function formatUsd(amount: number): string {
  return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`;
}

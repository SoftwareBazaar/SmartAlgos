/** QuantConnect listing URLs — set VITE_QC_* in Vercel or leave empty for platform home. */
const QC_URLS: Record<string, string> = {
  "gold-momentum": import.meta.env.VITE_QC_GOLD_MOMENTUM_URL || "",
  "fx-mean-reversion": import.meta.env.VITE_QC_FX_MEAN_REVERSION_URL || "",
};

export function getStrategyVerificationUrl(slug: string, fallback = "https://www.quantconnect.com"): string {
  const configured = QC_URLS[slug]?.trim();
  return configured || fallback;
}

export function hasDirectVerificationLink(slug: string): boolean {
  return Boolean(QC_URLS[slug]?.trim());
}

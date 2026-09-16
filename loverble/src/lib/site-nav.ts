export const PRIMARY_NAV = [
  { label: "Strategies", to: "/strategies" },
  { label: "Track Record", to: "/performance" },
  { label: "Research", to: "/research" },
  { label: "Strategy Desk", to: "/consultation" },
] as const;

export const MOBILE_NAV = [
  { label: "Live Strategies", to: "/strategies" },
  { label: "Track Record", to: "/performance" },
  { label: "Research Notes", to: "/research" },
  { label: "Subscriptions", to: "/", hash: "pricing" },
  { label: "Custom Quant", to: "/", hash: "custom-quant" },
  { label: "Client Portal", to: "/portal" },
] as const;

const PUBLIC_EXACT = new Set([
  "/",
  "/research",
  "/performance",
  "/consultation",
  "/book",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimers",
  "/security-policy",
  "/legal",
  "/auth",
  "/payment-callback",
]);

export function isPublicSitePath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/strategies")) return true;
  return false;
}

export function isPortalPath(pathname: string): boolean {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

export function isBarePublicPath(pathname: string): boolean {
  return pathname === "/";
}

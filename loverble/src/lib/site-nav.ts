export const PRIMARY_NAV = [
  { label: "Strategies", to: "/strategies" },
  { label: "Track Record", to: "/performance" },
  { label: "Research", to: "/research" },
  { label: "Decision Math", to: "/finance" },
  { label: "Store", to: "/store" },
  { label: "Strategy Desk", to: "/consultation" },
] as const;

export const MOBILE_NAV = [
  { label: "Live Strategies", to: "/strategies" },
  { label: "Track Record", to: "/performance" },
  { label: "Research Notes", to: "/research" },
  { label: "Decision Math", to: "/finance" },
  { label: "Excel Store", to: "/store" },
  { label: "Strategy Desk", to: "/consultation" },
  { label: "Client Portal", to: "/portal" },
  { label: "Support research", to: "/support" },
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
  "/financial-disclaimer",
  "/terms",
  "/disclaimers",
  "/security-policy",
  "/legal",
  "/auth",
  "/support",
  "/payment-callback",
  "/store",
  "/marketplace",
]);

export function isPublicSitePath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/strategies")) return true;
  if (pathname.startsWith("/research")) return true;
  if (pathname.startsWith("/finance")) return true;
  if (pathname.startsWith("/store")) return true;
  return false;
}

export function isPortalPath(pathname: string): boolean {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

export function isSupportPath(pathname: string): boolean {
  return pathname === "/support";
}

export function isBarePublicPath(pathname: string): boolean {
  return pathname === "/";
}

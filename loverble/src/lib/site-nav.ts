export const PRIMARY_NAV = [
  { label: "Financial Systems", to: "/systems" },
  { label: "Quant Strategies", to: "/strategies" },
  { label: "Decision Math", to: "/finance" },
  { label: "Store", to: "/store" },
  { label: "About", to: "/about" },
  { label: "Book a desk", to: "/consultation" },
] as const;

export const MOBILE_NAV = [
  { label: "Financial Systems", to: "/systems" },
  { label: "Quant Strategies", to: "/strategies" },
  { label: "Decision Math", to: "/finance" },
  { label: "Research Notes", to: "/research" },
  { label: "Excel Store", to: "/store" },
  { label: "About", to: "/about" },
  { label: "Book a desk", to: "/consultation" },
  { label: "Client Portal", to: "/portal" },
  { label: "Support research", to: "/support" },
] as const;

const PUBLIC_EXACT = new Set([
  "/",
  "/systems",
  "/insights",
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
  if (pathname.startsWith("/insights")) return true;
  if (pathname.startsWith("/systems")) return true;
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

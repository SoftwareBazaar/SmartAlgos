import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { StickyNav } from "@/components/premium/sticky-nav";
import { company } from "@/lib/mock-data";

type Props = {
  children: ReactNode;
  /** Shown under logo on mobile — e.g. "Book advisory" */
  tagline?: string;
};

/** Minimal chrome for pages shared directly with clients (no app sidebar). */
export function PublicStandaloneLayout({ children, tagline = "Advisory booking" }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <StickyNav>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 px-6 py-3 md:py-4">
          <Link to="/" className="flex items-center cursor-pointer shrink-0" title="Smart Algos Capital home">
            <BrandLogo variant="nav" />
          </Link>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground text-right">
            {tagline}
          </div>
        </div>
      </StickyNav>

      <main className="flex-1 pt-24 pb-16">{children}</main>

      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <span>{company.name}</span>
          <a href="https://www.smartalgosts.com" className="text-gold hover:underline">
            www.smartalgosts.com
          </a>
        </div>
      </footer>
    </div>
  );
}

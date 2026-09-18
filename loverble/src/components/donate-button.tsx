import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function DonateButton({ compact = false, footer = false }: { compact?: boolean; footer?: boolean }) {
  return (
    <Link
      to="/support"
      className={
        footer
          ? "text-muted-foreground hover:text-gold transition cursor-pointer"
          : `inline-flex items-center justify-center gap-2 rounded-sm border border-gold/60 bg-gold/10 text-gold hover:bg-gold/20 transition font-semibold uppercase tracking-wider cursor-pointer ${compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs"}`
      }
    >
      {!footer && <Heart className="h-3.5 w-3.5" />}
      {footer ? "Support research" : compact ? "Donate" : "Support Research"}
    </Link>
  );
}

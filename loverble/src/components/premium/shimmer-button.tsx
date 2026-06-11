import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
};

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-gold-soft border border-gold/20",
  outline: "border border-gold/35 text-gold hover:bg-gold/10",
  ghost: "border border-border bg-secondary-surface/60 text-secondary-foreground hover:bg-card",
};

export function ShimmerButton({ children, to, href, variant = "primary", className, onClick }: Props) {
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition duration-200 cursor-pointer",
    variants[variant],
    className,
  );
  const inner = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (to) return <Link to={to} className={classes}>{inner}</Link>;
  if (href) return <a href={href} className={classes}>{inner}</a>;
  return (
    <button type="button" onClick={onClick} className={classes}>
      {inner}
    </button>
  );
}

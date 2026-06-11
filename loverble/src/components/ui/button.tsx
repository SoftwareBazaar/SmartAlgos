import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

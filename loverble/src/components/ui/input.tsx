import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm",
        "focus:outline-none focus:border-gold/60",
        className,
      )}
      {...props}
    />
  );
}

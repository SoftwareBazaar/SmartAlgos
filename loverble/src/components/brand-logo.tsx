import { cn } from "@/lib/utils";

const sizeClass = {
  nav: "h-9 w-auto max-w-[132px]",
  sidebar: "h-10 w-auto max-w-[148px]",
  auth: "h-14 w-auto max-w-[200px]",
  footer: "h-8 w-auto max-w-[120px]",
} as const;

export function BrandLogo({
  variant = "nav",
  className,
}: {
  variant?: keyof typeof sizeClass;
  className?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt="Smart Algos Capital"
      width={132}
      height={36}
      className={cn(sizeClass[variant], "object-contain transition-transform duration-200 hover:scale-[1.02]", className)}
    />
  );
}

import { cn } from "@/lib/utils";

const sizeClass = {
  nav: "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20",
  sidebar: "h-14 w-14 sm:h-16 sm:w-16",
  auth: "h-20 w-20 sm:h-24 sm:w-24",
  footer: "h-12 w-12 sm:h-14 sm:w-14",
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
      width={80}
      height={80}
      className={cn(sizeClass[variant], "object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02]", className)}
    />
  );
}

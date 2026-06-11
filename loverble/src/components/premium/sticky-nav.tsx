import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StickyNav({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav-scrolled shadow-lg shadow-black/20" : "glass-nav",
      )}
    >
      {children}
    </nav>
  );
}

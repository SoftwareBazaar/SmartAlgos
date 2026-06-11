import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { GlowCard } from "./glow-card";
import { MotionItem, MotionReveal } from "@/components/motion-reveal";

type BentoItem = {
  icon: LucideIcon;
  title: string;
  items: string[];
  link: string;
  wide?: boolean;
};

export function PremiumBento({ items }: { items: BentoItem[] }) {
  return (
    <MotionReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {items.map(({ icon: Icon, title, items: bullets, link, wide }) => (
        <MotionItem key={title} className={wide ? "md:col-span-2 lg:col-span-1" : undefined}>
          <Link to={link} className="block h-full cursor-pointer">
            <GlowCard accent className="h-full p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 bg-gold/10">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-gold shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </GlowCard>
          </Link>
        </MotionItem>
      ))}
    </MotionReveal>
  );
}

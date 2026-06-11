import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Strategy } from "@/lib/mock-data";
import { GlowCard } from "./glow-card";
import { MotionItem, MotionReveal } from "@/components/motion-reveal";

export function StrategySpotlight({
  strategies,
  statusColor,
}: {
  strategies: Strategy[];
  statusColor: (s: string) => string;
}) {
  return (
    <MotionReveal className="grid md:grid-cols-2 gap-4">
      {strategies.map((s) => (
        <MotionItem key={s.slug}>
          <Link to="/strategies/$slug" params={{ slug: s.slug }} className="block h-full cursor-pointer">
            <GlowCard accent className="h-full p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold group-hover:text-gold transition-colors">{s.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColor(s.status)}`}>{s.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.asset} · {s.platform}</span>
                <span className="inline-flex items-center gap-1 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </GlowCard>
          </Link>
        </MotionItem>
      ))}
    </MotionReveal>
  );
}

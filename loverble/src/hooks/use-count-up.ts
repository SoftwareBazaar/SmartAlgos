import { useEffect, useRef, useState } from "react";

export function useCountUp(
  end: number,
  { duration = 1200, decimals = 0, enabled = true }: { duration?: number; decimals?: number; enabled?: boolean } = {},
) {
  const [value, setValue] = useState(enabled ? 0 : end);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - (1 - t) ** 3;
          setValue(end * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, enabled]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return { ref, formatted, raw: value };
}

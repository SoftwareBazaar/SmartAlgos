import { useEffect, useRef, useState } from "react";

export function useCountUp(
  end: number,
  { duration = 1200, decimals = 0, enabled = true }: { duration?: number; decimals?: number; enabled?: boolean } = {},
) {
  // Always start at the real value so SSR / failed observers never flash zeros.
  const [value, setValue] = useState(end);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;

    if (!enabled) {
      setValue(end);
      return;
    }

    const el = ref.current;
    if (!el) {
      setValue(end);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - (1 - t) ** 3;
        setValue(end * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setValue(end);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) run();
      },
      { threshold: 0.15, rootMargin: "80px 0px" },
    );
    observer.observe(el);

    const fallback = window.setTimeout(() => {
      if (!started.current) setValue(end);
    }, 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [end, duration, enabled]);

  const formatted =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return { ref, formatted, raw: value };
}

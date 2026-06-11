import { useEffect, useRef } from "react";

type Bar = { x: number; h: number; bull: boolean; speed: number };

export function MarketVideoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let bars: Bar[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initBars = (w: number, h: number) => {
      const count = Math.floor(w / 14);
      bars = Array.from({ length: count }, (_, i) => ({
        x: i * 14,
        h: 20 + Math.random() * (h * 0.35),
        bull: Math.random() > 0.42,
        speed: 0.4 + Math.random() * 0.8,
      }));
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;

      ctx.fillStyle = "oklch(0.14 0.035 250)";
      ctx.fillRect(0, 0, w, h);

      const gridStep = 48;
      ctx.strokeStyle = "oklch(0.30 0.04 252 / 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const baseY = h * 0.72;
      bars.forEach((bar) => {
        if (!reduceMotion) {
          bar.h += (Math.random() - 0.5) * bar.speed * 2;
          bar.h = Math.max(12, Math.min(h * 0.45, bar.h));
        }
        const color = bar.bull ? "oklch(0.72 0.18 155 / 0.55)" : "oklch(0.65 0.22 25 / 0.45)";
        ctx.fillStyle = color;
        ctx.fillRect(bar.x, baseY - bar.h, 8, bar.h);
      });

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "oklch(0.78 0.13 85 / 0)");
      grad.addColorStop(0.4, "oklch(0.78 0.13 85 / 0.35)");
      grad.addColorStop(1, "oklch(0.78 0.13 85 / 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, baseY - h * 0.22);
      for (let x = 0; x <= w; x += 24) {
        const y = baseY - h * 0.22 - Math.sin(x * 0.012 + Date.now() * 0.0004) * 40 - x * 0.02;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    initBars(canvas.clientWidth, canvas.clientHeight);
    draw();

    const onResize = () => {
      resize();
      initBars(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full object-cover"
      aria-hidden
    />
  );
}

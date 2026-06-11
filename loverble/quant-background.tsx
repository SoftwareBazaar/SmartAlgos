import { useEffect, useRef } from "react";

/**
 * Premium animated background for the dashboard.
 * - Subtle drifting candlestick / tick stream
 * - Slow grid drift
 * - Floating numeric data motes
 * Dark, institutional, GPU-cheap (single canvas, capped DPR).
 */
export function QuantBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Tick stream lines (price-like polylines drifting upward)
    const lines = Array.from({ length: 7 }, (_, i) => ({
      y: 80 + i * 90 + Math.random() * 40,
      speed: 0.18 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
      amp: 14 + Math.random() * 18,
      hue: i % 2 === 0 ? "rgba(214,178,82,OP)" : "rgba(120,170,210,OP)",
      alpha: 0.05 + Math.random() * 0.08,
    }));

    // Numeric motes
    const motes = Array.from({ length: 22 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -0.0002 - Math.random() * 0.0004,
      txt: (Math.random() > 0.5 ? "+" : "-") + (Math.random() * 3).toFixed(2) + "%",
      size: 9 + Math.random() * 3,
      alpha: 0.06 + Math.random() * 0.08,
      bull: Math.random() > 0.45,
    }));

    let raf = 0;
    let t = 0;
    let gridOffset = 0;
    const draw = () => {
      t += 0.012;
      gridOffset = (gridOffset + 0.15) % 60;
      ctx.clearRect(0, 0, w, h);

      // Radial glow
      const grad = ctx.createRadialGradient(w * 0.65, h * 0.35, 0, w * 0.65, h * 0.35, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(214,178,82,0.06)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(120,140,170,0.05)";
      ctx.lineWidth = 1;
      for (let x = -gridOffset; x < w; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = -gridOffset; y < h; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Drifting price lines
      for (const L of lines) {
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = L.hue.replace("OP", L.alpha.toFixed(3));
        for (let x = 0; x <= w; x += 6) {
          const y =
            L.y +
            Math.sin(x * 0.012 + t * L.speed + L.phase) * L.amp +
            Math.sin(x * 0.04 + t * L.speed * 1.7) * (L.amp * 0.3);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        L.y += Math.sin(t * 0.5 + L.phase) * 0.15;
      }

      // Candlestick column far right (subtle)
      const cw = 8, gap = 6;
      const startX = w - 14 * (cw + gap);
      for (let i = 0; i < 14; i++) {
        const seed = Math.sin(t * 0.4 + i * 1.3);
        const cy = h * 0.55 + Math.sin(t * 0.2 + i) * 30;
        const len = 16 + Math.abs(seed) * 22;
        const up = seed > 0;
        ctx.fillStyle = up ? "rgba(96,180,140,0.08)" : "rgba(220,110,110,0.08)";
        ctx.fillRect(startX + i * (cw + gap), cy - len / 2, cw, len);
        ctx.strokeStyle = up ? "rgba(96,180,140,0.18)" : "rgba(220,110,110,0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX + i * (cw + gap) + cw / 2, cy - len / 2 - 6);
        ctx.lineTo(startX + i * (cw + gap) + cw / 2, cy + len / 2 + 6);
        ctx.stroke();
      }

      // Motes
      ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy;
        if (m.y < -0.05) { m.y = 1.05; m.x = Math.random(); }
        if (m.x < -0.05) m.x = 1.05; if (m.x > 1.05) m.x = -0.05;
        ctx.fillStyle = m.bull
          ? `rgba(96,180,140,${m.alpha})`
          : `rgba(220,110,110,${m.alpha})`;
        ctx.fillText(m.txt, m.x * w, m.y * h);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/80" />
    </div>
  );
}

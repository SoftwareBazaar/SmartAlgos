import type { ExcelModuleProduct } from "@/lib/excel-module-catalog";

type Variant = "card" | "hero" | "gallery";

/** Dashboard-style mockups so buyers see what kind of sheet they’re buying. */
export function ProductVisual({
  product,
  variant = "card",
  className = "",
}: {
  product: ExcelModuleProduct;
  variant?: Variant;
  className?: string;
}) {
  const size =
    variant === "hero"
      ? "aspect-[16/10] max-w-full w-full"
      : variant === "gallery"
        ? "aspect-[16/10] w-full"
        : "aspect-[4/3] w-full max-w-[240px]";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border/60 bg-[#0a0f1a] shadow-sm ${size} ${className}`}
      role="img"
      aria-label={product.previewLabel}
    >
      {product.isBundle ? <BundleMock /> : <ModuleMock id={product.id} label={product.previewLabel} />}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
        <p className="text-[10px] uppercase tracking-wider text-gold/90">{product.previewLabel}</p>
      </div>
    </div>
  );
}

function ModuleMock({ id, label }: { id: string; label: string }) {
  if (id.includes("options")) return <OptionsMock />;
  if (id.includes("fixed-income")) return <YieldMock />;
  if (id.includes("multi-factor")) return <FactorMock />;
  if (id.includes("portfolio") || id.includes("monte")) return <PortfolioMock />;
  return <PortfolioMock label={label} />;
}

function SheetChrome({ title }: { title: string }) {
  return (
    <>
      <rect width="100%" height="100%" fill="#0c1220" />
      <rect x="0" y="0" width="100%" height="22" fill="#121a2b" />
      <circle cx="12" cy="11" r="3" fill="#e57373" />
      <circle cx="22" cy="11" r="3" fill="#ffd54f" />
      <circle cx="32" cy="11" r="3" fill="#81c784" />
      <text x="44" y="15" fill="#9aa4b2" fontSize="8" fontFamily="system-ui">
        {title}
      </text>
    </>
  );
}

function PortfolioMock({ label = "Frontier" }: { label?: string }) {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <SheetChrome title="Portfolio_Risk.xlsx — Frontier" />
      <text x="16" y="42" fill="#c9a227" fontSize="9" fontFamily="system-ui">
        {label}
      </text>
      {/* axes */}
      <line x1="40" y1="200" x2="300" y2="200" stroke="#2a3548" />
      <line x1="40" y1="50" x2="40" y2="200" stroke="#2a3548" />
      <polyline
        fill="none"
        stroke="#c9a227"
        strokeWidth="2"
        points="50,170 90,140 130,120 170,95 210,85 250,78 290,74"
      />
      <circle cx="210" cy="85" r="4" fill="#6ec6ff" />
      <text x="218" y="82" fill="#6ec6ff" fontSize="7" fontFamily="system-ui">
        Max Sharpe
      </text>
      {/* mini VaR bars */}
      <rect x="48" y="210" width="18" height="16" fill="#c9a227" opacity="0.7" />
      <rect x="72" y="214" width="18" height="12" fill="#3d6ea8" opacity="0.8" />
      <text x="100" y="222" fill="#9aa4b2" fontSize="7" fontFamily="system-ui">
        Illust. VaR panel
      </text>
    </svg>
  );
}

function OptionsMock() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <SheetChrome title="Options_Greeks.xlsx — Payoff" />
      {/* heatmap */}
      {[0, 1, 2, 3, 4, 5].map((r) =>
        [0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={40 + c * 22}
            y={48 + r * 16}
            width="20"
            height="14"
            rx="1"
            fill={
              (r + c) % 3 === 0
                ? "#c9a227"
                : (r + c) % 3 === 1
                  ? "#3d6ea8"
                  : "#1a2438"
            }
            opacity={0.35 + ((r * c) % 5) * 0.1}
          />
        )),
      )}
      {/* payoff */}
      <polyline
        fill="none"
        stroke="#e8d5a3"
        strokeWidth="2"
        points="40,200 100,200 140,120 180,200 280,200"
      />
      <text x="40" y="230" fill="#9aa4b2" fontSize="7" fontFamily="system-ui">
        Vol heatmap · iron condor payoff
      </text>
    </svg>
  );
}

function YieldMock() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <SheetChrome title="Fixed_Income.xlsx — Curve" />
      <polyline
        fill="none"
        stroke="#7dcea0"
        strokeWidth="2"
        points="40,160 70,140 100,128 140,118 180,112 220,108 260,106 300,105"
      />
      <polyline
        fill="none"
        stroke="#c9a227"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        points="40,150 70,135 100,125 140,130 180,138 220,145 260,148 300,150"
      />
      {/* shock matrix cells */}
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={40 + c * 28}
            y={175 + r * 12}
            width="26"
            height="10"
            fill={c === 2 ? "#c9a22755" : "#1e2a3d"}
            stroke="#2a3548"
          />
        )),
      )}
      <text x="190" y="230" fill="#9aa4b2" fontSize="7" fontFamily="system-ui">
        Spot curve · rate-shock matrix
      </text>
    </svg>
  );
}

function FactorMock() {
  const cx = 110;
  const cy = 130;
  const pts = [0, 72, 144, 216].map((deg, i) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const r = 28 + i * 8;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  });
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <SheetChrome title="Factor_Selector.xlsx — Radar" />
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="#2a3548" />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#2a3548" />
      <polygon
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="#c9a22733"
        stroke="#c9a227"
        strokeWidth="1.5"
      />
      {/* quintile table */}
      {[0, 1, 2, 3, 4].map((r) => (
        <g key={r}>
          <rect x="190" y={50 + r * 22} width="110" height="18" fill="#121a2b" stroke="#2a3548" />
          <text x="196" y={62 + r * 22} fill="#9aa4b2" fontSize="7" fontFamily="system-ui">
            Q{r + 1} · z {((1.2 - r * 0.35)).toFixed(2)}
          </text>
        </g>
      ))}
      <text x="40" y="220" fill="#9aa4b2" fontSize="7" fontFamily="system-ui">
        Style radar · top quintile
      </text>
    </svg>
  );
}

function BundleMock() {
  return (
    <svg viewBox="0 0 480 300" className="h-full w-full">
      <rect width="480" height="300" fill="#0c1220" />
      <text x="20" y="28" fill="#c9a227" fontSize="11" fontFamily="system-ui" letterSpacing="1">
        MASTER BUNDLE — 4 WORKBOOKS
      </text>
      {[
        { x: 20, title: "Portfolio", color: "#c9a227" },
        { x: 130, title: "Options", color: "#6ec6ff" },
        { x: 240, title: "Yield", color: "#7dcea0" },
        { x: 350, title: "Factors", color: "#e8a0bf" },
      ].map((w) => (
        <g key={w.title}>
          <rect
            x={w.x}
            y="48"
            width="100"
            height="130"
            rx="4"
            fill="#121a2b"
            stroke={w.color}
            strokeOpacity="0.5"
          />
          <rect x={w.x + 8} y="60" width="50" height="5" rx="1" fill={w.color} />
          <polyline
            fill="none"
            stroke={w.color}
            strokeWidth="1.5"
            points={`${w.x + 10},150 ${w.x + 30},130 ${w.x + 50},138 ${w.x + 70},110 ${w.x + 90},118`}
          />
          <text x={w.x + 8} y="168" fill="#9aa4b2" fontSize="8" fontFamily="system-ui">
            {w.title}
          </text>
        </g>
      ))}
      <text x="20" y="220" fill="#e8edf5" fontSize="12" fontFamily="system-ui">
        Transparent formulas · no macros · inspect every cell
      </text>
      <text x="20" y="245" fill="#9aa4b2" fontSize="10" fontFamily="system-ui">
        Blue inputs · black formulas · green cross-sheet links
      </text>
    </svg>
  );
}

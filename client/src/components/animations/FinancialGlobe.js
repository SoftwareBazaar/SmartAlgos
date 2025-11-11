import React, { useEffect, useMemo } from 'react';

const animationStyles = `
@keyframes financial-sphere-spin {
  0% { transform: rotateX(12deg) rotateY(0deg); }
  50% { transform: rotateX(12deg) rotateY(180deg); }
  100% { transform: rotateX(12deg) rotateY(360deg); }
}

@keyframes financial-ribbon-flow {
  0% { transform: rotate(var(--rotation)) translateX(-50%) translateY(-50%) rotateZ(0deg); opacity: 0.25; }
  25% { opacity: 0.75; }
  50% { opacity: 0.9; }
  75% { opacity: 0.75; }
  100% { transform: rotate(var(--rotation)) translateX(-50%) translateY(-50%) rotateZ(360deg); opacity: 0.25; }
}

@keyframes financial-stream {
  0% { transform: translate3d(-50%, -120%, 0) rotate(-6deg); opacity: 0; }
  10% { opacity: 1; }
  50% { transform: translate3d(-50%, -50%, 0) rotate(0deg); opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translate3d(-50%, 40%, 0) rotate(6deg); opacity: 0; }
}

@keyframes financial-headline {
  0% { transform: translate3d(-50%, -50%, 0) rotateX(-30deg) rotateY(-60deg) scale(0.85); opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { transform: translate3d(-50%, -50%, 0) rotateX(-30deg) rotateY(-60deg) scale(1.05); opacity: 0; }
}

@keyframes financial-candles {
  0%, 100% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(0deg); }
  50% { transform: translate(-50%, -50%) rotateX(75deg) rotateZ(180deg); }
}

@keyframes financial-particles {
  0% { transform: rotate(0deg) translateX(var(--distance)) scale(0.85); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { transform: rotate(360deg) translateX(var(--distance)) scale(1.1); opacity: 0; }
}

@keyframes financial-hud-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.35; }
}

@keyframes financial-wave-sweep {
  0% { transform: translate(-50%, -50%) rotateX(80deg) rotateZ(0deg); opacity: 0.15; }
  40% { opacity: 0.35; }
  100% { transform: translate(-50%, -50%) rotateX(80deg) rotateZ(360deg); opacity: 0.15; }
}
`;

const ensureKeyframesInjected = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('financial-globe-keyframes')) return;

  const style = document.createElement('style');
  style.id = 'financial-globe-keyframes';
  style.textContent = animationStyles;
  document.head.appendChild(style);
};

const sizePresets = {
  sm: {
    container: 'h-64 w-64 md:h-72 md:w-72',
    sphere: 'h-52 w-52 md:h-60 md:w-60',
  },
  md: {
    container: 'h-72 w-72 md:h-80 md:w-80',
    sphere: 'h-60 w-60 md:h-68 md:w-68',
  },
  lg: {
    container: 'h-80 w-80 md:h-96 md:w-96',
    sphere: 'h-68 w-68 md:h-80 md:w-80',
  },
};

const FinancialGlobe = ({ size = 'lg' }) => {
  useEffect(() => {
    ensureKeyframesInjected();
  }, []);

  const ribbons = useMemo(
    () => [
      { id: 'primary', rotation: '-8deg', offset: '0%', duration: 22, delay: 0 },
      { id: 'secondary', rotation: '18deg', offset: '12%', duration: 28, delay: -6 },
      { id: 'tertiary', rotation: '-28deg', offset: '-10%', duration: 30, delay: -12 },
    ],
    []
  );

  const particleBands = useMemo(
    () => [
      { id: 'inner', count: 14, radius: 90, size: 3, duration: 18 },
      { id: 'mid', count: 10, radius: 112, size: 4, duration: 24 },
      { id: 'outer', count: 8, radius: 134, size: 5, duration: 28 },
    ],
    []
  );

  const tickerStreams = useMemo(
    () => [
      { id: 'eurusd', label: 'EUR/USD', value: '1.0872', change: '+0.42%' },
      { id: 'gbpjpy', label: 'GBP/JPY', value: '188.37', change: '-0.15%' },
      { id: 'gold', label: 'GOLD', value: '$2,376.12', change: '+1.04%' },
      { id: 'oil', label: 'OIL', value: '$82.44', change: '+0.67%' },
      { id: 'btc', label: 'BTC', value: '$69,440', change: '+2.83%' },
    ],
    []
  );

  const headlines = useMemo(
    () => [
      { id: 'headline-1', text: 'Breaking: Fed Signals Gradual Rate Adjustment' },
      { id: 'headline-2', text: 'Live: Algorithmic Flows Spike Ahead of CPI Release' },
      { id: 'headline-3', text: 'Commodities Rally as Energy Demand Surges' },
    ],
    []
  );

  const { container, sphere } = sizePresets[size] ?? sizePresets.lg;

  return (
    <div className={`relative ${container}`}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.3),rgba(2,6,23,0))] blur-3xl" />
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(15,118,255,0.15),rgba(2,6,23,0))]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`relative ${sphere}`}>
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(191,219,254,0.25),rgba(15,23,42,0.9))] shadow-[0_25px_80px_-30px_rgba(56,189,248,0.45)]" />
          <div
            className="absolute inset-0 rounded-full border border-slate-400/25 backdrop-blur-sm"
            style={{ boxShadow: '0 0 80px rgba(37,99,235,0.25)' }}
          />
          <div
            className="absolute inset-[14%] rounded-full border border-cyan-400/20"
            style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.4))' }}
          />

          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              animation: 'financial-sphere-spin 28s linear infinite',
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black opacity-85" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.35),rgba(30,64,175,0.05),rgba(15,23,42,0.9))]" />
            <div className="absolute inset-0 rounded-full border border-white/5 mix-blend-screen" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[130%] w-[130%] origin-center rounded-full"
            style={{
              transform: 'translate(-50%, -50%) rotateX(75deg)',
              animation: 'financial-wave-sweep 18s linear infinite',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(190,242,255,0.25) 45%, rgba(2,6,23,0) 100%)',
              opacity: 0.2,
              filter: 'blur(1px)',
            }}
          />

          {ribbons.map((ribbon) => (
            <div
              key={ribbon.id}
              className="absolute left-1/2 top-1/2 h-[160%] w-[30%] origin-center"
              style={{
                '--rotation': ribbon.rotation,
                transform: `translate(-50%, -50%) rotate(${ribbon.rotation})`,
                animation: `financial-ribbon-flow ${ribbon.duration}s linear infinite`,
                animationDelay: `${ribbon.delay}s`,
                opacity: 0.65,
              }}
            >
              <div
                className="relative h-full w-full"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.65) 40%, rgba(56,189,248,0.9) 60%, rgba(12,74,110,0.0) 100%)',
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 30px rgba(56,189,248,0.45)',
                }}
              />
            </div>
          ))}

          <div
            className="absolute left-1/2 top-1/2 h-[120%] w-[120%] rounded-full border border-cyan-200/20"
            style={{
              transform: 'translate(-50%, -50%) rotateX(75deg)',
              background:
                'radial-gradient(circle, rgba(165,243,252,0.4) 0%, rgba(15,118,255,0.05) 45%, rgba(8,47,73,0) 70%)',
              boxShadow: '0 0 60px rgba(21,94,117,0.35)',
            }}
          >
            <div
              className="absolute left-1/2 top-1/2 h-[1.5px] w-[130%] origin-center bg-gradient-to-r from-transparent via-white/80 to-transparent"
              style={{ transform: 'translate(-50%, -50%) rotate(-6deg)', filter: 'blur(0.3px)' }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-[1.5px] w-[120%] origin-center bg-gradient-to-r from-transparent via-cyan-200/80 to-transparent"
              style={{ transform: 'translate(-50%, -50%) rotate(18deg)', opacity: 0.7 }}
            />
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[110%] w-[110%]"
            style={{
              transform: 'translate(-50%, -50%) rotateX(70deg)',
              animation: 'financial-candles 24s linear infinite',
              transformStyle: 'preserve-3d',
            }}
          >
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={`candle-${index}`}
                className="absolute left-1/2 top-1/2 h-12 w-[2px] rounded-full bg-gradient-to-b from-white/70 via-cyan-200/70 to-transparent"
                style={{
                  transform: `translate(-50%, -50%) rotateZ(${index * 10}deg) translateY(-48%)`,
                  opacity: index % 3 === 0 ? 0.9 : 0.45,
                  boxShadow: '0 0 8px rgba(186,230,253,0.45)',
                }}
              />
            ))}
          </div>

          {particleBands.map((band) =>
            Array.from({ length: band.count }).map((_, index) => (
              <span
                key={`${band.id}-${index}`}
                className="absolute left-1/2 top-1/2 block rounded-full bg-cyan-200/90"
                style={{
                  width: band.size,
                  height: band.size,
                  marginLeft: -band.size / 2,
                  marginTop: -band.size / 2,
                  '--distance': `${band.radius}px`,
                  transformOrigin: `${band.radius}px 0`,
                  animation: `financial-particles ${band.duration}s linear infinite`,
                  animationDelay: `${(index / band.count) * -band.duration}s`,
                  boxShadow: '0 0 12px rgba(165,243,252,0.55)',
                }}
              />
            ))
          )}

          <div className="absolute inset-0 rounded-full border border-cyan-100/10" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-4 rounded-[40%] border border-cyan-900/30 blur-sm" />
        <div
          className="absolute inset-0 rounded-full border border-white/5"
          style={{ animation: 'financial-hud-pulse 6s ease-in-out infinite' }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        {tickerStreams.map((stream, index) => (
          <div
            key={stream.id}
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-900/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-100/90 shadow-[0_0_12px_rgba(8,145,178,0.25)] backdrop-blur"
            style={{
              top: `${10 + index * 14}%`,
              animation: `financial-stream ${12 + index * 1.5}s ease-in-out infinite`,
              animationDelay: `${index * -2}s`,
            }}
          >
            <span className="text-cyan-200">{stream.label}</span>
            <span className="font-medium tracking-widest text-white/90">{stream.value}</span>
            <span className={stream.change.startsWith('-') ? 'text-rose-300' : 'text-emerald-300'}>
              {stream.change}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {headlines.map((headline, index) => (
          <div
            key={headline.id}
            className="absolute left-1/2 top-1/2 max-w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cyan-500/20 bg-slate-900/70 px-5 py-3 text-center text-[11px] font-medium uppercase tracking-[0.4em] text-cyan-100/90 shadow-[0_0_25px_rgba(20,184,166,0.25)] backdrop-blur"
            style={{
              animation: `financial-headline ${10 + index * 2}s ease-in-out infinite`,
              animationDelay: `${index * -3.5}s`,
            }}
          >
            {headline.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialGlobe;


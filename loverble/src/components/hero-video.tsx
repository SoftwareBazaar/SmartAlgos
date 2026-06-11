const DEFAULT_HERO_VIDEO =
  "https://videos.pexels.com/video-files/3457705/3457705-uhd_2560_1440_24fps.mp4";

export function HeroVideo() {
  const videoSrc = import.meta.env.VITE_HERO_VIDEO_URL || DEFAULT_HERO_VIDEO;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover scale-[1.03] motion-reduce:hidden"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-transparent to-background/55" />
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

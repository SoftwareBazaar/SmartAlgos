export function LiveBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-bull/15 text-bull font-medium ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-bull" />
      </span>
      Live
    </span>
  );
}

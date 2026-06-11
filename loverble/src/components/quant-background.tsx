export function QuantBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[100px]" />
    </div>
  );
}

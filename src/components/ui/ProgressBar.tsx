export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 100;

  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-white/10 ${className ?? ""}`}>
      <div
        className="h-full rounded-full bg-emerald-400 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

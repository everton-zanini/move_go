export function ProgressBar({
  value,
  max,
  className,
  label,
}: {
  value: number;
  max: number;
  className?: string;
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 100;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={`h-3 w-full overflow-hidden rounded-full bg-white/10 ${className ?? ""}`}
    >
      <div
        className="h-full rounded-full bg-[var(--accent,#34d399)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

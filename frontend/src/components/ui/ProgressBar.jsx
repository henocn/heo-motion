// Barre de progression horizontale
export default function ProgressBar({ value = 0, max = 100, className = "" }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className="h-full rounded-full bg-primary-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

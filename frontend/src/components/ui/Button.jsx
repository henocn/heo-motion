import { Loader2 } from "lucide-react";

// Bouton reutilisable avec variantes (primary, secondary, danger, ghost)
export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-400 shadow-sm shadow-primary-600/20",
    secondary:
      "bg-surface text-text-secondary border border-border hover:bg-surface-hover active:bg-slate-100 focus:ring-slate-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-400 shadow-sm shadow-red-600/20",
    ghost:
      "text-text-secondary hover:bg-surface-hover active:bg-slate-100 focus:ring-slate-300",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-11 px-6 text-sm gap-2",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

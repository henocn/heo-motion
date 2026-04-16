// Badge colore pour afficher un statut
export default function Badge({ children, color = "bg-slate-100 text-slate-600", dot, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  );
}

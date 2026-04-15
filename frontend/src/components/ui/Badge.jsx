// Badge colore pour afficher un statut
export default function Badge({ children, color = "bg-slate-100 text-slate-700", className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {children}
    </span>
  );
}

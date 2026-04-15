// Carte conteneur avec ombre et bordure arrondie
export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// En-tete de carte avec titre et actions optionnelles
export function CardHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`flex items-center justify-between border-b border-slate-100 px-6 py-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Corps de carte
export function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

// Carte conteneur avec bordure subtile
export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// En-tete de carte avec titre et actions optionnelles
export function CardHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={`flex items-center justify-between border-b border-border-light px-5 py-3.5 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// Corps de carte
export function CardBody({ children, className = "" }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

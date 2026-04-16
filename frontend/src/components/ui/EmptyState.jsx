// Etat vide affiche quand une liste n'a pas de donnees
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-base font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import useUIStore from "../../stores/useUIStore";

const ICONS = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-primary-500" />,
};

// Conteneur de toasts positionne en bas a droite
export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg shadow-black/5"
        >
          {ICONS[toast.type] || ICONS.info}
          <span className="text-sm text-text-primary">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 text-text-muted hover:text-text-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

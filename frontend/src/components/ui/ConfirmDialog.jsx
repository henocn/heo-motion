import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

// Modale de confirmation destructive avec message et boutons Annuler / Confirmer
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Cette action est irréversible.",
  confirmLabel = "Supprimer",
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

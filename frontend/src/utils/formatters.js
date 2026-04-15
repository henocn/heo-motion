import { PROJECT_STATUS_LABELS, ASSET_TYPE_LABELS } from "./constants";

// Formate une date ISO en format lisible francais
export function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Formate une date en temps relatif ("il y a 3 min", "hier", etc.)
export function formatRelativeTime(isoString) {
  if (!isoString) return "—";
  const now = Date.now();
  const diff = now - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7) return `il y a ${days}j`;
  return formatDate(isoString);
}

// Renvoie le label francais d'un statut projet
export function formatProjectStatus(status) {
  return PROJECT_STATUS_LABELS[status] || status;
}

// Renvoie le label francais d'un type d'asset
export function formatAssetType(type) {
  return ASSET_TYPE_LABELS[type] || type;
}

// Formate une taille de fichier en unite lisible
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

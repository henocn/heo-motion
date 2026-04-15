// Genere un id unique court pour les cles React temporaires
export function generateTempId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Tronque un texte a une longueur max avec ellipses
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || "";
  return text.slice(0, maxLength).trimEnd() + "…";
}

// Debounce une fonction (utile pour les champs de recherche)
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Calcule le nombre de pages a partir du total et de la taille de page
export function getTotalPages(total, pageSize) {
  return Math.max(1, Math.ceil(total / pageSize));
}

// Construit une URL de route avec les parametres remplaces
export function buildRoute(template, params = {}) {
  let route = template;
  for (const [key, value] of Object.entries(params)) {
    route = route.replace(`:${key}`, value);
  }
  return route;
}

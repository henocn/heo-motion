// Construit l'URL d'un fichier servi sous /media (images generees, assets, masques).
// En production derriere nginx : chemins relatifs /media/... (meme origine HTTPS, pas de mixed content).
// En dev : meme principe si le proxy Vite pointe /media vers le backend (voir vite.config.js).
// Optionnel : VITE_MEDIA_ORIGIN=https://cdn.example.com pour un CDN (sans slash final).

// Retourne l'URL complete pour afficher un fichier media (jamais http://localhost en prod si non configure)
export function mediaUrl(relativePath) {
  if (relativePath == null || relativePath === "") return "";

  const s = String(relativePath).trim();
  if (/^https?:\/\//i.test(s)) return s;

  const p = s.replace(/^\/+/, "");
  const origin = import.meta.env.VITE_MEDIA_ORIGIN;
  if (origin != null && String(origin).trim() !== "") {
    return `${String(origin).replace(/\/$/, "")}/media/${p}`;
  }

  return `/media/${p}`;
}

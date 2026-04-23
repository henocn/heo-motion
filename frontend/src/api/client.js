import axios from "axios";

// Instance Axios configuree pour communiquer avec le backend FastAPI
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Extrait le texte d'erreur renvoye par l'API (champ error, detail string ou liste 422)
function extractApiErrorMessage(error) {
  const data = error.response?.data;
  if (data == null) {
    return error.message || "Erreur réseau";
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  const detail = data.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const joined = detail
      .map((item) => {
        if (item == null) return "";
        if (typeof item === "string") return item;
        if (typeof item.msg === "string") return item.msg;
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join("\n");
    if (joined) return joined;
  }

  return error.message || "Erreur réseau";
}

// Intercepteur de reponse pour extraire les erreurs de maniere uniforme
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = extractApiErrorMessage(error);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

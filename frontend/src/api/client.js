import axios from "axios";

// Instance Axios configuree pour communiquer avec le backend FastAPI
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Intercepteur de reponse pour extraire les erreurs de maniere uniforme
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Erreur réseau";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

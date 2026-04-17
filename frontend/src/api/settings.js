import apiClient from "./client";

// Recupere la configuration courante
export async function fetchSettings() {
  const { data } = await apiClient.get("/settings");
  return data;
}

// Met a jour la configuration
export async function updateSettings(payload) {
  const { data } = await apiClient.put("/settings", payload);
  return data;
}

import apiClient from "./client";

// Genere le prompt d'image pour une scene
export async function generatePrompt(sceneId) {
  const { data } = await apiClient.post(`/scenes/${sceneId}/generate-prompt`);
  return data;
}

// Lance la generation d'image pour une scene
export async function generateImage(sceneId) {
  const { data } = await apiClient.post(`/scenes/${sceneId}/generate-image`);
  return data;
}

// Recupere le statut du dernier job de generation
export async function getGenerationStatus(sceneId) {
  const { data } = await apiClient.get(`/scenes/${sceneId}/generation-status`);
  return data;
}

// Regenere une image avec un nouveau seed
export async function regenerateImage(sceneId) {
  const { data } = await apiClient.post(`/scenes/${sceneId}/regenerate-image`);
  return data;
}

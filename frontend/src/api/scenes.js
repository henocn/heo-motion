import apiClient from "./client";

// Recupere les scenes d'un projet
export async function fetchScenes(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/scenes`);
  return data;
}

// Recupere une scene par son id
export async function fetchScene(sceneId) {
  const { data } = await apiClient.get(`/scenes/${sceneId}`);
  return data;
}

// Met a jour une scene
export async function updateScene(sceneId, payload) {
  const { data } = await apiClient.put(`/scenes/${sceneId}`, payload);
  return data;
}

// Approuve l'image d'une scene
export async function approveScene(sceneId) {
  const { data } = await apiClient.patch(`/scenes/${sceneId}/approve`);
  return data;
}

// Supprime une scene
export async function deleteScene(sceneId) {
  await apiClient.delete(`/scenes/${sceneId}`);
}

// Importe une image existante pour une scene
export async function uploadSceneImage(sceneId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post(
    `/scenes/${sceneId}/upload-image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

// Lance la generation du storyboard pour un projet
export async function generateStoryboard(projectId) {
  const { data } = await apiClient.post(
    `/projects/${projectId}/storyboard/generate`
  );
  return data;
}

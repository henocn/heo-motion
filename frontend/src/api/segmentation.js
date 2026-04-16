import apiClient from "./client";

// Lance la segmentation d'une scene
export async function startSegmentation(sceneId) {
  const { data } = await apiClient.post(`/scenes/${sceneId}/segment`);
  return data;
}

// Recupere le statut du dernier job de segmentation
export async function getSegmentationStatus(sceneId) {
  const { data } = await apiClient.get(`/scenes/${sceneId}/segmentation-status`);
  return data;
}

// Recupere les assets segmentes d'une scene
export async function fetchAssets(sceneId) {
  const { data } = await apiClient.get(`/scenes/${sceneId}/assets`);
  return data;
}

// Approuve un asset
export async function approveAsset(assetId) {
  const { data } = await apiClient.patch(`/assets/${assetId}/approve`);
  return data;
}

// Supprime un asset
export async function deleteAsset(assetId) {
  await apiClient.delete(`/assets/${assetId}`);
}

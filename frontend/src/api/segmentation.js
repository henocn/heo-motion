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

// Supprime tous les assets d'une scene
export async function clearAssets(sceneId) {
  await apiClient.delete(`/scenes/${sceneId}/assets`);
}

// Telecharge un PSD unique (reference + calques positionnes)
export async function exportScenePsd(sceneId) {
  const res = await apiClient.get(`/scenes/${sceneId}/export-psd`, {
    responseType: "blob",
    timeout: 300000,
  });
  const blob = res.data;
  let filename = `scene-${String(sceneId).slice(0, 8)}-segmentation.psd`;
  const cd = res.headers["content-disposition"];
  if (cd) {
    const m = /filename="([^"]+)"/.exec(cd);
    if (m) filename = m[1].trim();
  }
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

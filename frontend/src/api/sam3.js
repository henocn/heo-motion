import apiClient from "./client";

// Lance la segmentation SAM3 (Replicate) pour une scene ; timeout long (modele distant)
export async function postSam3Segment(sceneId, body) {
  const { data } = await apiClient.post(
    `/scenes/${sceneId}/sam3-segment`,
    body,
    { timeout: 600000 }
  );
  return data;
}

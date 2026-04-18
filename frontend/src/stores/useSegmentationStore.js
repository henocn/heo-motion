import { create } from "zustand";
import * as segApi from "../api/segmentation";

// Store pour la segmentation : jobs, assets, polling
const useSegmentationStore = create((set, get) => ({
  jobs: {},
  assets: {},
  loading: {},
  error: null,

  // Lance la segmentation pour une scene
  startSegmentation: async (sceneId) => {
    set((s) => ({
      loading: { ...s.loading, [sceneId]: true },
      error: null,
    }));
    try {
      const job = await segApi.startSegmentation(sceneId);
      set((s) => ({
        jobs: { ...s.jobs, [sceneId]: job },
        loading: { ...s.loading, [sceneId]: false },
      }));
      return job;
    } catch (err) {
      set((s) => ({
        error: err.message,
        loading: { ...s.loading, [sceneId]: false },
      }));
      throw err;
    }
  },

  // Recupere le statut du job de segmentation
  fetchStatus: async (sceneId) => {
    try {
      const job = await segApi.getSegmentationStatus(sceneId);
      set((s) => ({ jobs: { ...s.jobs, [sceneId]: job } }));
      return job;
    } catch {
      return null;
    }
  },

  // Recupere les assets segmentes d'une scene
  fetchAssets: async (sceneId) => {
    try {
      const data = await segApi.fetchAssets(sceneId);
      set((s) => ({ assets: { ...s.assets, [sceneId]: data } }));
      return data;
    } catch {
      return [];
    }
  },

  // Approuve un asset
  approveAsset: async (sceneId, assetId) => {
    try {
      const updated = await segApi.approveAsset(assetId);
      set((s) => ({
        assets: {
          ...s.assets,
          [sceneId]: (s.assets[sceneId] || []).map((a) =>
            a.id === assetId ? updated : a
          ),
        },
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Supprime un asset
  deleteAsset: async (sceneId, assetId) => {
    try {
      await segApi.deleteAsset(assetId);
      set((s) => ({
        assets: {
          ...s.assets,
          [sceneId]: (s.assets[sceneId] || []).filter((a) => a.id !== assetId),
        },
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Supprime tous les assets d'une scene cote serveur + store
  clearSceneAssets: async (sceneId) => {
    try {
      await segApi.clearAssets(sceneId);
      set((s) => ({
        assets: { ...s.assets, [sceneId]: [] },
        jobs: { ...s.jobs, [sceneId]: undefined },
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Reinitialise le store
  clearAll: () => set({ jobs: {}, assets: {}, loading: {}, error: null }),
}));

export default useSegmentationStore;

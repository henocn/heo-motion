import { create } from "zustand";
import * as generationApi from "../api/generation";

// Store pour le suivi des jobs de generation d'images
const useGenerationStore = create((set) => ({
  jobs: {},
  loading: false,
  error: null,

  // Lance la generation d'image pour une scene
  startGeneration: async (sceneId) => {
    set({ loading: true, error: null });
    try {
      const job = await generationApi.generateImage(sceneId);
      set((s) => ({
        jobs: { ...s.jobs, [sceneId]: job },
        loading: false,
      }));
      return job;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Regenere une image avec un nouveau seed
  regenerate: async (sceneId) => {
    set({ loading: true, error: null });
    try {
      const job = await generationApi.regenerateImage(sceneId);
      set((s) => ({
        jobs: { ...s.jobs, [sceneId]: job },
        loading: false,
      }));
      return job;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Recupere le statut de generation d'une scene
  fetchStatus: async (sceneId) => {
    try {
      const job = await generationApi.getGenerationStatus(sceneId);
      set((s) => ({
        jobs: { ...s.jobs, [sceneId]: job },
      }));
      return job;
    } catch {
      return null;
    }
  },

  // Reinitialise le store
  clearJobs: () => set({ jobs: {}, error: null }),
}));

export default useGenerationStore;

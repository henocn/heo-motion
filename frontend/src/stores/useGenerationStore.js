import { create } from "zustand";
import * as generationApi from "../api/generation";

// Store pour le suivi des jobs de generation d'images
const useGenerationStore = create((set, get) => ({
  jobs: {},
  loading: {},
  error: null,
  _onJobDone: null,

  // Enregistre un callback appele quand un job se termine (completed/failed)
  setOnJobDone: (fn) => set({ _onJobDone: fn }),

  // Lance la generation d'image pour une scene (marque loading immediatement)
  startGeneration: async (sceneId) => {
    set((s) => ({
      loading: { ...s.loading, [sceneId]: true },
      error: null,
    }));
    try {
      const job = await generationApi.generateImage(sceneId);
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

  // Regenere une image avec un nouveau seed
  regenerate: async (sceneId) => {
    set((s) => ({
      loading: { ...s.loading, [sceneId]: true },
      error: null,
    }));
    try {
      const job = await generationApi.regenerateImage(sceneId);
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

  // Recupere le statut de generation d'une scene
  fetchStatus: async (sceneId) => {
    try {
      const job = await generationApi.getGenerationStatus(sceneId);
      const prev = get().jobs[sceneId];
      set((s) => ({
        jobs: { ...s.jobs, [sceneId]: job },
      }));

      const wasRunning =
        !prev ||
        prev.status === "queued" ||
        prev.status === "running";
      const isDone = job.status === "completed" || job.status === "failed";

      if (wasRunning && isDone && get()._onJobDone) {
        get()._onJobDone(sceneId, job);
      }

      return job;
    } catch {
      return null;
    }
  },

  // Reinitialise le store
  clearJobs: () => set({ jobs: {}, loading: {}, error: null }),
}));

export default useGenerationStore;

import { create } from "zustand";
import * as scenesApi from "../api/scenes";

// Store pour les scenes du projet courant
const useSceneStore = create((set) => ({
  scenes: [],
  selectedScene: null,
  loading: false,
  error: null,

  // Charge les scenes d'un projet
  fetchScenes: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await scenesApi.fetchScenes(projectId);
      set({ scenes: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Selectionne une scene pour l'editer/afficher
  selectScene: (scene) => set({ selectedScene: scene }),

  // Met a jour une scene dans le store local
  updateScene: async (sceneId, payload) => {
    set({ error: null });
    try {
      const data = await scenesApi.updateScene(sceneId, payload);
      set((s) => ({
        scenes: s.scenes.map((sc) => (sc.id === sceneId ? data : sc)),
        selectedScene: s.selectedScene?.id === sceneId ? data : s.selectedScene,
      }));
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Approuve l'image d'une scene
  approveScene: async (sceneId) => {
    try {
      const data = await scenesApi.approveScene(sceneId);
      set((s) => ({
        scenes: s.scenes.map((sc) => (sc.id === sceneId ? data : sc)),
        selectedScene: s.selectedScene?.id === sceneId ? data : s.selectedScene,
      }));
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Reinitialise le store
  clearScenes: () => set({ scenes: [], selectedScene: null }),
}));

export default useSceneStore;

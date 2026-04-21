import { create } from "zustand";
import * as projectsApi from "../api/projects";

// Store pour les projets (liste, projet courant, CRUD)
const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,

  // Charge la liste des projets avec pagination
  fetchProjects: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.fetchProjects(page);
      set({
        projects: data.items,
        total: data.total,
        page: data.page,
        totalPages: data.total_pages,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Charge un projet specifique
  fetchProject: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.fetchProject(projectId);
      set({ currentProject: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Cree un nouveau projet et l'ajoute a la liste
  createProject: async (payload) => {
    set({ loading: true, error: null });
    try {
      const data = await projectsApi.createProject(payload);
      set((s) => ({
        projects: [data, ...s.projects],
        loading: false,
      }));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // Met a jour un projet existant
  updateProject: async (projectId, payload) => {
    set({ error: null });
    try {
      const data = await projectsApi.updateProject(projectId, payload);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === projectId ? data : p)),
        currentProject:
          s.currentProject?.id === projectId ? data : s.currentProject,
      }));
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Supprime un projet
  deleteProject: async (projectId) => {
    set({ error: null });
    try {
      await projectsApi.deleteProject(projectId);
      set((s) => ({
        projects: s.projects.filter((p) => p.id !== projectId),
        currentProject:
          s.currentProject?.id === projectId ? null : s.currentProject,
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // Reinitialise le projet courant
  clearCurrentProject: () => set({ currentProject: null }),
}));

export default useProjectStore;

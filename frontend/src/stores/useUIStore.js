import { create } from "zustand";

// Store global pour l'etat de l'interface (sidebar, modales, toasts)
const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  toasts: [],

  // Ouvre ou ferme la sidebar
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Ouvre une modale avec des donnees optionnelles
  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Ajoute un toast de notification (auto-supprime apres 4s)
  addToast: (message, type = "info") => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  // Supprime un toast manuellement
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default useUIStore;

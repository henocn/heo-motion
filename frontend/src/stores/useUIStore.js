import { create } from "zustand";

// Store global pour l'etat de l'interface (modales, toasts)
const useUIStore = create((set) => ({
  activeModal: null,
  modalData: null,
  toasts: [],

  // Ouvre une modale avec des donnees optionnelles
  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Ajoute un toast (duree plus longue pour les erreurs si non surchargee)
  addToast: (message, type = "info", options = {}) => {
    const id = Date.now();
    const defaultMs = type === "error" ? 16000 : 4000;
    const duration =
      typeof options.duration === "number" ? options.duration : defaultMs;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  // Supprime un toast manuellement
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export default useUIStore;

// Statuts de projet
export const PROJECT_STATUS = {
  DRAFT: "draft",
  STORYBOARD_READY: "storyboard_ready",
  IMAGES_READY: "images_ready",
  ASSETS_READY: "assets_ready",
  EXPORTED: "exported",
  ARCHIVED: "archived",
};

// Labels affichables pour chaque statut
export const PROJECT_STATUS_LABELS = {
  draft: "Brouillon",
  storyboard_ready: "Storyboard prêt",
  images_ready: "Images prêtes",
  assets_ready: "Assets prêts",
  exported: "Exporté",
  archived: "Archivé",
};

// Couleurs associees aux statuts
export const PROJECT_STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  storyboard_ready: "bg-blue-100 text-blue-700",
  images_ready: "bg-purple-100 text-purple-700",
  assets_ready: "bg-emerald-100 text-emerald-700",
  exported: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

// Statuts d'image
export const IMAGE_STATUS = {
  PENDING: "pending",
  GENERATING: "generating",
  GENERATED: "generated",
  USER_EDITED: "user_edited",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Statuts de job
export const JOB_STATUS = {
  QUEUED: "queued",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Types d'assets
export const ASSET_TYPES = {
  HEAD: "head",
  EYES: "eyes",
  MOUTH: "mouth",
  LEFT_ARM: "left_arm",
  RIGHT_ARM: "right_arm",
  LEFT_LEG: "left_leg",
  RIGHT_LEG: "right_leg",
  BODY: "body",
  OBJECT: "object",
  BACKGROUND: "background_element",
};

// Labels des assets
export const ASSET_TYPE_LABELS = {
  head: "Tête",
  eyes: "Yeux",
  mouth: "Bouche",
  left_arm: "Bras gauche",
  right_arm: "Bras droit",
  left_leg: "Jambe gauche",
  right_leg: "Jambe droite",
  body: "Corps",
  object: "Objet",
  background_element: "Fond",
};

// Routes de l'application
export const ROUTES = {
  DASHBOARD: "/",
  PROJECT: "/projects/:projectId",
  STORYBOARD: "/projects/:projectId/storyboard",
  GENERATION: "/projects/:projectId/generation",
  SEGMENTATION: "/projects/:projectId/segmentation",
  EXPORT: "/projects/:projectId/export",
};

// Valeurs par defaut de pagination
export const DEFAULT_PAGE_SIZE = 20;

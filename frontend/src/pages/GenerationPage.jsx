import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  Check,
  Image as ImageIcon,
  ChevronDown,
  AlertCircle,
  Upload,
  X,
  Pencil,
  Save,
  Play,
  Download,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import useSceneStore from "../stores/useSceneStore";
import useGenerationStore from "../stores/useGenerationStore";
import useUIStore from "../stores/useUIStore";
import usePolling from "../hooks/usePolling";
import { JOB_STATUS } from "../utils/constants";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const STATUS_MAP = {
  pending: { color: "bg-slate-50 text-slate-500", label: "En attente" },
  generating: { color: "bg-amber-50 text-amber-600", dot: "bg-amber-500", label: "En cours..." },
  generated: { color: "bg-sky-50 text-sky-600", label: "Générée" },
  approved: { color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", label: "Approuvée" },
  rejected: { color: "bg-red-50 text-red-500", label: "Rejetée" },
};

// Page de generation d'images pour chaque scene
export default function GenerationPage() {
  const { projectId } = useParams();
  const { scenes, fetchScenes, uploadImage, updateScene } = useSceneStore();
  const {
    jobs,
    loading: loadingMap,
    startGeneration,
    regenerate,
    fetchStatus,
    setOnJobDone,
  } = useGenerationStore();
  const addToast = useUIStore((s) => s.addToast);

  const [previewScene, setPreviewScene] = useState(null);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [promptDraft, setPromptDraft] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  useEffect(() => {
    if (projectId) fetchScenes(projectId);
  }, [projectId, fetchScenes]);

  useEffect(() => {
    setOnJobDone(() => {
      if (projectId) fetchScenes(projectId);
    });
    return () => setOnJobDone(null);
  }, [projectId, fetchScenes, setOnJobDone]);

  const hasRunningJobs =
    Object.values(jobs).some(
      (j) => j?.status === JOB_STATUS.QUEUED || j?.status === JOB_STATUS.RUNNING
    ) || Object.values(loadingMap).some(Boolean);

  const scenesRef = useRef(scenes);
  const jobsRef = useRef(jobs);
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  const pollRunning = useCallback(() => {
    const currentScenes = scenesRef.current;
    const currentJobs = jobsRef.current;

    currentScenes.forEach((scene) => {
      if (
        scene.image_status === "generating" ||
        currentJobs[scene.id]?.status === JOB_STATUS.QUEUED ||
        currentJobs[scene.id]?.status === JOB_STATUS.RUNNING
      ) {
        fetchStatus(scene.id);
      }
    });
  }, [fetchStatus]);

  usePolling(pollRunning, 4000, hasRunningJobs);

  // Lance la generation pour une scene
  async function handleGenerate(sceneId) {
    try {
      await startGeneration(sceneId);
      addToast("Génération lancée", "info");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  // Regenere l'image d'une scene
  async function handleRegenerate(sceneId) {
    try {
      await regenerate(sceneId);
      addToast("Régénération lancée", "info");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  // Importe une image depuis le disque
  function handleImport(sceneId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await uploadImage(sceneId, file);
        addToast("Image importée", "success");
      } catch (err) {
        addToast(err.message, "error");
      }
    };
    input.click();
  }

  // Sauvegarde le prompt modifie
  async function handleSavePrompt(sceneId) {
    setSavingPrompt(true);
    try {
      await updateScene(sceneId, { prompt_generated: promptDraft });
      setEditingPrompt(null);
      addToast("Prompt mis à jour", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSavingPrompt(false);
    }
  }

  // Lance la generation pour toutes les scenes qui n'ont pas encore d'image
  async function handleGenerateAll() {
    const pending = scenes.filter(
      (s) => !s.generated_image_url && s.image_status !== "generating"
    );
    if (pending.length === 0) {
      addToast("Toutes les scènes ont déjà une image", "info");
      return;
    }
    setGeneratingAll(true);
    let launched = 0;
    for (const scene of pending) {
      try {
        await startGeneration(scene.id);
        launched++;
      } catch {
        /* continue with others */
      }
    }
    setGeneratingAll(false);
    addToast(`${launched} génération(s) lancée(s)`, "info");
  }

  // Ferme la modal avec Escape
  useEffect(() => {
    if (!previewScene) return;
    const handler = (e) => e.key === "Escape" && setPreviewScene(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewScene]);

  if (scenes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-6">
        <EmptyState
          icon={<ImageIcon className="h-12 w-12" strokeWidth={1} />}
          title="Aucune scène"
          description="Générez d'abord le storyboard dans l'onglet Storyboard"
        />
      </div>
    );
  }

  const pendingCount = scenes.filter(
    (s) => !s.generated_image_url && s.image_status !== "generating"
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Génération d'images
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Générez et validez les visuels de chaque scène
          </p>
        </div>
        {pendingCount > 0 && (
          <Button
            size="sm"
            onClick={handleGenerateAll}
            loading={generatingAll}
            disabled={generatingAll}
          >
            <Play className="h-3.5 w-3.5" />
            Générer tout ({pendingCount})
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenes.map((scene, index) => {
          const job = jobs[scene.id];
          const isLoading = !!loadingMap[scene.id];
          const isGenerating =
            isLoading ||
            scene.image_status === "generating" ||
            job?.status === JOB_STATUS.QUEUED ||
            job?.status === JOB_STATUS.RUNNING;

          const displayStatus = isGenerating
            ? STATUS_MAP.generating
            : (STATUS_MAP[scene.image_status] || STATUS_MAP.pending);

          const isEditingThis = editingPrompt === scene.id;

          return (
            <Card key={scene.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">
                    Scène {index + 1}
                  </span>
                  <Badge color={displayStatus.color} dot={displayStatus.dot}>
                    {displayStatus.label}
                  </Badge>
                </div>

                <p className="text-xs text-text-muted line-clamp-2">
                  {scene.visual_description}
                </p>

                {/* Prompt : affichage ou edition */}
                {isEditingThis ? (
                  <div className="space-y-2">
                    <textarea
                      value={promptDraft}
                      onChange={(e) => setPromptDraft(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-surface-dim px-3 py-2 text-xs text-text-primary leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSavePrompt(scene.id)}
                        loading={savingPrompt}
                      >
                        <Save className="h-3 w-3" />
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingPrompt(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : scene.prompt_generated ? (
                  <details className="group">
                    <summary className="flex cursor-pointer items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
                      <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                      Voir le prompt
                    </summary>
                    <div className="mt-1.5 rounded-lg bg-surface-dim p-2.5">
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {scene.prompt_generated}
                      </p>
                      <button
                        onClick={() => {
                          setEditingPrompt(scene.id);
                          setPromptDraft(scene.prompt_generated || "");
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                      >
                        <Pencil className="h-3 w-3" />
                        Modifier le prompt
                      </button>
                    </div>
                  </details>
                ) : (
                  <button
                    onClick={() => {
                      setEditingPrompt(scene.id);
                      setPromptDraft("");
                    }}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Écrire un prompt
                  </button>
                )}

                {/* Image preview area */}
                <div className="aspect-video overflow-hidden rounded-lg bg-surface-dim">
                  {isGenerating ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Spinner />
                        <p className="mt-2 text-xs text-text-muted">
                          {isLoading ? "Lancement..." : "Génération en cours..."}
                        </p>
                      </div>
                    </div>
                  ) : scene.generated_image_url ? (
                    <img
                      src={`${API_BASE}/media/${scene.generated_image_url}`}
                      alt={`Scène ${index + 1}`}
                      className="h-full w-full cursor-pointer object-cover transition-opacity hover:opacity-90"
                      onClick={() => setPreviewScene({ ...scene, index })}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <ImageIcon className="h-10 w-10" strokeWidth={1} />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!scene.generated_image_url && !isGenerating && (
                    <>
                      <Button size="sm" onClick={() => handleGenerate(scene.id)}>
                        <Sparkles className="h-3.5 w-3.5" />
                        Générer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImport(scene.id)}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Importer
                      </Button>
                    </>
                  )}
                  {scene.generated_image_url && !isGenerating && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRegenerate(scene.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Régénérer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImport(scene.id)}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Importer
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          useSceneStore
                            .getState()
                            .approveScene(scene.id)
                            .then(() =>
                              addToast("Image approuvée", "success")
                            )
                        }
                        disabled={scene.user_approved}
                      >
                        <Check className="h-3.5 w-3.5" />
                        {scene.user_approved ? "Approuvée" : "Approuver"}
                      </Button>
                    </>
                  )}
                </div>

                {job?.error_message && !isGenerating && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <p className="text-xs text-red-600">{job.error_message}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Modal de previsualisation plein ecran */}
      {previewScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="absolute right-4 top-4 flex gap-2">
            <a
              href={`${API_BASE}/media/${previewScene.generated_image_url}`}
              download
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
            </a>
            <button
              onClick={() => setPreviewScene(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="absolute inset-0"
            onClick={() => setPreviewScene(null)}
          />

          <div className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center">
            <img
              src={`${API_BASE}/media/${previewScene.generated_image_url}`}
              alt={`Scène ${previewScene.index + 1}`}
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <div className="mt-3 text-center">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                Scène {previewScene.index + 1}
                {previewScene.shot_type && ` — ${previewScene.shot_type}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

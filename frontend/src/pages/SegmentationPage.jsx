import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Scissors,
  Layers,
  Check,
  Trash2,
  X,
  Download,
  Play,
  AlertCircle,
  RefreshCw,
  Eraser,
  FileDown,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import useSceneStore from "../stores/useSceneStore";
import useSegmentationStore from "../stores/useSegmentationStore";
import useUIStore from "../stores/useUIStore";
import usePolling from "../hooks/usePolling";
import { JOB_STATUS, ASSET_TYPE_LABELS } from "../utils/constants";
import { exportScenePsd } from "../api/segmentation";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Page de segmentation : decoupe les images generees en assets via SAM2
export default function SegmentationPage() {
  const { projectId } = useParams();
  const { scenes, fetchScenes } = useSceneStore();
  const {
    jobs,
    assets,
    loading: loadingMap,
    startSegmentation,
    fetchStatus,
    fetchAssets,
    approveAsset,
    deleteAsset,
    clearSceneAssets,
  } = useSegmentationStore();
  const addToast = useUIStore((s) => s.addToast);

  const [previewAsset, setPreviewAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [clearTarget, setClearTarget] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [segmentingAll, setSegmentingAll] = useState(false);
  const [psdExportingId, setPsdExportingId] = useState(null);

  useEffect(() => {
    if (projectId) fetchScenes(projectId);
  }, [projectId, fetchScenes]);

  const eligibleScenes = useMemo(
    () =>
      scenes.filter(
        (s) => s.generated_image_url && s.image_status !== "pending"
      ),
    [scenes]
  );

  useEffect(() => {
    eligibleScenes.forEach((scene) => {
      fetchAssets(scene.id);
      if (scene.segmentation_status === "running" || scene.segmentation_status === "queued") {
        fetchStatus(scene.id);
      }
    });
  }, [eligibleScenes, fetchAssets, fetchStatus]);

  const hasRunningJobs =
    Object.values(jobs).some(
      (j) => j?.status === JOB_STATUS.QUEUED || j?.status === JOB_STATUS.RUNNING
    ) || Object.values(loadingMap).some(Boolean);

  const jobsRef = useRef(jobs);
  useEffect(() => { jobsRef.current = jobs; }, [jobs]);

  const pollRunning = useCallback(() => {
    eligibleScenes.forEach((scene) => {
      const job = jobsRef.current[scene.id];
      if (
        scene.segmentation_status === "running" ||
        scene.segmentation_status === "queued" ||
        job?.status === JOB_STATUS.QUEUED ||
        job?.status === JOB_STATUS.RUNNING
      ) {
        fetchStatus(scene.id).then((j) => {
          if (j?.status === "completed") {
            fetchAssets(scene.id);
            fetchScenes(projectId);
          }
        });
      }
    });
  }, [eligibleScenes, fetchStatus, fetchAssets, fetchScenes, projectId]);

  usePolling(pollRunning, 4000, hasRunningJobs);

  // Lance la segmentation pour une scene
  async function handleSegment(sceneId) {
    try {
      await startSegmentation(sceneId);
      addToast("Segmentation lancée", "info");
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  // Lance la segmentation pour toutes les scenes eligible
  async function handleSegmentAll() {
    const pending = eligibleScenes.filter(
      (s) =>
        s.segmentation_status !== "running" &&
        s.segmentation_status !== "completed" &&
        !(assets[s.id]?.length > 0)
    );
    if (pending.length === 0) {
      addToast("Toutes les scènes sont déjà segmentées", "info");
      return;
    }
    setSegmentingAll(true);
    let count = 0;
    for (const scene of pending) {
      try {
        await startSegmentation(scene.id);
        count++;
      } catch { /* continue */ }
    }
    setSegmentingAll(false);
    addToast(`${count} segmentation(s) lancée(s)`, "info");
  }

  // Confirme la suppression d'un asset
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAsset(deleteTarget.sceneId, deleteTarget.assetId);
      addToast("Asset supprimé", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // Telecharge le PSD multi-calques pour une scene
  async function handleExportPsd(sceneId) {
    setPsdExportingId(sceneId);
    try {
      await exportScenePsd(sceneId);
      addToast("PSD téléchargé", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setPsdExportingId(null);
    }
  }

  // Confirme la suppression de tous les assets d'une scene
  async function confirmClear() {
    if (!clearTarget) return;
    setClearing(true);
    try {
      await clearSceneAssets(clearTarget.sceneId);
      if (projectId) fetchScenes(projectId);
      addToast("Assets supprimés", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setClearing(false);
      setClearTarget(null);
    }
  }

  // Ferme la modal preview avec Escape
  useEffect(() => {
    if (!previewAsset) return;
    const handler = (e) => e.key === "Escape" && setPreviewAsset(null);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewAsset]);

  if (eligibleScenes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-6">
        <EmptyState
          icon={<Scissors className="h-12 w-12" strokeWidth={1} />}
          title="Aucune image à segmenter"
          description="Générez d'abord des images dans l'onglet Génération"
        />
      </div>
    );
  }

  const pendingCount = eligibleScenes.filter(
    (s) =>
      s.segmentation_status !== "running" &&
      s.segmentation_status !== "completed" &&
      !(assets[s.id]?.length > 0)
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Segmentation
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Découpez les images en éléments animables via SAM2
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleSegmentAll}
            disabled={segmentingAll}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-600 px-4 text-xs font-medium text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {segmentingAll ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Segmenter tout ({pendingCount})
          </button>
        )}
      </div>

      <div className="space-y-6">
        {eligibleScenes.map((scene, index) => {
          const job = jobs[scene.id];
          const sceneAssets = assets[scene.id] || [];
          const isLoading = !!loadingMap[scene.id];
          const isRunning =
            isLoading ||
            scene.segmentation_status === "running" ||
            job?.status === JOB_STATUS.QUEUED ||
            job?.status === JOB_STATUS.RUNNING;
          const isDone = sceneAssets.length > 0;

          return (
            <div key={scene.id} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 overflow-hidden rounded-md bg-surface-dim shrink-0">
                    <img
                      src={`${API_BASE}/media/${scene.generated_image_url}`}
                      alt={`Scène ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    Scène {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isRunning && (
                    <Badge color="bg-amber-50 text-amber-600" dot="bg-amber-500">
                      En cours...
                    </Badge>
                  )}

                  {isDone && !isRunning && (
                    <Badge color="bg-emerald-50 text-emerald-600">
                      {sceneAssets.length} assets
                    </Badge>
                  )}

                  {/* Segmenter / Re-segmenter */}
                  {!isRunning && (
                    <button
                      onClick={() => handleSegment(scene.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary-50 hover:text-primary-600"
                      title={isDone ? "Re-segmenter" : "Segmenter"}
                    >
                      {isDone ? (
                        <RefreshCw className="h-4 w-4" />
                      ) : (
                        <Scissors className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {/* Exporter un PSD unique */}
                  {isDone && !isRunning && (
                    <button
                      type="button"
                      onClick={() => handleExportPsd(scene.id)}
                      disabled={psdExportingId === scene.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
                      title="Exporter PSD"
                    >
                      {psdExportingId === scene.id ? (
                        <Spinner size="sm" className="text-primary-500" />
                      ) : (
                        <FileDown className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {/* Vider tous les assets */}
                  {isDone && !isRunning && (
                    <button
                      onClick={() => setClearTarget({ sceneId: scene.id, index: index + 1 })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Vider les assets"
                    >
                      <Eraser className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {isRunning && (
                <div className="flex items-center justify-center py-10">
                  <div className="text-center">
                    <Spinner />
                    <p className="mt-2 text-xs text-text-muted">
                      Segmentation en cours...
                    </p>
                  </div>
                </div>
              )}

              {job?.status === "failed" && !isRunning && (
                <div className="flex items-start gap-2 mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  <p className="text-xs text-red-600">{job.error_message}</p>
                </div>
              )}

              {isDone && !isRunning && (
                <div className="grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {sceneAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group relative rounded-lg border border-border bg-surface-dim overflow-hidden"
                    >
                      <div
                        className="aspect-square cursor-pointer bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
                        onClick={() => setPreviewAsset(asset)}
                      >
                        {asset.original_png_url && (
                          <img
                            src={`${API_BASE}/media/${asset.original_png_url}`}
                            alt={asset.layer_name || asset.asset_type}
                            className="h-full w-full object-contain transition-opacity group-hover:opacity-90"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-text-primary truncate">
                            {asset.layer_name || ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type}
                          </p>
                          {asset.confidence_score != null && (
                            <p className="text-[10px] text-text-muted">
                              {Math.round(asset.confidence_score * 100)}%
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {asset.user_approved ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                approveAsset(scene.id, asset.id)
                                  .then(() => addToast("Asset approuvé", "success"))
                                  .catch((e) => addToast(e.message, "error"));
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted hover:bg-emerald-50 hover:text-emerald-600"
                              title="Approuver"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                sceneId: scene.id,
                                assetId: asset.id,
                                name: asset.layer_name || asset.asset_type,
                              })
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted hover:bg-red-50 hover:text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isDone && !isRunning && !(job?.status === "failed") && (
                <div className="flex items-center justify-center py-10 text-text-muted">
                  <p className="text-xs">Cliquez sur <Scissors className="inline h-3.5 w-3.5 mx-0.5" /> pour segmenter</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal preview asset */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="absolute right-4 top-4 flex gap-2">
            {previewAsset.original_png_url && (
              <a
                href={`${API_BASE}/media/${previewAsset.original_png_url}`}
                download
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                title="Télécharger"
              >
                <Download className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={() => setPreviewAsset(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute inset-0" onClick={() => setPreviewAsset(null)} />

          <div className="relative z-10 flex max-h-[90vh] max-w-[90vw] flex-col items-center">
            <div className="rounded-lg bg-[repeating-conic-gradient(#374151_0%_25%,#1f2937_0%_50%)] bg-[length:20px_20px] p-2 shadow-2xl">
              <img
                src={`${API_BASE}/media/${previewAsset.original_png_url}`}
                alt={previewAsset.layer_name || previewAsset.asset_type}
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
                {previewAsset.layer_name || ASSET_TYPE_LABELS[previewAsset.asset_type] || previewAsset.asset_type}
              </span>
              {previewAsset.mask_url && (
                <a
                  href={`${API_BASE}/media/${previewAsset.mask_url}`}
                  download
                  className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 hover:bg-white/20 hover:text-white"
                >
                  <Layers className="mr-1 inline h-3.5 w-3.5" />
                  Masque
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm suppression 1 asset */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Supprimer l'asset"
        message={`Supprimer « ${deleteTarget?.name} » ?`}
        loading={deleting}
      />

      {/* Confirm vider tous les assets */}
      <ConfirmDialog
        isOpen={!!clearTarget}
        onClose={() => setClearTarget(null)}
        onConfirm={confirmClear}
        title="Vider les assets"
        message={`Supprimer tous les assets de la scène ${clearTarget?.index} ? Cette action est irréversible.`}
        loading={clearing}
      />
    </div>
  );
}

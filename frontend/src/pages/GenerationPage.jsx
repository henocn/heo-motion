import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
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

// Renvoie la couleur du badge selon le statut d'image
function getStatusBadge(status) {
  const map = {
    pending: { color: "bg-slate-100 text-slate-600", label: "En attente" },
    generating: { color: "bg-amber-100 text-amber-700", label: "En cours..." },
    generated: { color: "bg-blue-100 text-blue-700", label: "Générée" },
    approved: { color: "bg-emerald-100 text-emerald-700", label: "Approuvée" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejetée" },
  };
  return map[status] || { color: "bg-slate-100 text-slate-600", label: status };
}

// Page de generation d'images pour chaque scene
export default function GenerationPage() {
  const { projectId } = useParams();
  const { scenes, fetchScenes } = useSceneStore();
  const { jobs, startGeneration, regenerate, fetchStatus } =
    useGenerationStore();
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (projectId) fetchScenes(projectId);
  }, [projectId, fetchScenes]);

  const hasRunningJobs = Object.values(jobs).some(
    (j) => j?.status === JOB_STATUS.QUEUED || j?.status === JOB_STATUS.RUNNING
  );

  // Polling des scenes en cours de generation
  const pollRunning = useCallback(() => {
    scenes.forEach((scene) => {
      if (
        scene.image_status === "generating" ||
        jobs[scene.id]?.status === JOB_STATUS.QUEUED ||
        jobs[scene.id]?.status === JOB_STATUS.RUNNING
      ) {
        fetchStatus(scene.id);
        fetchScenes(projectId);
      }
    });
  }, [scenes, jobs, fetchStatus, fetchScenes, projectId]);

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

  if (scenes.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Aucune scène"
          description="Générez d'abord le storyboard dans l'onglet Storyboard"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Génération d'images
        </h2>
        <p className="text-sm text-slate-500">
          Générez et validez les images pour chaque scène
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {scenes.map((scene, index) => {
          const job = jobs[scene.id];
          const isGenerating =
            scene.image_status === "generating" ||
            job?.status === JOB_STATUS.QUEUED ||
            job?.status === JOB_STATUS.RUNNING;
          const badge = getStatusBadge(scene.image_status);

          return (
            <Card key={scene.id}>
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Scène {index + 1}
                  </span>
                  <Badge color={badge.color}>{badge.label}</Badge>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">
                  {scene.visual_description}
                </p>

                {scene.prompt_generated && (
                  <details className="text-xs text-slate-400">
                    <summary className="cursor-pointer hover:text-slate-600">
                      Voir le prompt
                    </summary>
                    <p className="mt-1 rounded bg-slate-50 p-2">
                      {scene.prompt_generated}
                    </p>
                  </details>
                )}

                <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                  {isGenerating ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Spinner />
                        <p className="mt-2 text-xs text-slate-400">
                          Génération en cours...
                        </p>
                      </div>
                    </div>
                  ) : scene.generated_image_url ? (
                    <img
                      src={`${API_BASE}/media/${scene.generated_image_url}`}
                      alt={`Scène ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!scene.generated_image_url && !isGenerating && (
                    <Button
                      size="sm"
                      onClick={() => handleGenerate(scene.id)}
                    >
                      Générer l'image
                    </Button>
                  )}
                  {scene.generated_image_url && !isGenerating && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRegenerate(scene.id)}
                      >
                        Régénérer
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
                        {scene.user_approved ? "Approuvée ✓" : "Approuver"}
                      </Button>
                    </>
                  )}
                </div>

                {job?.error_message && (
                  <p className="text-xs text-red-500">{job.error_message}</p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

import { useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  Check,
  Image as ImageIcon,
  ChevronDown,
  AlertCircle,
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

    if (projectId) fetchScenes(projectId);
  }, [fetchStatus, fetchScenes, projectId]);

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
      <div className="mx-auto max-w-5xl px-6 py-6">
        <EmptyState
          icon={<ImageIcon className="h-12 w-12" strokeWidth={1} />}
          title="Aucune scène"
          description="Générez d'abord le storyboard dans l'onglet Storyboard"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-text-primary">
          Génération d'images
        </h2>
        <p className="mt-0.5 text-sm text-text-muted">
          Générez et validez les visuels de chaque scène
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenes.map((scene, index) => {
          const job = jobs[scene.id];
          const isGenerating =
            scene.image_status === "generating" ||
            job?.status === JOB_STATUS.QUEUED ||
            job?.status === JOB_STATUS.RUNNING;
          const status = STATUS_MAP[scene.image_status] || STATUS_MAP.pending;

          return (
            <Card key={scene.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">
                    Scène {index + 1}
                  </span>
                  <Badge color={status.color} dot={status.dot}>
                    {status.label}
                  </Badge>
                </div>

                <p className="text-xs text-text-muted line-clamp-2">
                  {scene.visual_description}
                </p>

                {scene.prompt_generated && (
                  <details className="group">
                    <summary className="flex cursor-pointer items-center gap-1 text-xs text-text-muted hover:text-text-secondary">
                      <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                      Voir le prompt
                    </summary>
                    <p className="mt-1.5 rounded-lg bg-surface-dim p-2.5 text-xs text-text-secondary leading-relaxed">
                      {scene.prompt_generated}
                    </p>
                  </details>
                )}

                <div className="aspect-video overflow-hidden rounded-lg bg-surface-dim">
                  {isGenerating ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Spinner />
                        <p className="mt-2 text-xs text-text-muted">
                          Génération...
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
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <ImageIcon className="h-10 w-10" strokeWidth={1} />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!scene.generated_image_url && !isGenerating && (
                    <Button size="sm" onClick={() => handleGenerate(scene.id)}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Générer
                    </Button>
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

                {job?.error_message && (
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
    </div>
  );
}

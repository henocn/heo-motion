import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Layers, Download } from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import useSceneStore from "../stores/useSceneStore";
import useUIStore from "../stores/useUIStore";
import { postSam3Segment } from "../api/sam3";
import { mediaUrl } from "../utils/mediaUrl";

const MASK_COLORS = ["green", "red", "blue", "yellow", "cyan", "magenta"];

// Borne une valeur numerique entre 0 et 1 (champs formulaire)
function clamp01(value, fallback = 0.5) {
  const v = Number(value);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(1, Math.max(0, v));
}

// Page : segmentation SAM3 par scene, prompts separes par des virgules
export default function SegmentationPage() {
  const { projectId } = useParams();
  const { scenes, loading, fetchScenes } = useSceneStore();
  const addToast = useUIStore((s) => s.addToast);

  const [promptsByScene, setPromptsByScene] = useState({});
  const [segmentingId, setSegmentingId] = useState(null);
  const [lastResultByScene, setLastResultByScene] = useState({});

  const [threshold, setThreshold] = useState(0.5);
  const [maskColor, setMaskColor] = useState("green");
  const [maskOnly, setMaskOnly] = useState(false);
  const [returnZip, setReturnZip] = useState(true);
  const [maskOpacity, setMaskOpacity] = useState(0.5);
  const [saveOverlay, setSaveOverlay] = useState(false);

  useEffect(() => {
    if (projectId) fetchScenes(projectId);
  }, [projectId, fetchScenes]);

  // Met a jour le champ prompts CSV pour une scene
  const setPromptsForScene = useCallback((sceneId, value) => {
    setPromptsByScene((prev) => ({ ...prev, [sceneId]: value }));
  }, []);

  // Appelle le backend SAM3 pour une scene
  async function handleSegment(sceneId) {
    const prompts_csv = (promptsByScene[sceneId] ?? "").trim();
    if (!prompts_csv) {
      addToast("Indiquez au moins un prompt (separes par des virgules).", "error");
      return;
    }
    setSegmentingId(sceneId);
    try {
      const data = await postSam3Segment(sceneId, {
        prompts_csv,
        threshold: clamp01(threshold),
        mask_only: maskOnly,
        mask_color: maskColor,
        return_zip: returnZip,
        mask_opacity: clamp01(maskOpacity),
        save_overlay: saveOverlay,
      });
      setLastResultByScene((prev) => ({ ...prev, [sceneId]: data }));
      addToast("Segmentation terminee — ZIP disponible", "success");
    } catch (err) {
      addToast(err.message || "Erreur segmentation", "error");
    } finally {
      setSegmentingId(null);
    }
  }

  if (loading && scenes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (scenes.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-6">
        <EmptyState
          icon={<Layers className="h-12 w-12" strokeWidth={1} />}
          title="Aucune scene"
          description="Ajoutez des scenes au projet pour lancer la segmentation"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-text-primary">
          Segmentation (SAM3 / Replicate)
        </h2>
        <p className="mt-0.5 text-sm text-text-muted">
          Saisissez plusieurs prompts separes par des virgules (ex : clothes, person, face).
          Une image generee est requise par scene.
        </p>
      </div>

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <p className="text-xs font-medium text-text-secondary">
            Options avancees (toutes les scenes)
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Seuil (0–1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={threshold}
                onChange={(e) => setThreshold(e.target.valueAsNumber)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Couleur du masque
              <select
                value={maskColor}
                onChange={(e) => setMaskColor(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary"
              >
                {MASK_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-text-muted">
              Opacite masque (0–1)
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={maskOpacity}
                onChange={(e) => setMaskOpacity(e.target.valueAsNumber)}
                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-text-primary"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={maskOnly}
                onChange={(e) => setMaskOnly(e.target.checked)}
              />
              Masque uniquement (noir et blanc)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={returnZip}
                onChange={(e) => setReturnZip(e.target.checked)}
              />
              Retour ZIP (masques PNG)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveOverlay}
                onChange={(e) => setSaveOverlay(e.target.checked)}
              />
              Inclure overlay dans le ZIP
            </label>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenes.map((scene, index) => {
          const hasImage = Boolean(scene.generated_image_url);
          const busy = segmentingId === scene.id;
          const last = lastResultByScene[scene.id];

          return (
            <Card key={scene.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">
                    Scene {index + 1}
                  </span>
                  {!hasImage && (
                    <span className="text-xs text-amber-600">Image requise</span>
                  )}
                </div>
                <p className="text-xs text-text-muted line-clamp-2">
                  {scene.visual_description}
                </p>

                {hasImage && (
                  <div className="overflow-hidden rounded-lg border border-border bg-surface-dim">
                    <img
                      src={mediaUrl(scene.generated_image_url)}
                      alt=""
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                )}

                <label className="block text-xs font-medium text-text-secondary">
                  Prompts (virgules)
                  <textarea
                    value={promptsByScene[scene.id] ?? ""}
                    onChange={(e) => setPromptsForScene(scene.id, e.target.value)}
                    placeholder="clothes, person, face"
                    rows={2}
                    disabled={!hasImage || busy}
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:opacity-50"
                  />
                </label>

                {last?.zip_path && (
                  <a
                    href={mediaUrl(last.zip_path)}
                    download
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Telecharger le ZIP
                  </a>
                )}
                {last?.prompt_used && (
                  <p className="text-[11px] text-text-muted">
                    Envoye a Replicate :{" "}
                    <span className="text-text-secondary">{last.prompt_used}</span>
                  </p>
                )}

                <Button
                  size="sm"
                  onClick={() => handleSegment(scene.id)}
                  disabled={!hasImage || busy}
                  loading={busy}
                >
                  Lancer SAM3
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

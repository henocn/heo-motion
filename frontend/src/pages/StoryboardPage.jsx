import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Wand2,
  RefreshCw,
  Camera,
  Users,
  Package,
  Mountain,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import useSceneStore from "../stores/useSceneStore";
import useUIStore from "../stores/useUIStore";
import { generateStoryboard } from "../api/scenes";

const SHOT_COLORS = {
  "wide shot": "bg-indigo-50 text-indigo-600",
  "medium shot": "bg-sky-50 text-sky-600",
  "close-up": "bg-purple-50 text-purple-600",
  "full shot": "bg-teal-50 text-teal-600",
};

// Page storyboard : affiche les scenes avec possibilite de modifier et supprimer
export default function StoryboardPage() {
  const { projectId } = useParams();
  const { scenes, loading, fetchScenes, updateScene, deleteScene } =
    useSceneStore();
  const addToast = useUIStore((s) => s.addToast);

  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (projectId) fetchScenes(projectId);
  }, [projectId, fetchScenes]);

  // Lance la generation du storyboard via le LLM
  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateStoryboard(projectId);
      await fetchScenes(projectId);
      addToast("Storyboard généré avec succès", "success");
    } catch (err) {
      addToast(err.message || "Erreur lors de la génération", "error");
    } finally {
      setGenerating(false);
    }
  }

  // Ouvre le mode edition pour une scene
  function startEdit(scene) {
    setEditingId(scene.id);
    setEditForm({
      script_excerpt: scene.script_excerpt || "",
      visual_description: scene.visual_description || "",
      intention: scene.intention || "",
      shot_type: scene.shot_type || "",
    });
  }

  // Annule le mode edition
  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  // Sauvegarde les modifications d'une scene
  async function handleSave(sceneId) {
    setSaving(true);
    try {
      await updateScene(sceneId, editForm);
      setEditingId(null);
      addToast("Scène mise à jour", "success");
    } catch {
      addToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  // Confirme la suppression d'une scene
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteScene(deleteTarget.id);
      addToast("Scène supprimée", "success");
      setDeleteTarget(null);
    } catch {
      addToast("Erreur lors de la suppression", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Storyboard
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            {scenes.length > 0
              ? `${scenes.length} scène${scenes.length > 1 ? "s" : ""}`
              : "Découpez le script en scènes visuelles"}
          </p>
        </div>
        <Button onClick={handleGenerate} loading={generating}>
          {scenes.length > 0 ? (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Régénérer
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5" />
              Générer le storyboard
            </>
          )}
        </Button>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-text-muted">
            Analyse du script en cours...
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : scenes.length === 0 ? (
        <EmptyState
          icon={<Camera className="h-12 w-12" strokeWidth={1} />}
          title="Aucune scène"
          description="Cliquez sur « Générer le storyboard » pour découper le script automatiquement"
        />
      ) : (
        <div className="space-y-3">
          {scenes.map((scene, index) => (
            <Card key={scene.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-semibold text-primary-600">
                    {index + 1}
                  </div>

                  {editingId === scene.id ? (
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-muted">
                            Type de plan
                          </label>
                          <input
                            type="text"
                            value={editForm.shot_type}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                shot_type: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-muted">
                            Intention
                          </label>
                          <input
                            type="text"
                            value={editForm.intention}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                intention: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-muted">
                          Extrait du script
                        </label>
                        <textarea
                          value={editForm.script_excerpt}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              script_excerpt: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-muted">
                          Description visuelle
                        </label>
                        <textarea
                          value={editForm.visual_description}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              visual_description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(scene.id)}
                          loading={saving}
                        >
                          <Save className="h-3.5 w-3.5" />
                          Enregistrer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            color={
                              SHOT_COLORS[scene.shot_type] ||
                              "bg-slate-50 text-slate-600"
                            }
                          >
                            {scene.shot_type}
                          </Badge>
                          {scene.intention && (
                            <span className="text-xs text-text-muted">
                              {scene.intention}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(scene)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(scene)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg bg-surface-dim px-3.5 py-2.5">
                        <p className="text-sm italic text-text-secondary">
                          « {scene.script_excerpt} »
                        </p>
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed">
                        {scene.visual_description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {(scene.characters || []).map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                          >
                            <Users className="h-3 w-3" />
                            {c}
                          </span>
                        ))}
                        {(scene.objects || []).map((o) => (
                          <span
                            key={o}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                          >
                            <Package className="h-3 w-3" />
                            {o}
                          </span>
                        ))}
                        {scene.background && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                            <Mountain className="h-3 w-3" />
                            {scene.background}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Supprimer la scène"
        message={`Êtes-vous sûr de vouloir supprimer la scène « ${deleteTarget?.shot_type || ""} » ? L'image générée associée sera aussi perdue.`}
        loading={deleting}
      />
    </div>
  );
}

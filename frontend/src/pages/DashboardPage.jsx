import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderOpen,
  Trash2,
  ChevronRight,
  Film,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import useProjectStore from "../stores/useProjectStore";
import useUIStore from "../stores/useUIStore";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "../utils/constants";
import { formatRelativeTime } from "../utils/formatters";

// Page d'accueil avec la liste de tous les projets (vue tableau)
export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, createProject, deleteProject } =
    useProjectStore();
  const { addToast, openModal, closeModal, activeModal } = useUIStore();

  const [formData, setFormData] = useState({ name: "", script_raw_text: "" });
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Soumet le formulaire de creation de projet
  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.script_raw_text.trim()) return;
    setCreating(true);
    try {
      const project = await createProject(formData);
      addToast("Projet créé avec succès", "success");
      closeModal();
      setFormData({ name: "", script_raw_text: "" });
      navigate(`/projects/${project.id}`);
    } catch {
      addToast("Erreur lors de la création", "error");
    } finally {
      setCreating(false);
    }
  }

  // Confirme la suppression du projet
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      addToast("Projet supprimé", "success");
      setDeleteTarget(null);
    } catch {
      addToast("Erreur lors de la suppression", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Projets</h1>
          <p className="mt-1 text-sm text-text-muted">
            {projects.length} projet{projects.length !== 1 && "s"}
          </p>
        </div>
        <Button onClick={() => openModal("create-project")}>
          <Plus className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-12 w-12" strokeWidth={1} />}
          title="Aucun projet"
          description="Créez votre premier projet pour commencer à produire du motion design"
          action={
            <Button onClick={() => openModal("create-project")}>
              <Plus className="h-4 w-4" />
              Nouveau projet
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-dim text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 hidden sm:table-cell">Créé</th>
                <th className="px-5 py-3 hidden md:table-cell">Modifié</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group cursor-pointer transition-colors hover:bg-surface-hover"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Film className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {project.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-text-muted">
                    {formatRelativeTime(project.created_at)}
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-xs text-text-muted">
                    {project.updated_at
                      ? formatRelativeTime(project.updated_at)
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(project);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={activeModal === "create-project"}
        onClose={closeModal}
        title="Nouveau projet"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Nom du projet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="Mon projet motion design"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Script (voix off)
            </label>
            <textarea
              value={formData.script_raw_text}
              onChange={(e) =>
                setFormData((f) => ({ ...f, script_raw_text: e.target.value }))
              }
              rows={6}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="Collez votre script ici..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Annuler
            </Button>
            <Button type="submit" loading={creating}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer « ${deleteTarget?.name} » ? Toutes les scènes, images et assets associés seront définitivement perdus.`}
        loading={deleting}
      />
    </div>
  );
}

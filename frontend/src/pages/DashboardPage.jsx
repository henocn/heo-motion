import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import useProjectStore from "../stores/useProjectStore";
import useUIStore from "../stores/useUIStore";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "../utils/constants";
import { formatRelativeTime } from "../utils/formatters";

// Page d'accueil avec la liste de tous les projets
export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects, createProject, deleteProject } =
    useProjectStore();
  const { addToast, openModal, closeModal, activeModal } = useUIStore();

  const [formData, setFormData] = useState({ name: "", script_raw_text: "" });
  const [creating, setCreating] = useState(false);

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

  // Supprime un projet apres confirmation
  async function handleDelete(projectId) {
    if (!window.confirm("Supprimer ce projet ?")) return;
    try {
      await deleteProject(projectId);
      addToast("Projet supprimé", "success");
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
  }

  return (
    <>
      <Header
        title="Projets"
        actions={
          <Button onClick={() => openModal("create-project")}>
            + Nouveau projet
          </Button>
        }
      />
      <PageContainer>
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
            title="Aucun projet"
            description="Créez votre premier projet pour commencer"
            action={
              <Button onClick={() => openModal("create-project")}>
                + Nouveau projet
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardBody>
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <Badge color={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="mb-3 text-sm text-slate-500 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(project.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>

      <Modal
        isOpen={activeModal === "create-project"}
        onClose={closeModal}
        title="Nouveau projet"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nom du projet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Mon projet motion design"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Script (voix off)
            </label>
            <textarea
              value={formData.script_raw_text}
              onChange={(e) =>
                setFormData((f) => ({ ...f, script_raw_text: e.target.value }))
              }
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
    </>
  );
}

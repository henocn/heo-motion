import { useEffect } from "react";
import { useParams, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  LayoutPanelTop,
  Image,
  Download,
  Layers,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import useProjectStore from "../stores/useProjectStore";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
} from "../utils/constants";

const TABS = [
  { label: "Détails", to: "", icon: FileText, end: true },
  { label: "Storyboard", to: "storyboard", icon: LayoutPanelTop },
  { label: "Génération", to: "generation", icon: Image },
  { label: "Segmentation", to: "segmentation", icon: Layers },
  { label: "Export", to: "export", icon: Download },
];

// Page projet avec navigation par onglets
export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject, clearCurrentProject } =
    useProjectStore();

  useEffect(() => {
    fetchProject(projectId);
    return () => clearCurrentProject();
  }, [projectId, fetchProject, clearCurrentProject]);

  if (loading || !currentProject) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-4 py-5">
            <button
              onClick={() => navigate("/")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-text-primary">
                  {currentProject.name}
                </h1>
                <Badge color={PROJECT_STATUS_COLORS[currentProject.status]}>
                  {PROJECT_STATUS_LABELS[currentProject.status]}
                </Badge>
              </div>
            </div>
          </div>

          <nav className="-mb-px flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.label}
                  to={
                    tab.to
                      ? `/projects/${projectId}/${tab.to}`
                      : `/projects/${projectId}`
                  }
                  end={tab.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-text-muted hover:border-border hover:text-text-secondary"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

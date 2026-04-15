import { useEffect } from "react";
import { useParams, NavLink, Outlet, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import useProjectStore from "../stores/useProjectStore";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "../utils/constants";

const TABS = [
  { label: "Storyboard", to: "storyboard" },
  { label: "Génération", to: "generation" },
  { label: "Segmentation", to: "segmentation" },
  { label: "Export", to: "export" },
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
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Header
        title={currentProject.name}
        actions={
          <Badge color={PROJECT_STATUS_COLORS[currentProject.status]}>
            {PROJECT_STATUS_LABELS[currentProject.status]}
          </Badge>
        }
      />
      <div className="border-b border-slate-200 bg-white px-6">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={`/projects/${projectId}/${tab.to}`}
              className={({ isActive }) =>
                `border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </>
  );
}

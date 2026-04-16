import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import StoryboardPage from "./pages/StoryboardPage";
import GenerationPage from "./pages/GenerationPage";
import SegmentationPage from "./pages/SegmentationPage";
import ExportPage from "./pages/ExportPage";
import NotFoundPage from "./pages/NotFoundPage";

// Point d'entree du routing de l'application
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects/:projectId" element={<ProjectPage />}>
            <Route index element={<ProjectDetailsPage />} />
            <Route path="storyboard" element={<StoryboardPage />} />
            <Route path="generation" element={<GenerationPage />} />
            <Route path="segmentation" element={<SegmentationPage />} />
            <Route path="export" element={<ExportPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

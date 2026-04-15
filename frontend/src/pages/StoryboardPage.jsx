import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import useSceneStore from "../stores/useSceneStore";
import useUIStore from "../stores/useUIStore";
import { generateStoryboard } from "../api/scenes";

// Page storyboard : affiche les scenes et permet de generer le decoupage via LLM
export default function StoryboardPage() {
  const { projectId } = useParams();
  const { scenes, loading, fetchScenes } = useSceneStore();
  const addToast = useUIStore((s) => s.addToast);
  const [generating, setGenerating] = useState(false);

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

  const SHOT_TYPE_COLORS = {
    "wide shot": "bg-indigo-100 text-indigo-700",
    "medium shot": "bg-blue-100 text-blue-700",
    "close-up": "bg-purple-100 text-purple-700",
    "full shot": "bg-teal-100 text-teal-700",
  };

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Storyboard</h2>
          <p className="text-sm text-slate-500">
            {scenes.length > 0
              ? `${scenes.length} scène(s) générée(s)`
              : "Générez le storyboard à partir du script"}
          </p>
        </div>
        <Button onClick={handleGenerate} loading={generating}>
          {scenes.length > 0 ? "Régénérer" : "Générer le storyboard"}
        </Button>
      </div>

      {generating ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-slate-500">
            Analyse du script en cours...
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : scenes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
          title="Aucune scène"
          description="Cliquez sur « Générer le storyboard » pour découper automatiquement votre script"
        />
      ) : (
        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <Card key={scene.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        color={
                          SHOT_TYPE_COLORS[scene.shot_type] ||
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {scene.shot_type}
                      </Badge>
                      {scene.intention && (
                        <span className="text-xs text-slate-400">
                          {scene.intention}
                        </span>
                      )}
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm italic text-slate-600">
                        « {scene.script_excerpt} »
                      </p>
                    </div>

                    <p className="text-sm text-slate-700">
                      {scene.visual_description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(scene.characters || []).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                        >
                          👤 {c}
                        </span>
                      ))}
                      {(scene.objects || []).map((o) => (
                        <span
                          key={o}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        >
                          📦 {o}
                        </span>
                      ))}
                      {scene.background && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                          🏞️ {scene.background}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

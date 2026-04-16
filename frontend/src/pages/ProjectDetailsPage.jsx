import { useState } from "react";
import { Edit3, Save, Clock, FileText, Hash } from "lucide-react";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import useProjectStore from "../stores/useProjectStore";
import useUIStore from "../stores/useUIStore";
import { formatDate } from "../utils/formatters";

// Page de details du projet : infos generales, script, metadonnees
export default function ProjectDetailsPage() {
  const { currentProject, updateProject } = useProjectStore();
  const addToast = useUIStore((s) => s.addToast);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    script_raw_text: "",
  });

  if (!currentProject) return null;

  // Passe en mode edition
  function startEdit() {
    setForm({
      name: currentProject.name,
      script_raw_text: currentProject.script_raw_text || "",
    });
    setEditing(true);
  }

  // Sauvegarde les modifications
  async function handleSave() {
    setSaving(true);
    try {
      await updateProject(currentProject.id, form);
      setEditing(false);
      addToast("Projet mis à jour", "success");
    } catch {
      addToast("Erreur lors de la sauvegarde", "error");
    } finally {
      setSaving(false);
    }
  }

  const scriptWordCount = (currentProject.script_raw_text || "")
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-text-primary">
          Détails du projet
        </h2>
        {!editing ? (
          <Button variant="secondary" size="sm" onClick={startEdit}>
            <Edit3 className="h-3.5 w-3.5" />
            Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardBody>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      Nom du projet
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      Script (voix off)
                    </label>
                    <textarea
                      value={form.script_raw_text}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          script_raw_text: e.target.value,
                        }))
                      }
                      rows={12}
                      className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                    Script
                  </h3>
                  <div className="rounded-lg bg-surface-dim p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                      {currentProject.script_raw_text || (
                        <span className="italic text-text-muted">
                          Aucun script
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardBody className="space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Informations
              </h3>
              <div className="space-y-3">
                <InfoRow
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label="ID"
                  value={currentProject.id.slice(0, 8) + "…"}
                />
                <InfoRow
                  icon={<FileText className="h-3.5 w-3.5" />}
                  label="Mots"
                  value={`${scriptWordCount} mot${scriptWordCount !== 1 ? "s" : ""}`}
                />
                <InfoRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Créé le"
                  value={formatDate(currentProject.created_at)}
                />
                <InfoRow
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Modifié le"
                  value={
                    currentProject.updated_at
                      ? formatDate(currentProject.updated_at)
                      : "—"
                  }
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Ligne d'info avec icone, label et valeur
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-text-secondary">{value}</span>
    </div>
  );
}

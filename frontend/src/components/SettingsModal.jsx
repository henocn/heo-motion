import { useState, useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import * as settingsApi from "../api/settings";

const PROVIDERS = [
  { value: "openai", label: "OpenAI (DALL-E 3)", desc: "~$0.04/image — rapide, bon suivi de prompt" },
  { value: "replicate", label: "Replicate (Imagen 4)", desc: "Gratuit — plus lent, qualité variable" },
  { value: "gemini", label: "Google Gemini", desc: "Gratuit — restriction géographique possible" },
];

// Modal de parametres globaux de l'application
export default function SettingsModal({ isOpen, onClose }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setSaved(false);
    settingsApi.fetchSettings()
      .then((data) => setForm(data))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Met a jour un champ du formulaire
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  // Sauvegarde les parametres
  async function handleSave() {
    setSaving(true);
    try {
      const updated = await settingsApi.updateSettings(form);
      setForm(updated);
      setSaved(true);
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres" size="lg">
      {loading || !form ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Provider d'images */}
          <fieldset>
            <legend className="text-sm font-semibold text-text-primary mb-2">
              Provider d'images
            </legend>
            <div className="space-y-2">
              {PROVIDERS.map((p) => (
                <label
                  key={p.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    form.image_provider === p.value
                      ? "border-primary-400 bg-primary-50"
                      : "border-border bg-surface hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="image_provider"
                    value={p.value}
                    checked={form.image_provider === p.value}
                    onChange={(e) => update("image_provider", e.target.value)}
                    className="mt-0.5 h-4 w-4 accent-primary-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">{p.label}</span>
                    <p className="text-xs text-text-muted mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Modele specifique au provider */}
          {form.image_provider === "openai" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Modèle OpenAI
                </label>
                <select
                  value={form.openai_image_model}
                  onChange={(e) => update("openai_image_model", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                >
                  <option value="dall-e-3">DALL-E 3</option>
                  <option value="gpt-image-1">GPT Image 1</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Qualité
                </label>
                <select
                  value={form.openai_image_quality}
                  onChange={(e) => update("openai_image_quality", e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                >
                  <option value="standard">Standard ($0.04)</option>
                  <option value="hd">HD ($0.08)</option>
                </select>
              </div>
            </div>
          )}

          {form.image_provider === "replicate" && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Modèle Replicate
              </label>
              <input
                type="text"
                value={form.replicate_model}
                onChange={(e) => update("replicate_model", e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                placeholder="google/imagen-4"
              />
            </div>
          )}

          {/* Modele LLM */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Modèle LLM (génération de prompts et storyboard)
            </label>
            <select
              value={form.llm_model}
              onChange={(e) => update("llm_model", e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (économique)</option>
              <option value="gpt-4o">GPT-4o (meilleur)</option>
              <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
              <option value="gpt-4.1">GPT-4.1</option>
            </select>
          </div>

          {/* Prompt systeme */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-secondary">
                Prompt système (génération de prompts d'image)
              </label>
              <button
                onClick={() => {
                  update("system_prompt", "");
                  settingsApi.updateSettings({ system_prompt: "" }).then((d) =>
                    setForm(d)
                  );
                }}
                className="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary"
                title="Rétablir le prompt par défaut"
              >
                <RotateCcw className="h-3 w-3" />
                Défaut
              </button>
            </div>
            <textarea
              value={form.system_prompt}
              onChange={(e) => update("system_prompt", e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border bg-surface-dim px-3 py-2 text-xs text-text-primary leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* Negative prompt */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Negative prompt (appliqué à chaque génération)
            </label>
            <textarea
              value={form.negative_prompt}
              onChange={(e) => update("negative_prompt", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface-dim px-3 py-2 text-xs text-text-primary leading-relaxed focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            {saved && (
              <span className="text-xs text-emerald-600 font-medium">
                Paramètres enregistrés
              </span>
            )}
            <Button variant="secondary" onClick={onClose}>
              Fermer
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

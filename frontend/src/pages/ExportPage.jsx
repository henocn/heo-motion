import { Download } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

// Page export — sera completee en Phase 3
export default function ExportPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <EmptyState
        icon={<Download className="h-12 w-12" strokeWidth={1} />}
        title="Export"
        description="Exportez vos assets en PNG, SVG ou projet After Effects"
      />
    </div>
  );
}

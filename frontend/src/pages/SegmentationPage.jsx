import { Scissors } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";

// Page segmentation — sera completee en Phase 3
export default function SegmentationPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <EmptyState
        icon={<Scissors className="h-12 w-12" strokeWidth={1} />}
        title="Segmentation"
        description="Découpez les images en éléments animables (tête, bras, corps...)"
      />
    </div>
  );
}

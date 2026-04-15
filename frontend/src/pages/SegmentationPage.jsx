import PageContainer from "../components/layout/PageContainer";
import EmptyState from "../components/ui/EmptyState";

// Page segmentation — sera completee en Phase 3
export default function SegmentationPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        }
        title="Segmentation"
        description="Découpez les images en éléments animables (tête, bras, corps...)"
      />
    </PageContainer>
  );
}

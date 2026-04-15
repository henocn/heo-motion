import PageContainer from "../components/layout/PageContainer";
import EmptyState from "../components/ui/EmptyState";

// Page export — sera completee en Phase 3
export default function ExportPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        title="Export"
        description="Exportez vos assets en PNG, SVG ou projet After Effects"
      />
    </PageContainer>
  );
}

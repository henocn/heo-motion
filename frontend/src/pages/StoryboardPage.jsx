import PageContainer from "../components/layout/PageContainer";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

// Page storyboard — sera completee en Phase 2
export default function StoryboardPage() {
  return (
    <PageContainer>
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        }
        title="Storyboard"
        description="Générez le storyboard à partir du script pour découper votre projet en scènes"
        action={<Button disabled>Générer le storyboard</Button>}
      />
    </PageContainer>
  );
}

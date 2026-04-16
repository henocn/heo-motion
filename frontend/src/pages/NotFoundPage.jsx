import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

// Page 404
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-dim">
      <p className="text-8xl font-bold text-primary-100">404</p>
      <p className="mt-4 text-lg font-medium text-text-primary">
        Page introuvable
      </p>
      <p className="mt-1 text-sm text-text-muted">
        La page que vous cherchez n'existe pas ou a été déplacée
      </p>
      <Link to="/" className="mt-8">
        <Button variant="secondary">
          <ArrowLeft className="h-4 w-4" />
          Retour aux projets
        </Button>
      </Link>
    </div>
  );
}

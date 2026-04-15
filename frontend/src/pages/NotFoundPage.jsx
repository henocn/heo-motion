import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

// Page 404
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-lg text-slate-600">Page introuvable</p>
      <Link to="/" className="mt-8">
        <Button>Retour aux projets</Button>
      </Link>
    </div>
  );
}

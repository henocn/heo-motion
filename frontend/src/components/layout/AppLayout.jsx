import { Outlet, Link } from "react-router-dom";
import { Clapperboard } from "lucide-react";
import ToastContainer from "../ui/Toast";

// Layout principal : header top + contenu pleine largeur
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-dim">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-surface px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Clapperboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            HEO Motion
          </span>
        </Link>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}

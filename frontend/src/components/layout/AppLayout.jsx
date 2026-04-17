import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Clapperboard, Settings } from "lucide-react";
import ToastContainer from "../ui/Toast";
import SettingsModal from "../SettingsModal";

// Layout principal : header top + contenu pleine largeur
export default function AppLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface-dim">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Clapperboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            HEO Motion
          </span>
        </Link>

        <button
          onClick={() => setSettingsOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
          title="Paramètres"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <ToastContainer />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

import useUIStore from "../../stores/useUIStore";

// Barre superieure avec toggle sidebar et titre de la page
export default function Header({ title, actions }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

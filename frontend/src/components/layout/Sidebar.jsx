import { NavLink } from "react-router-dom";
import useUIStore from "../../stores/useUIStore";

const NAV_ITEMS = [
  {
    label: "Projets",
    to: "/",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
];

// Barre de navigation laterale fixe
export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300 ${
        sidebarOpen ? "w-60" : "w-16"
      }`}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-700 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
          H
        </div>
        {sidebarOpen && (
          <span className="text-lg font-semibold text-white">HEO Motion</span>
        )}
      </div>

      <nav className="mt-4 flex-1 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-slate-400 hover:bg-sidebar-hover hover:text-white"
              }`
            }
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-3 text-xs text-slate-500">
        {sidebarOpen && "v0.1.0"}
      </div>
    </aside>
  );
}

import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ToastContainer from "../ui/Toast";
import useUIStore from "../../stores/useUIStore";

// Layout principal : sidebar fixe + zone de contenu
export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-16"
        }`}
      >
        <Outlet />
      </div>
      <ToastContainer />
    </div>
  );
}

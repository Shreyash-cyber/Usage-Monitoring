import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";

export default function AdminLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr] bg-ink text-white">
      <Sidebar />
      <div className="flex flex-col gap-6 p-8 overflow-y-auto max-h-screen">
        <Topbar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between pb-2 border-b border-white/5">
      <div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Enterprise Usage Monitoring
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Real-time analytics &amp; AI insights</p>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mint/30 to-sky/30 flex items-center justify-center text-xs font-semibold uppercase">
              {user.email?.[0] ?? "?"}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-white/90">{user.email}</div>
              <div className="text-[10px] text-white/40 capitalize">{user.role ?? "user"}</div>
            </div>
          </div>
        )}
        {user ? (
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-all"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-mint to-emerald-400 text-ink hover:shadow-glow transition-all"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}

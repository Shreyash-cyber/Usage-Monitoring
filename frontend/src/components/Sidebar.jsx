import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ai", label: "AI Insights"},
  { to: "/users", label: "Users"},
  { to: "/features", label: "Features"},
];

export default function Sidebar() {
  return (
    <aside className="h-screen bg-ink/80 backdrop-blur-xl border-r border-white/5 p-5 flex flex-col gap-8 sticky top-0">
      <div className="flex items-center gap-2.5 px-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mint to-sky flex items-center justify-center text-ink font-bold text-sm">
          UM
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Usage Monitor</div>
          <div className="text-[10px] text-white/40 font-medium tracking-wide uppercase">Enterprise</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <div className="text-[10px] uppercase tracking-wider text-white/30 font-medium px-3 mb-1">Navigation</div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-mint/15 to-sky/10 text-mint shadow-glow"
                  : "text-white/60 hover:text-white/90 hover:bg-white/[0.04]"
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

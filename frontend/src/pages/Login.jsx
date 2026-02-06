import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 text-white relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-sky/5 rounded-full blur-[100px]" />

      <div className="card w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint to-sky flex items-center justify-center text-ink font-bold text-lg mx-auto mb-3">
            UM
          </div>
          <h1 className="text-xl font-semibold">Welcome back</h1>
          <p className="text-xs text-white/40 mt-1">Sign in to your admin dashboard</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50">Email</label>
            <input
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08] focus:border-mint/40 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-all placeholder:text-white/20"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-white/50">Password</label>
            <input
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08] focus:border-mint/40 focus:outline-none focus:ring-1 focus:ring-mint/20 transition-all placeholder:text-white/20"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-coral bg-coral/10 border border-coral/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-mint to-emerald-400 text-ink hover:shadow-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading && <div className="spinner" style={{ borderTopColor: "#0b1120" }} />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Quick fill buttons */}
        <div className="mt-5 pt-4 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-wider text-white/30 font-medium mb-2.5">Quick demo access</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("admin@example.com", "password")}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="text-white/80">Admin</div>
              <div className="text-white/30 text-[10px] mt-0.5">admin@example.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo("demo@example.com", "demo123")}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all text-left"
            >
              <div className="text-white/80">Demo User</div>
              <div className="text-white/30 text-[10px] mt-0.5">demo@example.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

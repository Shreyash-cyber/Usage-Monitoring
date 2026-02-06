import { useEffect, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics.js";

export default function Users() {
  const { fetchUserActivity } = useAnalytics();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity(30)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchUserActivity]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-xs text-white/40 mt-0.5">Activity breakdown for the last 30 days</p>
        </div>
        <span className="text-xs font-medium bg-sky/15 text-sky px-2.5 py-1 rounded-full">
          {users.length} users
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm data-table">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Events</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Avg Session</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-t border-white/[0.03]">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet/30 to-sky/30 flex items-center justify-center text-xs font-semibold uppercase">
                          {u.email?.[0] ?? "#"}
                        </div>
                        <span className="font-medium">#{u.user_id}</span>
                      </div>
                    </td>
                    <td className="py-3 text-white/70">{u.email ?? "—"}</td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-mint/15 text-mint">
                        {u.event_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-white/70">{u.avg_session_duration.toFixed(1)}s</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <div className="text-sm text-white/50">No user activity found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

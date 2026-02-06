import { useEffect, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const COLORS = ["#4ade80", "#38bdf8", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#2dd4bf", "#e879f9"];

export default function Features() {
  const { fetchFeatureUsage } = useAnalytics();
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureUsage()
      .then(setFeatures)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchFeatureUsage]);

  const chartData = features.map((f) => ({
    name: f.feature_name || `Feature ${f.feature_id}`,
    events: f.event_count,
    dau: f.daily_active_users,
    avg_session: f.avg_session_duration,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Features</h2>
          <p className="text-xs text-white/40 mt-0.5">Detailed feature-level usage analytics</p>
        </div>
        <span className="text-xs font-medium bg-mint/15 text-mint px-2.5 py-1 rounded-full">
          {features.length} features
        </span>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Feature Events Overview</div>
            <div className="text-xs text-white/40 mt-0.5">Total events per tracked feature</div>
          </div>
        </div>
        {loading ? (
          <div className="skeleton h-72 w-full" />
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="events" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <div className="text-sm font-semibold mb-4">Feature Details</div>
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
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Feature</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Events</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">DAU</th>
                  <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Avg Session</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, idx) => (
                  <tr key={f.feature_id} className="border-t border-white/[0.03]">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium">{f.feature_name ?? `Feature ${f.feature_id}`}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-white/5">
                        {f.event_count.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 text-white/70">{f.daily_active_users}</td>
                    <td className="py-3 text-white/70">{f.avg_session_duration.toFixed(1)}s</td>
                  </tr>
                ))}
                {features.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="text-sm text-white/50">No features found</div>
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

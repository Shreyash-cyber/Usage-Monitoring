import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function MetricsComparison({ data = [], loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="text-sm font-semibold mb-4">Feature Metrics Comparison</div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📉</span>
        <div>
          <div className="text-sm font-semibold">Feature Metrics Comparison</div>
          <div className="text-xs text-white/40 mt-0.5">Events, Avg Session (s), and DAU side-by-side</div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8 text-sm text-white/40">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="feature_name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
            <Bar dataKey="event_count" name="Events" fill="#4ade80" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_session_duration" name="Avg Session (s)" fill="#38bdf8" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
            <Bar dataKey="daily_active_users" name="DAU" fill="#a78bfa" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

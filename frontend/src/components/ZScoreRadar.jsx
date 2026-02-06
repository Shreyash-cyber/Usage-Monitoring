import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#4ade80", "#38bdf8", "#a78bfa", "#f59e0b", "#f87171", "#ec4899", "#14b8a6", "#f97316"];

export default function ZScoreRadar({ data = [], loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="text-sm font-semibold mb-4">Z-Score Radar</div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const radarData = data.map((d) => ({
    feature: d.feature_name,
    "Event Count Z": Math.abs(d.z_event_count),
    "Session Z": Math.abs(d.z_avg_session),
    "DAU Z": Math.abs(d.z_dau),
  }));

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🎯</span>
        <div>
          <div className="text-sm font-semibold">Z-Score Radar</div>
          <div className="text-xs text-white/40 mt-0.5">Multi-dimensional anomaly profile per feature</div>
        </div>
      </div>
      {radarData.length === 0 ? (
        <div className="text-center py-8 text-sm text-white/40">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.06)" />
            <PolarAngleAxis dataKey="feature" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
            <Radar name="Event Count Z" dataKey="Event Count Z" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} />
            <Radar name="Session Z" dataKey="Session Z" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
            <Radar name="DAU Z" dataKey="DAU Z" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }} />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

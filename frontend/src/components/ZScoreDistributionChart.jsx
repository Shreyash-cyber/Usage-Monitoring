import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const BUCKET_COLORS = {
  "0-1": "#4ade80",
  "1-2": "#38bdf8",
  "2-3": "#f59e0b",
  "3-4": "#f97316",
  "4+": "#f87171",
};

export default function ZScoreDistributionChart({ data = [], loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="text-sm font-semibold mb-4">Z-Score Distribution</div>
        <div className="skeleton h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📈</span>
        <div>
          <div className="text-sm font-semibold">Z-Score Distribution</div>
          <div className="text-xs text-white/40 mt-0.5">Histogram of composite Z-scores across features</div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-8 text-sm text-white/40">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="bucket" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v) => [v, "Features"]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={BUCKET_COLORS[entry.bucket] || "#4ade80"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

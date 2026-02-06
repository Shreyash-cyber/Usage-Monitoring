import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

export default function ZScoreBarChart({ data = [], threshold = 0, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="text-sm font-semibold mb-4">Z-Score per Feature</div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.norm_score - a.norm_score);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📊</span>
        <div>
          <div className="text-sm font-semibold">Composite Z-Score per Feature</div>
          <div className="text-xs text-white/40 mt-0.5">
            Red bars exceed the 90th-percentile threshold ({threshold.toFixed(2)})
          </div>
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="text-center py-8 text-sm text-white/40">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sorted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="feature_name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v) => [v.toFixed(3), "Z-Score"]}
            />
            <ReferenceLine y={threshold} stroke="#f87171" strokeDasharray="6 3" label={{ value: "Threshold", fill: "#f87171", fontSize: 11 }} />
            <Bar dataKey="norm_score" radius={[6, 6, 0, 0]}>
              {sorted.map((entry, idx) => (
                <Cell key={idx} fill={entry.is_anomaly ? "#f87171" : "#4ade80"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  ReferenceLine,
} from "recharts";

export default function AnomalyScatter({ data = [], threshold = 0, loading }) {
  if (loading) {
    return (
      <div className="card">
        <div className="text-sm font-semibold mb-4">Anomaly Scatter Plot</div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  const scatterData = data.map((d) => ({
    x: d.z_event_count,
    y: d.z_avg_session,
    z: d.z_dau,
    name: d.feature_name,
    score: d.norm_score,
    anomaly: d.is_anomaly,
  }));

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">🔬</span>
        <div>
          <div className="text-sm font-semibold">Anomaly Scatter Plot</div>
          <div className="text-xs text-white/40 mt-0.5">Event Z vs Session Z — bubble size = DAU Z</div>
        </div>
      </div>
      {scatterData.length === 0 ? (
        <div className="text-center py-8 text-sm text-white/40">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Event Z"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              label={{ value: "Event Count Z", position: "insideBottom", fill: "rgba(255,255,255,0.4)", fontSize: 11, offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Session Z"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              label={{ value: "Session Z", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            />
            <ZAxis type="number" dataKey="z" range={[60, 400]} name="DAU Z" />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v, name) => [typeof v === "number" ? v.toFixed(3) : v, name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
            />
            <Scatter data={scatterData}>
              {scatterData.map((entry, idx) => (
                <Cell key={idx} fill={entry.anomaly ? "#f87171" : "#4ade80"} fillOpacity={0.8} stroke={entry.anomaly ? "#f87171" : "#4ade80"} strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

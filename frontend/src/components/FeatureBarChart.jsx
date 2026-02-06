import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";

const COLORS = ["#4ade80", "#38bdf8", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#2dd4bf", "#e879f9"];

export default function FeatureBarChart({ data }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Feature Usage</div>
          <div className="text-xs text-white/40 mt-0.5">Events per feature</div>
        </div>
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" stroke="#475569" tick={{ fontSize: 10, fill: "#64748b" }} interval={0} angle={-20} textAnchor="end" height={70} />
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
            <Bar dataKey="event_count" radius={[6, 6, 0, 0]}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

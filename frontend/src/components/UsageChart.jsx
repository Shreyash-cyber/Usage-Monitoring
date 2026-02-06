import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function UsageChart({ data }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Usage Trend</div>
          <div className="text-xs text-white/40 mt-0.5">Events by feature</div>
        </div>
        <div className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded-md">{data.length} features</div>
      </div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientMint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} />
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
            <Area type="monotone" dataKey="events" stroke="#4ade80" strokeWidth={2.5} fill="url(#gradientMint)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

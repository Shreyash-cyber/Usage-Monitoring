export default function AnomalyTable({ items, loading }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Anomaly Detection</div>
          <div className="text-xs text-white/40 mt-0.5">Z-score outliers above 90th percentile</div>
        </div>
        {items.length > 0 && (
          <span className="text-xs font-medium bg-coral/15 text-coral px-2.5 py-1 rounded-full">
            {items.length} detected
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-sm text-white/50">No anomalies detected</div>
          <div className="text-xs text-white/30 mt-1">All metrics within normal range</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm data-table">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Feature</th>
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Events</th>
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Avg Session</th>
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">DAU</th>
                <th className="text-left py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx} className="border-t border-white/[0.03]">
                  <td className="py-3 font-medium">{row.feature_name || row.feature_id}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                      row.score > 4 ? "bg-coral/15 text-coral" : row.score > 2.5 ? "bg-amber/15 text-amber" : "bg-yellow-500/15 text-yellow-400"
                    }`}>
                      {row.score.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 text-white/70">{row.details?.event_count?.toLocaleString() ?? "—"}</td>
                  <td className="py-3 text-white/70">{row.details?.avg_session_duration?.toFixed(1) ?? "—"}s</td>
                  <td className="py-3 text-white/70">{row.details?.daily_active_users ?? "—"}</td>
                  <td className="py-3 text-white/50 text-xs max-w-[200px] truncate">{row.details?.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

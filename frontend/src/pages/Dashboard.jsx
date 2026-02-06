import { useEffect, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import UsageChart from "../components/UsageChart.jsx";
import FeatureBarChart from "../components/FeatureBarChart.jsx";

const statConfig = [
  { key: "total_events", label: "Total Events", icon: "📈", format: (v) => v.toLocaleString() },
  { key: "active_users", label: "Active Users", icon: "👥", format: (v) => v },
  { key: "features_tracked", label: "Features Tracked", icon: "⚡", format: (v) => v },
];

export default function Dashboard() {
  const { fetchSummary, fetchFeatureUsage } = useAnalytics();
  const [summary, setSummary] = useState({ total_events: 0, active_users: 0, features_tracked: 0 });
  const [featureUsage, setFeatureUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchSummary().then(setSummary),
      fetchFeatureUsage().then(setFeatureUsage),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchSummary, fetchFeatureUsage]);

  const chartData = featureUsage.map((f) => ({
    label: f.feature_name || `Feature ${f.feature_id}`,
    events: f.event_count,
  }));
  const featureBars = featureUsage.map((f) => ({
    label: f.feature_name || `F${f.feature_id}`,
    event_count: f.event_count,
    avg_session: f.avg_session_duration,
  }));

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-xs text-white/40 mt-0.5">Overview of your organization's usage metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statConfig.map((stat) => (
          <div key={stat.key} className="stat-card">
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-8 w-28" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-xs text-white/50 font-medium mb-2">
                  <span>{stat.icon}</span>
                  {stat.label}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  {stat.format(summary[stat.key])}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
          <>
            <div className="card"><div className="skeleton h-64 w-full" /></div>
            <div className="card"><div className="skeleton h-64 w-full" /></div>
          </>
        ) : (
          <>
            <UsageChart data={chartData} />
            <FeatureBarChart data={featureBars} />
          </>
        )}
      </div>
    </div>
  );
}

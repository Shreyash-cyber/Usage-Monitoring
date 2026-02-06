import { useEffect, useState } from "react";
import { useAnalytics } from "../hooks/useAnalytics.js";
import AnomalyTable from "../components/AnomalyTable.jsx";
import ZScoreBarChart from "../components/ZScoreBarChart.jsx";
import ZScoreDistributionChart from "../components/ZScoreDistributionChart.jsx";
import ZScoreRadar from "../components/ZScoreRadar.jsx";
import AnomalyScatter from "../components/AnomalyScatter.jsx";
import MetricsComparison from "../components/MetricsComparison.jsx";

export default function AIInsights() {
  const { fetchAnomalies, fetchInsights, fetchChartData } = useAnalytics();
  const [anomalies, setAnomalies] = useState([]);
  const [insights, setInsights] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingAnomalies, setLoadingAnomalies] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    fetchAnomalies()
      .then(setAnomalies)
      .catch(console.error)
      .finally(() => setLoadingAnomalies(false));
    fetchInsights()
      .then((res) => setInsights(res.insights || []))
      .catch(console.error)
      .finally(() => setLoadingInsights(false));
    fetchChartData()
      .then(setChartData)
      .catch(console.error)
      .finally(() => setLoadingCharts(false));
  }, [fetchAnomalies, fetchInsights, fetchChartData]);

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div>
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Machine-learning anomaly detection &amp; usage intelligence
        </p>
      </div>

      {/* ─── Stat Cards Row ─── */}
      {!loadingCharts && chartData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Anomaly Threshold"
            value={chartData.threshold.toFixed(2)}
            sub="90th pctl Z-score"
            color="coral"
          />
          <StatCard
            label="Avg Event Count"
            value={chartData.mean_event_count.toLocaleString()}
            sub={`σ = ${chartData.std_event_count.toFixed(1)}`}
            color="mint"
          />
          <StatCard
            label="Avg Session"
            value={`${chartData.mean_session.toFixed(1)}s`}
            sub={`σ = ${chartData.std_session.toFixed(1)}s`}
            color="sky"
          />
          <StatCard
            label="Avg DAU"
            value={chartData.mean_dau.toFixed(0)}
            sub={`σ = ${chartData.std_dau.toFixed(1)}`}
            color="violet"
          />
        </div>
      )}
      {loadingCharts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card"><div className="skeleton h-16 w-full" /></div>
          ))}
        </div>
      )}

      {/* ─── Z-Score Bar + Distribution Row ─── */}
      <div className="grid md:grid-cols-2 gap-6">
        <ZScoreBarChart
          data={chartData?.feature_z_scores || []}
          threshold={chartData?.threshold || 0}
          loading={loadingCharts}
        />
        <ZScoreDistributionChart
          data={chartData?.z_distribution || []}
          loading={loadingCharts}
        />
      </div>

      {/* ─── Radar + Scatter Row ─── */}
      <div className="grid md:grid-cols-2 gap-6">
        <ZScoreRadar
          data={chartData?.feature_z_scores || []}
          loading={loadingCharts}
        />
        <AnomalyScatter
          data={chartData?.feature_z_scores || []}
          threshold={chartData?.threshold || 0}
          loading={loadingCharts}
        />
      </div>

      {/* ─── Feature Metrics Comparison ─── */}
      <MetricsComparison
        data={chartData?.feature_metrics || []}
        loading={loadingCharts}
      />

      {/* ─── AI Insights Card ─── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🧠</span>
          <div>
            <div className="text-sm font-semibold">Usage Intelligence</div>
            <div className="text-xs text-white/40 mt-0.5">
              AI-generated observations from your data
            </div>
          </div>
          {loadingInsights && <div className="spinner ml-auto" />}
        </div>
        {loadingInsights ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-5 w-full" style={{ width: `${85 - i * 10}%` }} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {insights.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] transition-colors hover:bg-white/[0.04]"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-mint/15 text-mint text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-white/80 leading-relaxed">{item}</p>
              </div>
            ))}
            {insights.length === 0 && (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">💡</div>
                <div className="text-sm text-white/50">No insights yet</div>
                <div className="text-xs text-white/30 mt-1">
                  Generate usage data to unlock insights
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Anomaly Table ─── */}
      <AnomalyTable items={anomalies} loading={loadingAnomalies} />
    </div>
  );
}

/* ─── Stat card mini-component ─── */
const ACCENT = {
  coral: { border: "border-t-coral", text: "text-coral", bg: "bg-coral/10" },
  mint: { border: "border-t-mint", text: "text-mint", bg: "bg-mint/10" },
  sky: { border: "border-t-sky", text: "text-sky", bg: "bg-sky/10" },
  violet: { border: "border-t-violet", text: "text-violet", bg: "bg-violet/10" },
};

function StatCard({ label, value, sub, color = "mint" }) {
  const c = ACCENT[color] || ACCENT.mint;
  return (
    <div className={`stat-card border-t-2 ${c.border}`}>
      <div className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
      <div className="text-xs text-white/30 mt-1">{sub}</div>
    </div>
  );
}

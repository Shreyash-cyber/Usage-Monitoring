import api from "./apiClient.js";

export async function getAnomalies() {
  const res = await api.get("/ai/anomalies");
  return res.data;
}

export async function getInsights() {
  const res = await api.get("/ai/usage-insights");
  return res.data;
}

export async function getChartData() {
  const res = await api.get("/ai/chart-data");
  return res.data;
}

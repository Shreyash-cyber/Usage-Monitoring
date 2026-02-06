import api from "./apiClient.js";

export async function getUsageSummary() {
  const res = await api.get("/analytics/usage-summary");
  return res.data;
}

export async function getFeatureUsage() {
  const res = await api.get("/analytics/feature-usage");
  return res.data;
}

export async function getUserActivity(days = 30) {
  const res = await api.get("/analytics/user-activity", { params: { days } });
  return res.data;
}

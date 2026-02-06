import { useCallback } from "react";
import { getUsageSummary, getFeatureUsage, getUserActivity } from "../services/analyticsService.js";
import { getAnomalies, getInsights, getChartData } from "../services/aiService.js";

export function useAnalytics() {
  const fetchSummary = useCallback(async () => getUsageSummary(), []);
  const fetchFeatureUsage = useCallback(async () => getFeatureUsage(), []);
  const fetchUserActivity = useCallback(async (days = 30) => getUserActivity(days), []);
  const fetchAnomalies = useCallback(async () => getAnomalies(), []);
  const fetchInsights = useCallback(async () => getInsights(), []);
  const fetchChartData = useCallback(async () => getChartData(), []);

  return { fetchSummary, fetchFeatureUsage, fetchUserActivity, fetchAnomalies, fetchInsights, fetchChartData };
}

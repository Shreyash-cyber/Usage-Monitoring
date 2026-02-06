from typing import List, Optional
from pydantic import BaseModel


class UsageSummary(BaseModel):
    total_events: int
    active_users: int
    features_tracked: int


class FeatureUsage(BaseModel):
    feature_id: int
    feature_name: Optional[str] = None
    event_count: int
    daily_active_users: int
    avg_session_duration: float


class UserActivity(BaseModel):
    user_id: int
    email: Optional[str] = None
    event_count: int
    avg_session_duration: float


class AnomalyResponse(BaseModel):
    feature_id: int
    feature_name: Optional[str] = None
    score: float
    details: dict


class InsightResponse(BaseModel):
    insights: List[str]


# ─── Chart data schemas ───────────────────────────────────────────

class FeatureZScore(BaseModel):
    feature_id: int
    feature_name: str
    z_event_count: float
    z_avg_session: float
    z_dau: float
    norm_score: float
    is_anomaly: bool


class ZScoreDistribution(BaseModel):
    bucket: str       # e.g. "0-1", "1-2", "2-3", "3-4", "4+"
    count: int


class FeatureMetricRow(BaseModel):
    feature_id: int
    feature_name: str
    event_count: int
    avg_session_duration: float
    daily_active_users: int


class ChartDataResponse(BaseModel):
    feature_z_scores: List[FeatureZScore]
    z_distribution: List[ZScoreDistribution]
    feature_metrics: List[FeatureMetricRow]
    threshold: float
    mean_event_count: float
    std_event_count: float
    mean_session: float
    std_session: float
    mean_dau: float
    std_dau: float

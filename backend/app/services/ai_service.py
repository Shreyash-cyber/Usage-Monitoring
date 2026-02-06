import logging
import time
from typing import List
import numpy as np
import dask.dataframe as dd
from sqlmodel import Session, select, func
from app.models.aggregated_usage import AggregatedUsage
from app.models.usage_log import UsageLog
from app.models.feature import Feature
from app.schemas.analytics_schema import AnomalyResponse, InsightResponse, ChartDataResponse, FeatureZScore, ZScoreDistribution, FeatureMetricRow
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Simple in-memory cache: {org_id: (timestamp, result)}
_anomaly_cache: dict[int, tuple[float, list]] = {}
_insight_cache: dict[int, tuple[float, InsightResponse]] = {}
_CACHE_TTL = 120  # seconds


def _feature_name_map(session: Session, organization_id: int) -> dict[int, str]:
    feats = session.exec(select(Feature).where(Feature.organization_id == organization_id)).all()
    return {f.id: f.name for f in feats}


def _load_gemini_client():
    try:
        import google.generativeai as genai
    except ImportError:
        logger.warning("Gemini client not installed; insights will be heuristic")
        return None
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY not configured; insights will be heuristic")
        return None
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


def _load_rows(session: Session, organization_id: int):
    """Return (feature_id, event_count, avg_session_duration, dau) tuples, preferring aggregated data."""
    rows = session.exec(
        select(
            AggregatedUsage.feature_id,
            AggregatedUsage.event_count,
            AggregatedUsage.avg_session_duration,
            AggregatedUsage.daily_active_users,
        ).where(AggregatedUsage.organization_id == organization_id)
    ).all()
    if rows:
        return rows

    # Fallback: compute from raw UsageLog
    raw = session.exec(
        select(
            UsageLog.feature_id,
            func.count(UsageLog.id),
            func.avg(UsageLog.session_duration),
            func.count(func.distinct(UsageLog.user_id)),
        ).where(UsageLog.organization_id == organization_id).group_by(UsageLog.feature_id)
    ).all()
    return raw


def _prepare_dd(rows):
    """Build Dask DataFrame from aggregated usage rows for scalable math."""
    feature_ids = [r[0] for r in rows]
    metrics = np.array([[r[1], r[2], r[3]] for r in rows], dtype=float)
    dd_metrics = dd.from_array(metrics, columns=["event_count", "avg_session_duration", "daily_active_users"])
    return feature_ids, metrics, dd_metrics


def detect_anomalies(session: Session, organization_id: int) -> List[AnomalyResponse]:
    cached = _anomaly_cache.get(organization_id)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    rows = _load_rows(session, organization_id)
    if not rows:
        return []

    fname_map = _feature_name_map(session, organization_id)
    feature_ids, metrics, dd_metrics = _prepare_dd(rows)

    means = dd_metrics.mean().compute()
    stds = dd_metrics.std().replace(0, 1e-6).compute()
    z = (metrics - means.values) / (stds.values + 1e-6)
    norm_scores = np.linalg.norm(z, axis=1)
    threshold = float(np.percentile(norm_scores, 90))

    results: List[AnomalyResponse] = []
    for (fid, ev, avg, dau), score in zip(zip(feature_ids, metrics[:, 0], metrics[:, 1], metrics[:, 2]), norm_scores):
        if score >= threshold:
            results.append(AnomalyResponse(
                feature_id=int(fid),
                feature_name=fname_map.get(int(fid)),
                score=round(float(score), 3),
                details={
                    "event_count": int(ev),
                    "avg_session_duration": round(float(avg), 2),
                    "daily_active_users": int(dau),
                    "reason": f"Z-score {float(score):.2f} exceeds 90th-pctl threshold {threshold:.2f}",
                },
            ))

    _anomaly_cache[organization_id] = (time.time(), results)
    return results


def generate_insights(session: Session, organization_id: int) -> InsightResponse:
    cached = _insight_cache.get(organization_id)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    rows = _load_rows(session, organization_id)
    if not rows:
        return InsightResponse(insights=["No data yet; ingest events to see insights."])

    fname_map = _feature_name_map(session, organization_id)
    feature_ids, metrics, dd_metrics = _prepare_dd(rows)
    dd_features = dd.concat(
        [dd.from_array(np.array(feature_ids), columns=["feature_id"]), dd_metrics], axis=1
    )
    top_df = dd_features.nlargest(3, "event_count").compute()
    bullet_seed = [
        f"{fname_map.get(int(row.feature_id), f'Feature {int(row.feature_id)}')} is trending with {int(row.event_count)} events and avg session {row.avg_session_duration:.1f}s"
        for _, row in top_df.iterrows()
    ]
    if not bullet_seed:
        bullet_seed.append("No dominant feature yet; usage evenly distributed.")

    client = _load_gemini_client()
    if not client:
        insights = [b for b in bullet_seed if b]
        insights.append("Configure GEMINI_API_KEY to enable LLM-based narrative insights.")
        result = InsightResponse(insights=insights)
        _insight_cache[organization_id] = (time.time(), result)
        return result

    prompt = "\n".join(
        ["You are an analytics assistant. Provide 3 concise business insights from usage metrics."]
        + [
            f"{fname_map.get(fid, f'Feature {fid}')}: events={int(ev)}, avg_session={avg:.2f}, dau={int(dau)}"
            for fid, ev, avg, dau in zip(feature_ids, metrics[:, 0], metrics[:, 1], metrics[:, 2])
        ]
    )
    try:
        response = client.generate_content(prompt)
        text = response.text if hasattr(response, "text") else str(response)
        lines = [line.strip("- ") for line in text.split("\n") if line.strip()]
        insights = lines[:5] or bullet_seed
        result = InsightResponse(insights=insights)
        _insight_cache[organization_id] = (time.time(), result)
        return result
    except Exception as exc:  # pragma: no cover - safety net
        logger.warning("Gemini call failed: %s", exc)
        insights = [b for b in bullet_seed if b]
        insights.append("Gemini call failed; using heuristic insights.")
        result = InsightResponse(insights=insights)
        _insight_cache[organization_id] = (time.time(), result)
        return result


# ─── Chart-data endpoint logic ────────────────────────────────────

_chart_cache: dict[int, tuple[float, ChartDataResponse]] = {}


def get_chart_data(session: Session, organization_id: int) -> ChartDataResponse:
    cached = _chart_cache.get(organization_id)
    if cached and (time.time() - cached[0]) < _CACHE_TTL:
        return cached[1]

    rows = _load_rows(session, organization_id)
    if not rows:
        return ChartDataResponse(
            feature_z_scores=[], z_distribution=[], feature_metrics=[],
            threshold=0, mean_event_count=0, std_event_count=0,
            mean_session=0, std_session=0, mean_dau=0, std_dau=0,
        )

    fname_map = _feature_name_map(session, organization_id)
    feature_ids, metrics, dd_metrics = _prepare_dd(rows)

    means = dd_metrics.mean().compute()
    stds = dd_metrics.std().replace(0, 1e-6).compute()
    z = (metrics - means.values) / (stds.values + 1e-6)
    norm_scores = np.linalg.norm(z, axis=1)
    threshold = float(np.percentile(norm_scores, 90))

    # Per-feature Z-scores
    feature_z_scores = []
    for i, fid in enumerate(feature_ids):
        feature_z_scores.append(FeatureZScore(
            feature_id=int(fid),
            feature_name=fname_map.get(int(fid), f"Feature {fid}"),
            z_event_count=round(float(z[i, 0]), 3),
            z_avg_session=round(float(z[i, 1]), 3),
            z_dau=round(float(z[i, 2]), 3),
            norm_score=round(float(norm_scores[i]), 3),
            is_anomaly=bool(norm_scores[i] >= threshold),
        ))

    # Z-score distribution histogram
    buckets = {"0-1": 0, "1-2": 0, "2-3": 0, "3-4": 0, "4+": 0}
    for s in norm_scores:
        if s < 1:
            buckets["0-1"] += 1
        elif s < 2:
            buckets["1-2"] += 1
        elif s < 3:
            buckets["2-3"] += 1
        elif s < 4:
            buckets["3-4"] += 1
        else:
            buckets["4+"] += 1
    z_distribution = [ZScoreDistribution(bucket=k, count=v) for k, v in buckets.items()]

    # Feature raw metrics
    feature_metrics = []
    for i, fid in enumerate(feature_ids):
        feature_metrics.append(FeatureMetricRow(
            feature_id=int(fid),
            feature_name=fname_map.get(int(fid), f"Feature {fid}"),
            event_count=int(metrics[i, 0]),
            avg_session_duration=round(float(metrics[i, 1]), 2),
            daily_active_users=int(metrics[i, 2]),
        ))

    result = ChartDataResponse(
        feature_z_scores=feature_z_scores,
        z_distribution=z_distribution,
        feature_metrics=feature_metrics,
        threshold=round(threshold, 3),
        mean_event_count=round(float(means["event_count"]), 2),
        std_event_count=round(float(stds["event_count"]), 2),
        mean_session=round(float(means["avg_session_duration"]), 2),
        std_session=round(float(stds["avg_session_duration"]), 2),
        mean_dau=round(float(means["daily_active_users"]), 2),
        std_dau=round(float(stds["daily_active_users"]), 2),
    )
    _chart_cache[organization_id] = (time.time(), result)
    return result

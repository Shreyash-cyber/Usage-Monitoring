from datetime import date, timedelta
from sqlmodel import Session, select, func
from app.models.usage_log import UsageLog
from app.models.aggregated_usage import AggregatedUsage
from app.models.feature import Feature
from app.models.user import User
from app.schemas.analytics_schema import UsageSummary, FeatureUsage, UserActivity


def _feature_name_map(session: Session, organization_id: int) -> dict[int, str]:
    feats = session.exec(select(Feature).where(Feature.organization_id == organization_id)).all()
    return {f.id: f.name for f in feats}


def get_usage_summary(session: Session, organization_id: int) -> UsageSummary:
    total_events = session.exec(select(func.count(UsageLog.id)).where(UsageLog.organization_id == organization_id)).one()
    active_users = session.exec(
        select(func.count(func.distinct(UsageLog.user_id))).where(UsageLog.organization_id == organization_id)
    ).one()
    features_tracked = session.exec(
        select(func.count(func.distinct(UsageLog.feature_id))).where(UsageLog.organization_id == organization_id)
    ).one()
    return UsageSummary(total_events=total_events or 0, active_users=active_users or 0, features_tracked=features_tracked or 0)


def get_feature_usage(session: Session, organization_id: int) -> list[FeatureUsage]:
    fname_map = _feature_name_map(session, organization_id)

    # Try aggregated table first
    rows = session.exec(
        select(
            AggregatedUsage.feature_id,
            func.sum(AggregatedUsage.event_count),
            func.avg(AggregatedUsage.daily_active_users),
            func.avg(AggregatedUsage.avg_session_duration),
        ).where(AggregatedUsage.organization_id == organization_id).group_by(AggregatedUsage.feature_id)
    ).all()

    # Fallback to UsageLog if aggregated is empty
    if not rows:
        rows = session.exec(
            select(
                UsageLog.feature_id,
                func.count(UsageLog.id),
                func.count(func.distinct(UsageLog.user_id)),
                func.avg(UsageLog.session_duration),
            ).where(UsageLog.organization_id == organization_id).group_by(UsageLog.feature_id)
        ).all()

    return [
        FeatureUsage(
            feature_id=r[0],
            feature_name=fname_map.get(r[0]),
            event_count=int(r[1] or 0),
            daily_active_users=int(r[2] or 0),
            avg_session_duration=round(float(r[3] or 0), 2),
        )
        for r in rows
    ]


def get_user_activity(session: Session, organization_id: int, days: int = 30) -> list[UserActivity]:
    start = date.today() - timedelta(days=days)
    rows = session.exec(
        select(
            UsageLog.user_id,
            func.count(UsageLog.id),
            func.avg(UsageLog.session_duration),
        )
        .where(UsageLog.organization_id == organization_id)
        .where(UsageLog.timestamp >= start)
        .group_by(UsageLog.user_id)
    ).all()

    # Resolve emails
    user_ids = [r[0] for r in rows if r[0]]
    email_map: dict[int, str] = {}
    if user_ids:
        users = session.exec(select(User).where(User.id.in_(user_ids))).all()  # type: ignore
        email_map = {u.id: u.email for u in users}

    return [
        UserActivity(
            user_id=r[0],
            email=email_map.get(r[0]),
            event_count=int(r[1] or 0),
            avg_session_duration=round(float(r[2] or 0), 2),
        )
        for r in rows
        if r[0] is not None
    ]

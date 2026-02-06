from collections import defaultdict
from datetime import date
from sqlmodel import Session, select
from app.models.usage_log import UsageLog
from app.models.aggregated_usage import AggregatedUsage


def aggregate_daily(session: Session, target_date: date | None = None) -> int:
    target = target_date or date.today()
    start_ts = date.fromordinal(target.toordinal())
    end_ts = date.fromordinal(target.toordinal() + 1)

    query = select(UsageLog).where(UsageLog.timestamp >= start_ts).where(UsageLog.timestamp < end_ts)
    rows = session.exec(query).all()

    bucket: dict[tuple[int, int], list[UsageLog]] = defaultdict(list)
    for row in rows:
        bucket[(row.organization_id, row.feature_id)].append(row)

    written = 0
    for (org_id, feature_id), events in bucket.items():
        daus = len({e.user_id for e in events if e.user_id})
        event_count = len(events)
        avg_duration = sum(e.session_duration for e in events) / max(event_count, 1)

        existing = session.exec(
            select(AggregatedUsage)
            .where(AggregatedUsage.organization_id == org_id)
            .where(AggregatedUsage.feature_id == feature_id)
            .where(AggregatedUsage.aggregation_date == target)
        ).first()

        if existing:
            existing.daily_active_users = daus
            existing.event_count = event_count
            existing.avg_session_duration = avg_duration
            record = existing
        else:
            record = AggregatedUsage(
                organization_id=org_id,
                feature_id=feature_id,
                aggregation_date=target,
                daily_active_users=daus,
                event_count=event_count,
                avg_session_duration=avg_duration,
            )
            session.add(record)
        written += 1

    session.commit()
    return written

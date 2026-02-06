from datetime import datetime
from fastapi import HTTPException, status
from sqlmodel import Session
from app.models.usage_log import UsageLog
from app.models.feature import Feature
from app.schemas.usage_schema import UsageEventCreate


def track_event(data: UsageEventCreate, session: Session) -> UsageLog:
    feature = session.get(Feature, data.feature_id)
    if not feature or feature.organization_id != data.organization_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid feature or organization")
    usage = UsageLog(
        user_id=data.user_id,
        organization_id=data.organization_id,
        feature_id=data.feature_id,
        event_type=data.event_type,
        session_duration=data.session_duration,
        metadata_json=data.metadata,
        timestamp=datetime.utcnow(),
    )
    session.add(usage)
    session.commit()
    session.refresh(usage)
    return usage

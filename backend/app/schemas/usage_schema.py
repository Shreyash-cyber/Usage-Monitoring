from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from pydantic import ConfigDict


class UsageEventCreate(BaseModel):
    user_id: Optional[int] = None
    organization_id: int
    feature_id: int
    event_type: str = "interaction"
    session_duration: float = 0.0
    metadata: dict | None = None


class UsageEventRead(BaseModel):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AggregatedUsageRead(BaseModel):
    organization_id: int
    feature_id: int
    aggregation_date: date
    daily_active_users: int
    event_count: int
    avg_session_duration: float

    model_config = ConfigDict(from_attributes=True)

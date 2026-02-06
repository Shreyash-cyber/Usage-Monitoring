from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field


class AggregatedUsage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    organization_id: int = Field(foreign_key="organization.id", index=True)
    feature_id: int = Field(foreign_key="feature.id", index=True)
    aggregation_date: date = Field(index=True)
    daily_active_users: int = Field(default=0)
    event_count: int = Field(default=0)
    avg_session_duration: float = Field(default=0.0)

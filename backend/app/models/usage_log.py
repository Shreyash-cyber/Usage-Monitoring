from datetime import datetime
from typing import Optional
from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field, Relationship


class UsageLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    organization_id: int = Field(foreign_key="organization.id")
    feature_id: int = Field(foreign_key="feature.id")
    event_type: str = Field(default="interaction")
    session_duration: float = Field(default=0)
    # Explicit JSON column; renamed to avoid Declarative "metadata" conflict
    metadata_json: dict | None = Field(default=None, sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    feature: "Feature" = Relationship(back_populates="usage_logs")

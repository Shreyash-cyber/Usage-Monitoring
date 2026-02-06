from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Feature(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    organization_id: int = Field(foreign_key="organization.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    organization: "Organization" = Relationship(back_populates="features")
    usage_logs: list["UsageLog"] = Relationship(back_populates="feature")

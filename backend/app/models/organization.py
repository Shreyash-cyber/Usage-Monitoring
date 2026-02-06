from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Organization(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    plan_type: str = Field(default="standard")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    users: list["User"] = Relationship(back_populates="organization")
    features: list["Feature"] = Relationship(back_populates="organization")

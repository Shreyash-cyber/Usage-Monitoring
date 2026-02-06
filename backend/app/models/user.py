from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str = Field(default="user")  # roles: admin, user
    organization_id: int = Field(foreign_key="organization.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    organization: "Organization" = Relationship(back_populates="users")

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from pydantic import ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    organization_id: int
    role: str = "user"


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    organization_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: Optional[str] = None
    org: Optional[int] = None
    role: Optional[str] = None

from datetime import datetime, timedelta
from typing import Any, Dict
import jwt
from fastapi import HTTPException, status
from app.config import get_settings

settings = get_settings()


def create_access_token(subject: str, org_id: int, role: str, expires_minutes: int | None = None) -> str:
    expires_delta = expires_minutes or settings.access_token_expire_minutes
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    payload: Dict[str, Any] = {"sub": subject, "org": org_id, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

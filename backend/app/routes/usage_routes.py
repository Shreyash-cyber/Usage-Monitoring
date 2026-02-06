from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.usage_schema import UsageEventCreate, UsageEventRead
from app.services import auth_service, usage_service

router = APIRouter(prefix="/events", tags=["usage"])


@router.post("/track", response_model=UsageEventRead)
def track(event: UsageEventCreate, session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    if current_user.organization_id != event.organization_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cross-tenant write not allowed")
    usage = usage_service.track_event(event, session)
    return UsageEventRead(id=usage.id, timestamp=usage.timestamp)

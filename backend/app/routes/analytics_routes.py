from datetime import date
from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.analytics_schema import UsageSummary, FeatureUsage, UserActivity
from app.services import auth_service, analytics_service, aggregation_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/usage-summary", response_model=UsageSummary)
def usage_summary(session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return analytics_service.get_usage_summary(session, current_user.organization_id)


@router.get("/feature-usage", response_model=list[FeatureUsage])
def feature_usage(session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return analytics_service.get_feature_usage(session, current_user.organization_id)


@router.get("/user-activity", response_model=list[UserActivity])
def user_activity(days: int = 30, session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return analytics_service.get_user_activity(session, current_user.organization_id, days)


@router.post("/aggregate/run")
def aggregate(target: date | None = None, session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    if current_user.role != "admin":
        return {"message": "Only admins can trigger aggregation"}
    count = aggregation_service.aggregate_daily(session, target)
    return {"aggregated": count}

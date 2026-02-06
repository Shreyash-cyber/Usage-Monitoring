from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.analytics_schema import AnomalyResponse, InsightResponse, ChartDataResponse
from app.services import auth_service, ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/anomalies", response_model=list[AnomalyResponse])
def anomalies(session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return ai_service.detect_anomalies(session, current_user.organization_id)


@router.get("/usage-insights", response_model=InsightResponse)
def insights(session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return ai_service.generate_insights(session, current_user.organization_id)


@router.get("/chart-data", response_model=ChartDataResponse)
def chart_data(session: Session = Depends(get_session), current_user=Depends(auth_service.get_current_user)):
    return ai_service.get_chart_data(session, current_user.organization_id)

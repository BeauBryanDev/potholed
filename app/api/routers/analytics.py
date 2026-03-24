from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Any

from app.api.dependencies import get_db, get_current_active_user
from app.services.analytics_services import AnalyticsService
from app.models.user import User


router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get(
    "/dashboard", 
    status_code=status.HTTP_200_OK,
    summary="get metrics from potholes"     
)
async def get_dashboard_metrics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)]
    ):

    """
    get metrics from potholes for dashboard
    """
    overview = AnalyticsService.get_general_overview(db)
    top_streets = AnalyticsService.get_top_affected_streets(db, limit=5)
    towns_dist = AnalyticsService.get_towns_distribution(db)
    severity_dist = AnalyticsService.get_severity_distribution(db)

    return {
        "overview": overview,
        "charts": {
            "top_streets": top_streets,
            "towns_distribution": towns_dist,
            "severity_distribution": severity_dist
        }
    }
    
    
@router.get("/dashboard/", response_model=dict[str, Any])

def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Consolidado general para la vista principal del Dashboard.
    """
    return {
        "overview": AnalyticsService.get_general_overview(db),
        "recent_activity": AnalyticsService.get_recent_detections(db, limit=5),
        "severity": AnalyticsService.get_severity_distribution(db)
    }

@router.get("/top-affected-streets", response_model=list[dict[str, Any]])
def get_critical_streets(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Ranking de las calles con mayor conteo de baches (incluyendo su ciudad).
    """
    return AnalyticsService.get_top_affected_streets(db, limit=limit)

@router.get("/towns-distribution", response_model=list[dict[str, Any]])
def get_towns_impact(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Distribución de baches por municipio/ciudad.
    """
    return AnalyticsService.get_towns_distribution(db)

@router.get("/model-performance", response_model=list[dict[str, Any]])
def get_ai_performance(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Estadísticas de precisión y velocidad por versión del modelo (YOLOv8 ONNX).
    """
    return AnalyticsService.get_model_performance(db)

@router.get("/user-activity", response_model=list[dict[str, Any]])
def get_user_activity(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Estadísticas de actividad de usuarios.
    """
    return AnalyticsService.get_user_activity(db)   


@router.get("/last-activity", response_model=dict[str, Any])
def get_recent_activity_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Estadísticas específicas de la última semana de detecciones.
    """
    return AnalyticsService.get_last_week_potholes(db)


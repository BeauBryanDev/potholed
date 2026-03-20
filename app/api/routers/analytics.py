from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

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
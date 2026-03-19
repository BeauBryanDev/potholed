from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.schemas.street import StreetCreate, StreetUpdate, StreetResponse
from app.services import street_service, town_service


router = APIRouter(
    prefix="/streets",
    tags=["streets"]
)


@router.get("/", response_model=list[StreetResponse])
def list_streets(
    skip: int = 0,
    limit: int = 100,
    town_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    return street_service.get_streets(db, skip=skip, limit=limit, town_id=town_id)


@router.post("/", response_model=StreetResponse, status_code=status.HTTP_201_CREATED)
def create_street(
    street: StreetCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    # Check if town exists
    db_town = town_service.get_town(db, town_id=street.town_id)
    if not db_town:
        raise HTTPException(status_code=404, detail="Associated town not found")
    return street_service.create_street(db, street_data=street.model_dump())


@router.get("/{street_id}", response_model=StreetResponse)
def get_street(
    street_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_street = street_service.get_street(db, street_id=street_id)
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    return db_street


@router.put("/{street_id}", response_model=StreetResponse)
def update_street(
    street_id: int,
    street: StreetUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    db_street = street_service.update_street(db, street_id=street_id, street_data=street.model_dump(exclude_unset=True))
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    return db_street


@router.delete("/{street_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_street(
    street_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    success = street_service.delete_street(db, street_id=street_id)
    if not success:
        raise HTTPException(status_code=404, detail="Street not found")
    return None

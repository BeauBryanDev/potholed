from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.schemas.town import TownCreate, TownUpdate, TownResponse
from app.services import town_service


router = APIRouter(
    prefix="/towns",
    tags=["towns"]
)


@router.get("/", response_model=list[TownResponse])
def list_towns(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    return town_service.get_towns(db, skip=skip, limit=limit)


@router.post("/", response_model=TownResponse, status_code=status.HTTP_201_CREATED)
def create_town(
    town: TownCreate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    db_town = town_service.get_town_by_name(db, name=town.name)
    if db_town:
        raise HTTPException(status_code=400, detail="Town already registered")
    return town_service.create_town(db, town_data=town.model_dump())


@router.get("/{town_id}", response_model=TownResponse)
def get_town(
    town_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_town = town_service.get_town(db, town_id=town_id)
    if db_town is None:
        raise HTTPException(status_code=404, detail="Town not found")
    return db_town


@router.put("/{town_id}", response_model=TownResponse)
def update_town(
    town_id: int,
    town: TownUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    db_town = town_service.update_town(db, town_id=town_id, town_data=town.model_dump(exclude_unset=True))
    if db_town is None:
        raise HTTPException(status_code=404, detail="Town not found")
    return db_town


@router.delete("/{town_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_town(
    town_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    success = town_service.delete_town(db, town_id=town_id)
    if not success:
        raise HTTPException(status_code=404, detail="Town not found")
    return None

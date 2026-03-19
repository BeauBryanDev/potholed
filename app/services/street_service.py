from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.street import Street


def get_street(db: Session, street_id: int) -> Optional[Street]:
    return db.execute(select(Street).where(Street.id == street_id)).scalars().first()


def get_streets(db: Session, skip: int = 0, limit: int = 100, town_id: Optional[int] = None) -> List[Street]:
    query = select(Street).offset(skip).limit(limit)
    if town_id:
        query = query.where(Street.town_id == town_id)
    return db.execute(query).scalars().all()


def create_street(db: Session, street_data: Dict[str, Any]) -> Street:
    db_street = Street(**street_data)
    db.add(db_street)
    db.commit()
    db.refresh(db_street)
    return db_street


def update_street(db: Session, street_id: int, street_data: Dict[str, Any]) -> Optional[Street]:
    db_street = get_street(db, street_id)
    if not db_street:
        return None
    for key, value in street_data.items():
        setattr(db_street, key, value)
    db.commit()
    db.refresh(db_street)
    return db_street


def delete_street(db: Session, street_id: int) -> bool:
    db_street = get_street(db, street_id)
    if not db_street:
        return False
    db.delete(db_street)
    db.commit()
    return True

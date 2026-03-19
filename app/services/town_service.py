from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.town import Town


def get_town(db: Session, town_id: int) -> Optional[Town]:
    return db.execute(select(Town).where(Town.id == town_id)).scalars().first()


def get_town_by_name(db: Session, name: str) -> Optional[Town]:
    return db.execute(select(Town).where(Town.name == name)).scalars().first()


def get_towns(db: Session, skip: int = 0, limit: int = 100) -> List[Town]:
    return db.execute(select(Town).offset(skip).limit(limit)).scalars().all()


def create_town(db: Session, town_data: Dict[str, Any]) -> Town:
    db_town = Town(**town_data)
    db.add(db_town)
    db.commit()
    db.refresh(db_town)
    return db_town


def update_town(db: Session, town_id: int, town_data: Dict[str, Any]) -> Optional[Town]:
    db_town = get_town(db, town_id)
    if not db_town:
        return None
    for key, value in town_data.items():
        setattr(db_town, key, value)
    db.commit()
    db.refresh(db_town)
    return db_town


def delete_town(db: Session, town_id: int) -> bool:
    db_town = get_town(db, town_id)
    if not db_town:
        return False
    db.delete(db_town)
    db.commit()
    return True

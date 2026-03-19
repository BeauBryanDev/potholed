from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.image import Image


def get_image(db: Session, image_id: int) -> Optional[Image]:
    return db.execute(select(Image).where(Image.id == image_id)).scalars().first()


def get_images(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[Image]:
    query = select(Image).offset(skip).limit(limit)
    if user_id:
        query = query.where(Image.user_id == user_id)
    return db.execute(query).scalars().all()


def update_image(db: Session, image_id: int, image_data: Dict[str, Any]) -> Optional[Image]:
    db_image = get_image(db, image_id)
    if not db_image:
        return None
    for key, value in image_data.items():
        setattr(db_image, key, value)
    db.commit()
    db.refresh(db_image)
    return db_image


def delete_image(db: Session, image_id: int) -> bool:
    db_image = get_image(db, image_id)
    if not db_image:
        return False
    db.delete(db_image)
    # Note: File deletion not handled here to keep it simple, 
    # but usually you might want to delete files from storage.
    db.commit()
    return True

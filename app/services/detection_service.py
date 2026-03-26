from typing import List, Optional, Dict, Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.detection import Detection
from app.models.image import Image


def get_detection(db: Session, detection_id: int) -> Optional[Detection]:
    return db.execute(select(Detection).where(Detection.id == detection_id)).scalars().first()


def get_detections_by_image(db: Session, image_id: int) -> List[Detection]:
    return db.execute(select(Detection).where(Detection.image_id == image_id)).scalars().all()


def get_detections(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
) -> List[Detection]:
    query = select(Detection).order_by(Detection.created_at.desc())

    if user_id is not None:
        query = query.join(Image, Detection.image_id == Image.id).where(Image.user_id == user_id)

    query = query.offset(skip).limit(limit)
    return db.execute(query).scalars().all()


def update_detection(db: Session, detection_id: int, det_data: Dict[str, Any]) -> Optional[Detection]:
    db_det = get_detection(db, detection_id)
    if not db_det:
        return None
    for key, value in det_data.items():
        setattr(db_det, key, value)
    db.commit()
    db.refresh(db_det)
    return db_det


def delete_detection(db: Session, detection_id: int) -> bool:
    db_det = get_detection(db, detection_id)
    if not db_det:
        return False
    db.delete(db_det)
    db.commit()
    return True

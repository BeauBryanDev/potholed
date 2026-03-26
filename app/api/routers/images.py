from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.schemas.image import ImageOut, ImageIn
from app.services import image_service, street_service


router = APIRouter(
    prefix="/images",
    tags=["images"]
)


@router.get("/", response_model=list[ImageOut])
def list_images(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # Only admin can list all images, users see only theirs or specific filter
    if not current_user.is_admin and user_id != current_user.id:
        user_id = current_user.id
    return image_service.get_images(db, skip=skip, limit=limit, user_id=user_id)


@router.get("/{image_id}", response_model=ImageOut)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_image = image_service.get_image(db, image_id=image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Check permission
    if not current_user.is_admin and db_image.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to see this image")
        
    return db_image


@router.put("/{image_id}", response_model=ImageOut)
def update_image(
    image_id: int,
    image_update: ImageIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    # This shouldn't happen often as images are generated during detection
    db_image = image_service.get_image(db, image_id=image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    if not current_user.is_admin and db_image.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this image")
        
    if image_update.street_id:
        db_street = street_service.get_street(db, street_id=image_update.street_id)
        if not db_street:
             raise HTTPException(status_code=404, detail="Street not found")
        image_data = image_update.model_dump(exclude_unset=True)
        image_data["town_id"] = db_street.town_id
        return image_service.update_image(db, image_id=image_id, image_data=image_data)

    return image_service.update_image(db, image_id=image_id, image_data=image_update.model_dump(exclude_unset=True))


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_image = image_service.get_image(db, image_id=image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Image not found")
        
    if not current_user.is_admin and db_image.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this image")
        
    success = image_service.delete_image(db, image_id=image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return None

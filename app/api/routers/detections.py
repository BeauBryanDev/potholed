from typing import Annotated, List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from app.models.image import Image  
from app.services.inference_service import PotholeDetector
from app.utils.image_utils import draw_potholes_and_save

router = APIRouter(
    prefix="/detections",
    tags=["detections"]
)

detector = PotholeDetector(model_path="ml/pothole_model.onnx")

@router.post("/predict", status_code=status.HTTP_201_CREATED)
async def predict_potholes(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="FIle must be an image")

    # YOLO INFERECE 
    image_bytes = await file.read()
    detections, original_img = detector.predict(image_bytes)

 
    filename = draw_potholes_and_save(original_img, detections)


    new_image_record = Image(
        user_id=current_user.id,
        filename=filename,
        path=f"app/storage/outputs/{filename}",
        total_detections=len(detections),
        detections=detections
    )

    db.add(new_image_record)
    db.commit()
    db.refresh(new_image_record)


    return {
        "message": "Detection saved",
        "image_url": f"http://localhost:8000/outputs/{filename}",
        "potholes_found": len(detections),
        "detections": detections,
        "saved_as": filename
    }
 

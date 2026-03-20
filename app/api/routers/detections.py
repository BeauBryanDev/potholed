from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.detection import Detection
from app.models.user import User
from app.models.image import Image
from app.schemas.detection import DetectionPredictResponse, DetectionResponse
from app.services.inference_service import PotholeDetector
from app.services import detection_service, image_service
from app.utils.image_utils import draw_potholes_and_save, save_original_upload

router = APIRouter(
    prefix="/detections",
    tags=["detections"]
)

detector = PotholeDetector(model_path="ml/pothole_model.onnx")

@router.post("/predict", 
             response_model=DetectionPredictResponse, 
             status_code=status.HTTP_201_CREATED
             )

async def predict_potholes(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    file: UploadFile = File(...)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # YOLO inference
    image_bytes = await file.read()
    detections, original_img, inference_time_ms  = detector.predict(image_bytes)
    
    if original_img is None:
        
        raise HTTPException(status_code=400, detail="Invalid image content")

    _, original_path = save_original_upload(file.filename, image_bytes)
    
    filename = draw_potholes_and_save(original_img, detections)
    
    annotated_path = f"app/storage/outputs/{filename}"
    
    height, width = original_img.shape[:2]
    
    confidence_avg = None
    
    if detections:
        
        confidence_avg = sum(item["confidence"] for item in detections) / len(detections)

    new_image_record = Image(
        
        original_filename=file.filename or filename,
        original_path=original_path,
        annotated_path=annotated_path,
        user_id=current_user.id,
        file_size_bytes=len(image_bytes),
        width=width,
        height=height,
        processed_at=datetime.utcnow(),
        inference_time_ms=inference_time_ms,
        is_processed=True,
    )

    try:
        db.add(new_image_record)
        db.flush()

        new_detection_record = Detection(
            
            image_id=new_image_record.id,
            pothole_count=len(detections),
            confidence_avg=confidence_avg,
            detections_json=detections,
            model_version="yolov8s-9k-onnx",
            notes=f"Prediction generated for user {current_user.id}",
        )
        
        db.add(new_detection_record)
        db.commit()
        db.refresh(new_image_record)
        db.refresh(new_detection_record)
        
    except Exception:
        
        db.rollback()
        
        raise



    return {
        "image_id": new_image_record.id,
        "detection_id": new_detection_record.id,
        "message": "Detection saved",
        "image_url": f"http://localhost:8000/outputs/{filename}",
        "potholes_found": len(detections),
        "detections": detections,
        "saved_as": filename,
    }


@router.get("/", response_model=list[DetectionResponse])
def list_detections(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    return detection_service.get_detections(db, skip=skip, limit=limit)


@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_det = detection_service.get_detection(db, detection_id=detection_id)
    if not db_det:
        raise HTTPException(status_code=404, detail="Detection not found")
        
    # Check if the associated image belongs to the user or if user is admin
    db_image = image_service.get_image(db, image_id=db_det.image_id)
    if not current_user.is_admin and db_image.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to see this detection")
        
    return db_det


@router.delete("/{detection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    success = detection_service.delete_detection(db, detection_id=detection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Detection not found")
    return None


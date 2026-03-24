from datetime import datetime , timezone
from typing import Annotated , Optional

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Form , Request
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.detection import Detection
from app.models.user import User
from app.models.image import Image
from app.schemas.detection import DetectionPredictResponse, DetectionResponse
from app.services.inference_service import PotholeDetector
from app.services import detection_service, image_service
from app.utils.image_utils import draw_potholes_and_save, save_original_upload
from app.utils.geo_utils import calculate_estimated_location

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
    
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    file: UploadFile = File(...),
    street_id: Annotated[ Optional[int], Form()]  = 1,
    current_segment:  Annotated[ int , Form( ge= 1, le= 10, description = "Street segement betweeen 1:10 " )] = 5
    ):
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        
        raise HTTPException(status_code=400, detail="File must be an image")

    if street_id:
        
        from app.models.street import Street
        
        db_street = db.query(Street).filter(Street.id == street_id).first()
        
        if not db_street:
            
            raise HTTPException(status_code=404, detail=f"Street ID {street_id} not found")

    total_sub_segments = 10
    
    est_lat, est_lon = calculate_estimated_location(
    lat_start=db_street.latitude_start,
    lon_start=db_street.longitude_start,
    lat_end=db_street.latitude_end,
    lon_end=db_street.longitude_end,
    segment_index=current_segment,
    total_segments=total_sub_segments
    )
    print(f"DEBUG GEO: {est_lat}, {est_lon}")
    
    # YOLO inference
    image_bytes = await file.read()
    
    detections, original_img, inference_time_ms  = detector.predict(image_bytes)
    
    if original_img is None:
        
        raise HTTPException(status_code=400, detail="Invalid image content")

    # Physical file path Saved in DB
    
    _, original_path = save_original_upload(file.filename, image_bytes)
    
    filename = draw_potholes_and_save(original_img, detections)
    
    annotated_path = f"app/storage/outputs/{filename}"
    
    height, width = original_img.shape[:2]
    
    confidence_avg = None
    
    if detections:
        
        confidence_avg = sum(item["confidence"] for item in detections) / len(detections) if detections else 0.0

    new_image_record = Image(
        
        original_filename=file.filename or filename,
        original_path=original_path,
        annotated_path=annotated_path,
        user_id=current_user.id,
        file_size_bytes=len(image_bytes),
        width=width,
        height=height,
        processed_at=datetime.now(timezone.utc),
        is_processed=True,
        street_id=street_id,
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
            inference_time_ms=inference_time_ms,
            estimated_lat=est_lat,
            estimated_lon=est_lon,
            notes=f"Prediction generated for user {current_user.id} at street {street_id}",
        )
        
        db.add(new_detection_record)
        db.commit()
        db.refresh(new_image_record)
        db.refresh(new_detection_record)
        
    except Exception as e:
        
        db.rollback()
        
        raise HTTPException(status_code=500, detail=f"Error saving detections: {str(e)}")   

    base_url = str(request.base_url).rstrip("/")

    return {
        "image_id": new_image_record.id,
        "detection_id": new_detection_record.id,
        "message": "Detection saved",
        "image_url": f"{base_url}/outputs/{filename}",
        "potholes_found": len(detections),
        "detections": detections,
        "inference_time_ms": inference_time_ms,
        "estimated_lat": est_lat,
        "estimated_lon": est_lon,
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


@router.get("/street/{street_id}/geojson")
def get_street_potholes_geojson(
    street_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Exporta todos los baches de una calle específica en formato GeoJSON.
    Ideal para integrar con Leaflet o Google Maps.
    """
    # Buscamos todas las detecciones vinculadas a esa calle a través de las imágenes
    detections = db.query(Detection).join(Image).filter(
        Image.street_id == street_id,
        Detection.estimated_lat.isnot(None)
    ).all()

    # Construimos la estructura GeoJSON estándar
    features = []
    for det in detections:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [det.estimated_lon, det.estimated_lat] # GeoJSON usa [Long, Lat]
            },
            "properties": {
                "detection_id": det.id,
                "pothole_count": det.pothole_count,
                "confidence_avg": det.confidence_avg,
                "severity": "high" if det.pothole_count > 3 else "medium",
                "detected_at": det.detected_at.isoformat()
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "metadata": {
            "street_id": street_id,
            "total_potholes": len(features)
        },
        "features": features
    }


@router.get("/town/{town_id}/geojson")
def get_town_potholes_geojson(
    town_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Exporta todos los baches de una ciudad específica en formato GeoJSON.
    Ideal para integrar con Leaflet o Google Maps.
    """
    # Buscamos todas las detecciones vinculadas a esa ciudad a través de las imágenes
    detections = db.query(Detection).join(Image).filter(
        Image.town_id == town_id,
        Detection.estimated_lat.isnot(None)
    ).all()

    # Construimos la estructura GeoJSON estándar
    features = []
    for det in detections:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [det.estimated_lon, det.estimated_lat] # GeoJSON usa [Long, Lat]
            },
            "properties": {
                "detection_id": det.id,
                "pothole_count": det.pothole_count,
                "confidence_avg": det.confidence_avg,
                "severity": "high" if det.pothole_count > 3 else "medium",
                "detected_at": det.detected_at.isoformat()
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "metadata": {
            "town_id": town_id,
            "total_potholes": len(features)
        },
        "features": features
    }
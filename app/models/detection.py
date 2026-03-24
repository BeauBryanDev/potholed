from datetime import datetime

from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Detection(Base):
    
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    image_id = Column(Integer, ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    
    pothole_count = Column(Integer, nullable=False, default=0)
    confidence_avg = Column(Float, nullable=True)                  # Average confidence of all bboxes
    
    detections_json = Column(JSON, nullable=True)
    
    model_version = Column(String(50), nullable=False, default="yolov8s-9k-onnx")  
    inference_time_ms = Column(Float, nullable=True)                
    notes = Column(String(255), nullable=True)        
    
    estimated_lat = Column(Float, nullable=True)
    estimated_lon = Column(Float, nullable=True)
    
    detected_at = Column(DateTime, nullable=False, server_default=func.now())
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # relationships detection -> image 1:1
    image = relationship("Image", back_populates="detections")

    def __repr__(self) -> str:
        return (
            f"<Detection(id={self.id}, "
            f"image_id={self.image_id}, "
            f"pothole_count={self.pothole_count}, "
            f"confidence_avg={self.confidence_avg:.3f}, "
            f"detected_at={self.detected_at})>"
        )
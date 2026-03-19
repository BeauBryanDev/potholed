from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DetectionBox(BaseModel):
    box: list[int] = Field(..., min_length=4, max_length=4)
    confidence: float
    class_name: str = Field(..., alias="class")

    model_config = {
        "populate_by_name": True,
    }


class DetectionBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    image_id: int
    pothole_count: int = Field(ge=0)
    confidence_avg: float | None = None
    detections_json: list[DetectionBox] | None = None
    model_version: str
    inference_time_ms: float | None = None
    notes: str | None = None


class DetectionCreate(DetectionBase):
    pass


class DetectionResponse(DetectionBase):
    id: int
    detected_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DetectionPredictResponse(BaseModel):
    image_id: int
    detection_id: int
    message: str
    image_url: str
    potholes_found: int = Field(ge=0)
    detections: list[DetectionBox]
    saved_as: str

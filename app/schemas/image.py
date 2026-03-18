from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ImageBase(BaseModel):
    """Base schema with common fields for Image."""
    original_filename: str = Field(..., max_length=255, description="Original filename from upload")
    original_path: str = Field(..., max_length=512, description="Path to the original uploaded file")
    annotated_path: Optional[str] = Field(None, max_length=512, description="Path to the annotated/processed image")
    
    user_id: Optional[int] = Field(None, description="ID of the user who uploaded the image")
    street_id: Optional[int] = Field(None, description="ID of the associated street (if provided)")
    
    file_size_bytes: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    is_processed: bool = Field(False, description="Whether the image has been processed by the model")


class ImageIn(ImageBase):
    """Schema for incoming image data (upload/creation)."""
    # No extra fields needed here - we can derive most from the uploaded file
    pass


class ImageOut(ImageBase):
    """Schema for returning image data to the client."""
    id: int = Field(..., description="Database ID of the image")
    uploaded_at: datetime = Field(..., description="When the image was uploaded")
    processed_at: Optional[datetime] = Field(None, description="When the image was processed")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enables ORM mode (from_attributes=True in Pydantic v2)


class ImageSave(ImageBase):
    """Internal schema for saving/processing image in DB or service layer."""
    id: Optional[int] = None  # Will be assigned by DB after insert
    uploaded_at: Optional[datetime] = None  # Set by DB default
    processed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
        
class ImageListOut(ImageBase):
    """Schema for returning a list of images to the client."""
    id: int = Field(..., description="Database ID of the image")
    uploaded_at: datetime = Field(..., description="When the image was uploaded")
    processed_at: Optional[datetime] = Field(None, description="When the image was processed")
    created_at: datetime = Field(..., description="When the image was created")  # Not editable
    updated_at: datetime = Field(..., description="When the image was last updated")    
    
    class Config:
        from_attributes = True  # Enables ORM mode (from_attributes=True in Pydantic v2)    
        
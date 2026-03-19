from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class StreetBase(BaseModel):

    name: str = Field(..., min_length=1, max_length=150)
    segment: Optional[str] = Field(None, max_length=150)
    town_id: int
    latitude_start: Optional[float] = None
    longitude_start: Optional[float] = None
    latitude_end: Optional[float] = None
    longitude_end: Optional[float] = None


class StreetCreate(StreetBase):
    pass


class StreetUpdate(BaseModel):

    name: Optional[str] = Field(None, min_length=1, max_length=150)
    segment: Optional[str] = Field(None, max_length=150)
    town_id: Optional[int] = None
    latitude_start: Optional[float] = None
    longitude_start: Optional[float] = None
    latitude_end: Optional[float] = None
    longitude_end: Optional[float] = None


class StreetResponse(StreetBase):
    
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

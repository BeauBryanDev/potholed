from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TownBase(BaseModel):

    name: str = Field(..., min_length=1, max_length=100)
    province: str = Field("Bogotá", max_length=100)
    country: str = Field("Colombia", max_length=100)
    code: Optional[str] = Field(None, max_length=20)


class TownCreate(TownBase):
    pass


class TownUpdate(BaseModel):

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    province: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, max_length=20)


class TownResponse(TownBase):
    
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

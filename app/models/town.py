from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Town(Base):
    __tablename__ = "towns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    name = Column(String(100), unique=True, index=True, nullable=False)     
    province = Column(String(100), nullable=False, default="Bogotá")
    country = Column(String(100), nullable=False, default="Colombia")      
    code = Column(String(20), unique=True, nullable=True)                   
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # relationships town -> streets 1:n
    streets = relationship("Street", back_populates="town", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="town")

    def __repr__(self) -> str:
        return (
            f"<Town(id={self.id}, "
            f"name='{self.name}', "
            f"department='{self.department}', "
            f"country='{self.country}')>"
        )

from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Street(Base):
    __tablename__ = "streets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    name = Column(String(150), nullable=False)                              
    segment = Column(String(150), nullable=True)                            
    town_id = Column(Integer, ForeignKey("towns.id", ondelete="CASCADE"), nullable=False)
    
    latitude_start = Column(float, nullable=True)
    longitude_start = Column(float, nullable=True)
    latitude_end = Column(float, nullable=True)
    longitude_end = Column(float, nullable=True)
    
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # relationships street -> town 1:1
    town = relationship("Town", back_populates="streets")

    def __repr__(self) -> str:
        return (
            f"<Street(id={self.id}, "
            f"name='{self.name}', "
            f"segment='{self.segment}', "
            f"town_id={self.town_id})>"
        )
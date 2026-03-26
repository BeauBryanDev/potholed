from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    original_filename = Column(String(255), nullable=False)
    original_path = Column(String(512), nullable=False)          # Path in storage/original or temporal
    annotated_path = Column(String(512), nullable=True)          # Path in  app/storage/outputs/annotated_xxx.jpg
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    street_id = Column(Integer, ForeignKey("streets.id", ondelete="SET NULL"), nullable=True)
    town_id = Column(Integer, ForeignKey("towns.id", ondelete="SET NULL"), nullable=True)
    
    # Metadata 
    file_size_bytes = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, nullable=False, server_default=func.now())
    processed_at = Column(DateTime, nullable=True)
    is_processed = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    # relationships image -> user 1:1
    user = relationship("User", back_populates="images")
    street = relationship("Street", back_populates="images")
    town = relationship("Town", back_populates="images")
    detections = relationship("Detection", back_populates="image", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return (
            f"<Image(id={self.id}, "
            f"original_filename='{self.original_filename}', "
            f"user_id={self.user_id}, "
            f"street_id={self.street_id}, "
            f"town_id={self.town_id}, "
            f"is_processed={self.is_processed})>"
        )    

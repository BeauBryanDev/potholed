from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.town import Town
from app.models.street import Street
from app.models.image import Image
from app.models.detection import Detection

from sqlalchemy import text
from sqlalchemy.orm import Session



class AnalyticsService:

    @staticmethod
    def get_general_overview(db: Session):

        stats = db.query(
            func.sum(Detection.pothole_count).label("total_potholes"),
            func.avg(Detection.confidence_avg).label("average_confidence")
        ).first()
        
        return {
            "total_potholes": int(stats.total_potholes or 0),
            "average_confidence": round(stats.average_confidence or 0.0, 4)
        }

    @staticmethod
    def get_top_streets(db: Session, limit: int = 10):

        streets = db.query(
            Street.name.label("street_name"),
            Town.name.label("town_name"),
            func.sum(Detection.pothole_count).label("total_potholes")
        ).join(Image).join(Street).group_by(Street.name).order_by(desc("total_potholes")).limit(limit).all()
        
        return [
            {
                "street_name": street.street_name,
                "total_potholes": int(street.total_potholes)
            }
            for street in streets
        ]


    @staticmethod
    def get_recent_detections(db: Session, limit: int = 10):

        detections = db.query(Detection).order_by(desc(Detection.detected_at)).limit(limit).all()
        
        return [
            {
                "id": det.id,
                "image_id": det.image_id,
                "pothole_count": det.pothole_count,
                "detected_at": det.detected_at,
                "model_version": det.model_version
            }
            for det in detections
        ]

    @staticmethod
    def get_model_performance(db: Session):

        models = db.query(
            Detection.model_version.label("model"),
            func.count(Detection.id).label("total_detections"),
            func.avg(Detection.confidence_avg).label("avg_confidence"),
            func.sum(Detection.pothole_count).label("total_potholes")
        ).group_by(Detection.model_version).all()
        
        return [
            {
                "model": model.model,
                "total_detections": model.total_detections,
                "avg_confidence": round(model.avg_confidence or 0.0, 4),
                "total_potholes": int(model.total_potholes or 0)
            }
            for model in models
        ]
    

    @staticmethod
    def get_top_affected_streets(db: Session, limit: int = 5):

        results = db.query(
            Street.name.label("street_name"),
            Town.name.label("town_name"),
            func.sum(Detection.pothole_count).label("pothole_count")
        ).select_from(Town) \
         .join(Street, Town.id == Street.town_id) \
         .join(Image, Street.id == Image.street_id) \
         .join(Detection, Image.id == Detection.image_id) \
         .group_by(Street.id, Town.id) \
         .order_by(desc("pothole_count")) \
         .limit(limit) \
         .all()
         
        return [
            {"street": r.street_name, "town": r.town_name, "count": int(r.pothole_count)}
            for r in results
        ]


    
    @staticmethod
    def get_towns_distribution(db: Session):
  
        results = db.query(
            Town.name.label("town_name"),
            func.sum(Detection.pothole_count).label("pothole_count")
        ).select_from(Town) \
         .join(Street, Town.id == Street.town_id) \
         .join(Image, Street.id == Image.street_id) \
         .join(Detection, Image.id == Detection.image_id) \
         .group_by(Town.id) \
         .order_by(desc("pothole_count")) \
         .all()
         
        return [
            {"town": r.town_name, "count": int(r.pothole_count)}
            for r in results
        ]

    
    @staticmethod
    def get_severity_distribution(db: Session):
        """
        Compute severity of potholes.
        Area = w * h.
        Small < 10,000 px | Medium 10,000 - 40,000 px | Large > 40,000 px
        """
        query = text("""
            WITH unnested_detections AS (
                SELECT json_array_elements(detections_json) AS det
                FROM detections
                WHERE detections_json IS NOT NULL
            ),
            areas AS (
                SELECT
                    ((det->'box'->>2)::numeric * (det->'box'->>3)::numeric) AS area
                FROM unnested_detections
            )
            SELECT
                CASE
                    WHEN area < 10000 THEN 'small'
                    WHEN area <= 40000 THEN 'medium'
                    ELSE 'large'
                END AS severity,
                COUNT(*) AS count
            FROM areas
            GROUP BY severity;
        """)
        
        results = db.execute(query).fetchall()
        
        distribution = {"small": 0, "medium": 0, "large": 0}
        for row in results:
            distribution[row.severity] = int(row.count)
            
        return distribution


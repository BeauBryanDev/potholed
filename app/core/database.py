from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    
    pass


engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,               # True en dev para ver queries
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
)


# Session factory síncrona
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Dependencia principal para FastAPI (síncrona por ahora)
def get_db():
    """
    Dependencia para obtener una sesión de DB.
    Uso en routers: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Lightweight initialization to ensure models are registered and DB is reachable.
    """
    # Import models to register mappers
    from app import models  # noqa: F401

    # Simple connection test
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    pass


# Crear el engine asíncrono
engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,               # True en dev para ver queries en consola
    future=True,
    pool_pre_ping=True,                  # chequea conexiones antes de usarlas
    pool_size=20,                        # ajusta según tu tráfico esperado
    max_overflow=10,
)


# Session factory asíncrona
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,              # recomendado para async
    autoflush=False,
)


# Dependencia principal para FastAPI (se inyecta en los endpoints)
async def get_db() -> AsyncSession:
    """
    Dependencia para obtener una sesión de DB asíncrona.
    Uso en routers: async def endpoint(db: AsyncSession = Depends(get_db))
    """
    async with async_session() as session:
        yield session
import logging
import time

from fastapi import FastAPI, HTTPException

from app.core.config import settings
from app.core.database import init_db
from app.api.routers import auth, users, analytics, detections, inference
from app import models  # noqa: F401

logger = logging.getLogger(__name__)
_HEALTH_CACHE_TTL_SECONDS = 10
_health_cache = {"ts": 0.0, "ok": False}


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=settings.APP_DESCRIPTION,
    debug=settings.DEBUG,
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(detections.router)
app.include_router(inference.router)


@app.on_event("startup")
def startup_event() -> None:
    try:
        init_db()
        logger.info("Startup DB check succeeded")
    except Exception:
        logger.exception("Startup DB check failed")


@app.get("/")
def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.VERSION}


@app.get("/health")
def health_check():
    now = time.time()
    if _health_cache["ok"] and (now - _health_cache["ts"] < _HEALTH_CACHE_TTL_SECONDS):
        return {"status": "ok", "db": "ok", "cached": True}

    try:
        init_db()
        _health_cache["ok"] = True
        _health_cache["ts"] = now
    except Exception as exc:
        _health_cache["ok"] = False
        _health_cache["ts"] = now
        raise HTTPException(status_code=503, detail="Database unavailable") from exc

    return {"status": "ok", "db": "ok", "cached": False}

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


    # App metadata
    APP_NAME: str = "potholeguard"
    VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "API TO DETECT Potholes IN THE ROAD BY USING CV MODEL FROM YOLOv8"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"  # por defecto, se sobreescribe con el .env

    # Database
    DATABASE_URL: str
    DB_HOST: str = "potholeguard_db"  # útil si necesitas referenciar el host en otro lugar

    # Para debuggear queries SQL en desarrollo
    DB_ECHO: bool = False

    # JWT / Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    

settings = Settings()
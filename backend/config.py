from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SPEECH_WEIGHT: float = 0.4
    COGNITIVE_WEIGHT: float = 0.6
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

from pydantic_settings import BaseSettings
from typing import List
import json

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./shopswift.db"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@shopswift.com"
    
    ADMIN_EMAIL: str = "admin@shopswift.com"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        
    def parse_cors_origins(self):
        if isinstance(self.CORS_ORIGINS, str):
            return json.loads(self.CORS_ORIGINS)
        return self.CORS_ORIGINS

settings = Settings()
settings.CORS_ORIGINS = settings.parse_cors_origins()
import os
import logging
from pydantic_settings import BaseSettings
import firebase_admin
from firebase_admin import credentials

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("healthchain_config")

class Settings(BaseSettings):
    gemma_api_key: str = ""
    firebase_project_id: str = "healthcare-edb75"
    firebase_credentials_path: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        if settings.firebase_credentials_path and os.path.exists(settings.firebase_credentials_path):
            logger.info(f"Initializing Firebase with certificate file: {settings.firebase_credentials_path}")
            cred = credentials.Certificate(settings.firebase_credentials_path)
            firebase_admin.initialize_app(cred)
        else:
            logger.info("Initializing Firebase with Application Default Credentials")
            firebase_admin.initialize_app()
except Exception as e:
    logger.warning(f"Firebase Admin SDK initialization warning: {e}. Emulating local DB connection fallback.")

# Configuration from environment variables
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://ehs_user:ehspass@db:5432/ehs_platform")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

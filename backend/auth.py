# JWT authentication utilities
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from config import JWT_ALGORITHM, JWT_EXPIRE_HOURS, JWT_SECRET
from db import get_db

security = HTTPBearer()


def create_access_token(user_id: str) -> str:
    """Create a JWT token for the given user ID."""
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str:
    """Decode JWT token and return user_id. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Dependency that returns the current user from the JWT token."""
    user_id = decode_token(credentials.credentials)
    result = await db.execute(
        text("SELECT id, email, full_name, role FROM profiles WHERE id = :id"),
        {"id": user_id},
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": row[0], "email": row[1], "full_name": row[2], "role": row[3]}

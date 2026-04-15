# Auth routes: register and login
from fastapi import APIRouter, Depends, HTTPException
from passlib.hash import bcrypt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth import create_access_token
from db import get_db
from models import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Create a new user account."""
    # Check if email already exists
    result = await db.execute(
        text("SELECT id FROM profiles WHERE email = :email"),
        {"email": body.email},
    )
    if result.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and insert user
    password_hash = bcrypt.hash(body.password)
    result = await db.execute(
        text("""
            INSERT INTO profiles (email, password_hash, full_name, role)
            VALUES (:email, :password_hash, :full_name, 'worker')
            RETURNING id, email, full_name, role
        """),
        {"email": body.email, "password_hash": password_hash, "full_name": body.full_name},
    )
    await db.commit()
    row = result.fetchone()
    return RegisterResponse(id=row[0], email=row[1], full_name=row[2], role=row[3])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT token."""
    result = await db.execute(
        text("SELECT id, password_hash, full_name FROM profiles WHERE email = :email"),
        {"email": body.email},
    )
    row = result.fetchone()
    if not row or not bcrypt.verify(body.password, row[1]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(str(row[0]))
    return LoginResponse(access_token=token, full_name=row[2])

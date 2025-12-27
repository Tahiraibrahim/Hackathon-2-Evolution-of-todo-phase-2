from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from pydantic import BaseModel
from typing import Annotated
import jwt
import os

from backend.db import get_session
from backend.models import User
from backend.agents.auth_orchestrator import AuthOrchestrator

router = APIRouter()

# Security Config
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET_KEY = os.getenv("JWT_SECRET", "mysecretkey")
ALGORITHM = "HS256"

# Initialize orchestrator
auth_orchestrator = AuthOrchestrator()

# --- Models ---
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    token: str

# --- Dependency ---
def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], session: Session = Depends(get_session)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user.id
    except:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- Routes ---

@router.post("/signup", response_model=Token)
def signup(user_data: UserCreate, session: Session = Depends(get_session)):
    """
    Register a new user.

    Uses AuthOrchestrator to:
    - Hash password
    - Create user in database
    - Handle duplicate emails
    - Generate JWT token for the new user
    """
    result = auth_orchestrator.signup_user(
        session=session,
        email=user_data.email,
        full_name=user_data.full_name,
        password=user_data.password,
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    # Generate JWT token for the new user
    token_result = auth_orchestrator.login_user(
        session=session,
        email=user_data.email,
        password=user_data.password,
        secret_key=SECRET_KEY,
        token_expiry_minutes=60,
    )

    return {"token": token_result["token"]}

@router.post("/login", response_model=Token)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    """
    Authenticate user and generate JWT token.

    Uses AuthOrchestrator to:
    - Verify user credentials
    - Generate JWT token
    """
    result = auth_orchestrator.login_user(
        session=session,
        email=data.email,
        password=data.password,
        secret_key=SECRET_KEY,
        token_expiry_minutes=60,
    )

    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])

    return {"token": result["token"]}
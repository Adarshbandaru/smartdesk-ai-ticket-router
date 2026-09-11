from fastapi import APIRouter, Depends, HTTPException, status
from schemas.schemas import UserLogin, Token
import jwt
from datetime import datetime, timedelta
from config import settings

router = APIRouter()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(user: UserLogin):
    if user.email == "admin@smartdesk.com" and user.password == "admin":
        access_token = create_access_token(data={"sub": user.email, "role": "Admin"})
        return {"access_token": access_token, "token_type": "bearer"}
    elif user.email == "agent@smartdesk.com" and user.password == "agent":
        access_token = create_access_token(data={"sub": user.email, "role": "Support Agent"})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

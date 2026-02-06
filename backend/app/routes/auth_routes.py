from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.db.session import get_session
from app.schemas.auth_schema import UserCreate, UserRead, Token
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    user = auth_service.create_user(payload, session)
    return UserRead.from_orm(user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    token = auth_service.authenticate(form_data.username, form_data.password, session)
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(auth_service.get_current_user)):
    return UserRead.from_orm(current_user)

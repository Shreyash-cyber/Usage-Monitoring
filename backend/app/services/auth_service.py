import hashlib
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.db.session import get_session
from app.models.user import User
from app.models.organization import Organization
from app.schemas.auth_schema import UserCreate
from app.utils.jwt_utils import create_access_token


SECRET_PEPPER = "usage-monitor-pepper"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    salted = f"{password}{SECRET_PEPPER}".encode()
    return hashlib.sha256(salted).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def create_user(data: UserCreate, session: Session) -> User:
    org = session.get(Organization, data.organization_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization not found")
    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(email=data.email, password_hash=hash_password(data.password), role=data.role, organization_id=data.organization_id)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate(email: str, password: str, session: Session) -> str:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return create_access_token(subject=str(user.id), org_id=user.organization_id, role=user.role)


def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    from app.utils.jwt_utils import decode_token
    payload = decode_token(token)
    user = session.get(User, int(payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

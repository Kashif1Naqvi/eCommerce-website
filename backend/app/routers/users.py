from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRead
from app.routers.auth import get_current_active_user
from typing import Optional
router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me")
def update_user_me(
    full_name: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if full_name:
        current_user.full_name = full_name
    db.commit()
    return current_user
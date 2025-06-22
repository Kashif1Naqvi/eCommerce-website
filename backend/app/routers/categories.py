from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.product import Category
from app.schemas.product import CategoryRead

router = APIRouter()

@router.get("/", response_model=List[CategoryRead])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
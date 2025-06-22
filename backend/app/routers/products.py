from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, and_
from typing import List, Optional
from app.database import get_db
from app.models.product import Product, Category, Review
from app.models.user import User
from app.schemas.product import (
    ProductRead, ProductCreate, ProductUpdate, 
    CategoryRead, CategoryCreate, CategoryUpdate, ReviewRead, ReviewCreate,
    ProductDetailRead, ProductListResponse
)
from app.routers.auth import get_current_active_user, get_current_admin_user
import shutil
import uuid
from pathlib import Path
import os
from datetime import datetime

router = APIRouter()

# Public endpoints
@router.get("/", response_model=ProductListResponse)
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: Optional[str] = Query("created_at", regex="^(price|name|created_at|rating)$"),
    order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    featured_only: bool = False,
    db: Session = Depends(get_db)
):
    # Base query with eager loading
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.reviews)
    ).filter(Product.is_active == True)
    
    # Apply filters
    if featured_only:
        query = query.filter(Product.is_featured == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Get total count before pagination
    total = query.count()
    
    # Sorting
    if sort_by == "rating":
        # Subquery for average rating
        avg_rating_subq = db.query(
            Review.product_id,
            func.avg(Review.rating).label('avg_rating')
        ).group_by(Review.product_id).subquery()
        
        query = query.outerjoin(avg_rating_subq, Product.id == avg_rating_subq.c.product_id)
        order_column = func.coalesce(avg_rating_subq.c.avg_rating, 0)
    else:
        order_column = getattr(Product, sort_by)
    
    if order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    # Apply pagination
    products = query.offset(skip).limit(limit).all()
    
    # Calculate average ratings for each product
    for product in products:
        if product.reviews:
            product.average_rating = sum(r.rating for r in product.reviews) / len(product.reviews)
            product.review_count = len(product.reviews)
        else:
            product.average_rating = 0
            product.review_count = 0
    
    return {
        "data": products,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/featured", response_model=List[ProductRead])
def get_featured_products(
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get featured products for homepage"""
    products = db.query(Product).filter(
        Product.is_active == True,
        Product.is_featured == True
    ).order_by(Product.created_at.desc()).limit(limit).all()
    
    for product in products:
        if product.reviews:
            product.average_rating = sum(r.rating for r in product.reviews) / len(product.reviews)
            product.review_count = len(product.reviews)
        else:
            product.average_rating = 0
            product.review_count = 0
    
    return products

@router.get("/categories", response_model=List[CategoryRead])
def get_categories(db: Session = Depends(get_db)):
    """Get all active product categories with product count"""
    categories = db.query(
        Category,
        func.count(Product.id).label('product_count')
    ).outerjoin(
        Product, and_(Product.category_id == Category.id, Product.is_active == True)
    ).filter(
        Category.is_active == True
    ).group_by(Category.id).all()
    
    result = []
    for category, count in categories:
        category_dict = category.__dict__.copy()
        category_dict['product_count'] = count
        result.append(category_dict)
    
    return result

@router.get("/categories/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get single category details"""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.is_active == True
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Add product count
    product_count = db.query(Product).filter(
        Product.category_id == category_id,
        Product.is_active == True
    ).count()
    
    category.product_count = product_count
    return category

@router.get("/{product_id}", response_model=ProductDetailRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get single product with details and reviews"""
    product = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.reviews).joinedload(Review.user)
    ).filter(
        Product.id == product_id, 
        Product.is_active == True
    ).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate average rating
    if product.reviews:
        product.average_rating = sum(r.rating for r in product.reviews) / len(product.reviews)
        product.review_count = len(product.reviews)
    else:
        product.average_rating = 0
        product.review_count = 0
    
    # Sort reviews by date
    product.reviews.sort(key=lambda x: x.created_at, reverse=True)
    
    return product

@router.get("/{product_id}/reviews", response_model=List[ReviewRead])
def get_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all reviews for a product with pagination"""
    reviews = db.query(Review).options(
        joinedload(Review.user)
    ).filter(
        Review.product_id == product_id
    ).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    
    return reviews

# Authenticated user endpoints
@router.post("/{product_id}/reviews", response_model=ReviewRead)
def create_review(
    product_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a review for a product"""
    # Check if product exists
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.is_active == True
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    review = Review(
        rating=review_data.rating,
        comment=review_data.comment,
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Load user relationship
    review.user = current_user
    
    return review

@router.put("/reviews/{review_id}", response_model=ReviewRead)
def update_review(
    review_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update your own review"""
    review = db.query(Review).filter(
        Review.id == review_id
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this review")
    
    review.rating = review_data.rating
    review.comment = review_data.comment
    db.commit()
    db.refresh(review)
    
    # Load user relationship
    review.user = current_user
    
    return review

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete your own review"""
    review = db.query(Review).filter(
        Review.id == review_id
    ).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Allow user to delete their own review or admin to delete any review
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}

# Admin endpoints
@router.post("/", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new product (Admin only)"""
    # Verify category exists if provided
    if product.category_id:
        category = db.query(Category).filter(Category.id == product.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category ID")
    
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Load relationships
    if db_product.category_id:
        db_product.category = category
    
    db_product.average_rating = 0
    db_product.review_count = 0
    
    return db_product

@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product: ProductUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a product (Admin only)"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify category exists if being updated
    if product.category_id is not None:
        category = db.query(Category).filter(Category.id == product.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category ID")
    
    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    
    # Load relationships
    if db_product.reviews:
        db_product.average_rating = sum(r.rating for r in db_product.reviews) / len(db_product.reviews)
        db_product.review_count = len(db_product.reviews)
    else:
        db_product.average_rating = 0
        db_product.review_count = 0
    
    return db_product

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    permanent: bool = Query(False),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a product (Admin only) - soft delete by default"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if permanent:
        # Permanent delete
        db.delete(product)
    else:
        # Soft delete
        product.is_active = False
    
    db.commit()
    
    return {"message": "Product deleted successfully", "permanent": permanent}

@router.post("/{product_id}/upload-image")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Upload product image (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.")
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/products")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Delete old image if exists
    if product.image:
        old_path = Path(product.image.lstrip("/"))
        if old_path.exists():
            os.remove(old_path)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = upload_dir / file_name
    
    # Save file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update product image URL
    product.image = f"/uploads/products/{file_name}"
    db.commit()
    
    return {"image_url": product.image}

@router.post("/categories", response_model=CategoryRead)
def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new category (Admin only)"""
    # Check if category with same name exists
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category with this name already exists"
        )
    
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/categories/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a category (Admin only)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if new name conflicts with existing category
    if category.name and category.name != db_category.name:
        existing = db.query(Category).filter(
            func.lower(Category.name) == func.lower(category.name),
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Category name already exists")
    
    # Update only provided fields
    for key, value in category.dict(exclude_unset=True).items():
        setattr(db_category, key, value)
    
    db_category.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_category)
    
    # Add product count
    product_count = db.query(Product).filter(
        Product.category_id == category_id,
        Product.is_active == True
    ).count()
    db_category.product_count = product_count
    
    return db_category

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a category (Admin only)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has products
    product_count = db.query(Product).filter(Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category. {product_count} products are using this category."
        )
    
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

@router.put("/{product_id}/toggle-featured")
def toggle_featured_product(
    product_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle product featured status (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_featured = not product.is_featured
    db.commit()
    
    return {
        "id": product.id,
        "name": product.name,
        "is_featured": product.is_featured
    }

@router.post("/{product_id}/restore")
def restore_product(
    product_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Restore a soft-deleted product (Admin only)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.is_active:
        raise HTTPException(status_code=400, detail="Product is already active")
    
    product.is_active = True
    db.commit()
    
    return {"message": "Product restored successfully"}
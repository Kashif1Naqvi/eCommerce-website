from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.product import Product, Category
from app.models.order import Order, OrderStatus
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate
from app.schemas.order import OrderUpdate
from app.routers.auth import get_current_active_user, get_current_admin_user

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_active_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.post("/products")
def create_product(
    product: ProductCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}")
def update_product(
    product_id: int,
    product_update: ProductUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field, value in product_update.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product.is_active = False
    db.commit()
    return {"message": "Product deleted"}

@router.post("/categories")
def create_category(
    category: CategoryCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/orders")
def get_all_orders(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return orders

@router.put("/orders/{order_id}")
def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order_update.status:
        order.status = order_update.status
    
    db.commit()
    db.refresh(order)
    return order

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    # Total revenue
    total_revenue = db.query(func.sum(Order.total)).filter(
        Order.status == "completed"
    ).scalar() or 0
    
    # Total orders
    total_orders = db.query(func.count(Order.id)).scalar()
    
    # Active products
    active_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar()
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar()
    
    # Recent orders
    recent_orders = db.query(Order).order_by(
        Order.created_at.desc()
    ).limit(5).all()
    
    recent_orders_data = []
    for order in recent_orders:
        recent_orders_data.append({
            "id": order.id,
            "user_email": order.user.email,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at
        })
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "active_products": active_products,
        "total_users": total_users,
        "recent_orders": recent_orders_data
    }

@router.get("/users")
def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(func.count(User.id)).scalar()
    
    return {
        "data": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.put("/users/{user_id}/toggle-admin")
def toggle_user_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user admin status"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_admin = not user.is_admin
    db.commit()
    
    return {"id": user.id, "email": user.email, "is_admin": user.is_admin}

@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Toggle user active status"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {"id": user.id, "email": user.email, "is_active": user.is_active}
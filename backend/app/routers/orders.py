from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import Cart, CartItem
from app.schemas.order import OrderCreate, OrderRead
from app.routers.auth import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[OrderRead])
def get_my_orders(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/", response_model=OrderRead)
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total = sum(item.product.price * item.quantity for item in cart.items)
    
    # Create order
    order = Order(
        user_id=current_user.id,
        total_amount=total,
        shipping_address=order_data.shipping_address,
        payment_intent_id=order_data.payment_intent_id
    )
    db.add(order)
    db.flush()
    
    # Create order items and update stock
    for cart_item in cart.items:
        # Check stock
        if cart_item.product.stock_quantity < cart_item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {cart_item.product.name}"
            )
        
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price
        )
        db.add(order_item)
        
        # Update stock
        cart_item.product.stock_quantity -= cart_item.quantity
    
    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    
    # TODO: Send confirmation email
    
    return order
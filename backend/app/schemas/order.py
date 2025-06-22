from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.order import OrderStatus
from app.schemas.product import ProductRead

class OrderItemRead(BaseModel):
    id: int
    product: ProductRead
    quantity: int
    price: float
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    shipping_address: str
    payment_intent_id: Optional[str] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None

class OrderRead(BaseModel):
    id: int
    total_amount: float
    status: OrderStatus
    shipping_address: str
    items: List[OrderItemRead]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
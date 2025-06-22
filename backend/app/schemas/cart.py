from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.product import ProductRead

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemRead(BaseModel):
    id: int
    product: ProductRead
    quantity: int
    added_at: datetime
    
    class Config:
        from_attributes = True

class CartRead(BaseModel):
    id: int
    items: List[CartItemRead]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
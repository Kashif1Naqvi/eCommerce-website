from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    product_count: Optional[int] = 0
    is_active: Optional[bool] = None
    
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock_quantity: int = Field(0, ge=0)
    category_id: Optional[int] = None
    image: Optional[str] = None
    is_featured: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    image: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductRead(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    category: Optional[CategoryRead] = None
    average_rating: Optional[float] = 0
    review_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class UserInfo(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    
    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    user: Optional[UserInfo] = None
    
    class Config:
        from_attributes = True

class ProductDetailRead(ProductRead):
    reviews: List[ReviewRead] = []
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    data: List[ProductRead]
    total: int
    skip: int
    limit: int
    
    class Config:
        from_attributes = True
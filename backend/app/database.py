# filepath: /home/syed/Documents/Learning/resume/backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_db_and_tables():
    from app.models import user, product, order, cart  # Import all models
    Base.metadata.create_all(bind=engine)
    
    # Create admin user if not exists
    from app.core.security import get_password_hash
    from app.models.user import User
    db = SessionLocal()
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=settings.ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="Admin User",
            is_admin=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
    db.close()





    
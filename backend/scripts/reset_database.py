import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models import user, product, cart, order  # Import all models

def reset_database():
    """Drop all tables and recreate them"""
    
    confirm = input("This will delete all data. Are you sure? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("\nDropping all tables...")
    Base.metadata.drop_all(bind=engine)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("\n✓ Database reset complete!")
    
    # Add default categories
    from app.database import SessionLocal
    from app.models.product import Category
    
    db = SessionLocal()
    try:
        categories = [
            Category(name="Electronics", description="Electronic devices and accessories"),
            Category(name="Clothing", description="Fashion and apparel"),
            Category(name="Books", description="Books and educational materials"),
            Category(name="Home & Garden", description="Home improvement and garden supplies"),
            Category(name="Sports & Outdoors", description="Sports equipment and outdoor gear"),
        ]
        
        for cat in categories:
            db.add(cat)
        
        db.commit()
        print("✓ Added default categories")
        
    except Exception as e:
        print(f"Error adding categories: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Database Reset Script ===")
    reset_database()
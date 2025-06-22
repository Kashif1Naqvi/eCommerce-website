import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from sqlalchemy import text

def create_admin_user():
    db = SessionLocal()
    
    try:
        # First, let's check if the database connection works
        result = db.execute(text("SELECT 1"))
        print("Database connection successful!")
        
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        
        if admin:
            print("\nAdmin user already exists!")
            print(f"Current admin status: {admin.is_admin}")
            print(f"Current active status: {admin.is_active}")
            
            # Update to ensure admin privileges
            admin.is_admin = True
            admin.is_active = True
            # Reset password to make sure it works
            admin.hashed_password = get_password_hash("admin123")
            db.commit()
            print("\nUpdated admin user:")
            print("Email: admin@example.com")
            print("Password: admin123")
            
            # Verify the password works
            if verify_password("admin123", admin.hashed_password):
                print("✓ Password verification successful!")
            else:
                print("✗ Password verification failed!")
        else:
            # Create new admin user
            print("\nCreating new admin user...")
            hashed_pwd = get_password_hash("admin123")
            
            admin = User(
                email="admin@example.com",
                hashed_password=hashed_pwd,
                full_name="Admin User",
                is_active=True,
                is_admin=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            print("\n✓ Admin user created successfully!")
            print(f"User ID: {admin.id}")
            print(f"Email: {admin.email}")
            print(f"Password: admin123")
            print(f"Is Admin: {admin.is_admin}")
            print(f"Is Active: {admin.is_active}")
            
            # Verify the password works
            if verify_password("admin123", admin.hashed_password):
                print("✓ Password verification successful!")
            else:
                print("✗ Password verification failed!")
        
        # Double-check by querying again
        print("\nVerifying admin user in database...")
        verify_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if verify_admin:
            print(f"✓ Found user: {verify_admin.email}")
            print(f"  - ID: {verify_admin.id}")
            print(f"  - Is Admin: {verify_admin.is_admin}")
            print(f"  - Is Active: {verify_admin.is_active}")
            print(f"  - Has password: {'Yes' if verify_admin.hashed_password else 'No'}")
        else:
            print("✗ Could not find admin user!")
            
    except Exception as e:
        print(f"\n✗ Error occurred: {type(e).__name__}: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Admin User Creation Script ===")
    create_admin_user()
    print("\n=== Script Complete ===")
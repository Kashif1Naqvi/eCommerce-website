import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, create_access_token

def test_login(email: str, password: str):
    db = SessionLocal()
    
    print(f"\nTesting login for: {email}")
    print("-" * 40)
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print("✗ User not found in database!")
        return
    
    print(f"✓ User found: {user.email}")
    print(f"  - ID: {user.id}")
    print(f"  - Full Name: {user.full_name}")
    print(f"  - Is Active: {user.is_active}")
    print(f"  - Is Admin: {user.is_admin}")
    print(f"  - Created At: {user.created_at}")
    
    # Check if user is active
    if not user.is_active:
        print("✗ User is not active!")
        return
    
    # Verify password
    print(f"\nVerifying password...")
    if verify_password(password, user.hashed_password):
        print("✓ Password is correct!")
        
        # Generate token
        access_token = create_access_token(data={"sub": user.email})
        print(f"\n✓ Login successful!")
        print(f"Access token (first 50 chars): {access_token[:50]}...")
    else:
        print("✗ Password is incorrect!")
        print(f"  - Provided password: {password}")
        print(f"  - Hashed password exists: {'Yes' if user.hashed_password else 'No'}")
        print(f"  - Hash length: {len(user.hashed_password) if user.hashed_password else 0}")
    
    db.close()

if __name__ == "__main__":
    print("=== Login Test Script ===")
    
    # Test admin login
    test_login("admin@example.com", "admin123")
    
    # You can test other users too
    # test_login("user@example.com", "password")
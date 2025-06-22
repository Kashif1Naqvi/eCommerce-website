import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import get_password_hash, verify_password

def test_password_hashing():
    print("=== Testing Password Hashing ===\n")
    
    test_password = "admin123"
    print(f"Original password: {test_password}")
    
    # Hash the password
    hashed = get_password_hash(test_password)
    print(f"Hashed password: {hashed}")
    print(f"Hash length: {len(hashed)}")
    
    # Verify it works
    print(f"\nVerifying password...")
    result = verify_password(test_password, hashed)
    print(f"Verification result: {result}")
    
    # Test with wrong password
    print(f"\nTesting with wrong password...")
    wrong_result = verify_password("wrongpassword", hashed)
    print(f"Wrong password result: {wrong_result}")
    
    # Test multiple times to ensure consistency
    print(f"\nTesting consistency...")
    for i in range(3):
        new_hash = get_password_hash(test_password)
        verify_result = verify_password(test_password, new_hash)
        print(f"  Test {i+1}: Hash different: {new_hash != hashed}, Verify: {verify_result}")

if __name__ == "__main__":
    test_password_hashing()
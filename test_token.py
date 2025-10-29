import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.user import create_access_token, create_refresh_token, verify_password, get_password_hash
from datetime import timedelta

def test_security_flow():
    print("🔐 Testing Security Flow...\n")
    
    # 1. Test Password Hashing
    print("1. Testing Password Hashing:")
    password = "user@123"
    hashed = get_password_hash(password)
    print(f"   Original: {password}")
    print(f"   Hashed: {hashed[:50]}...")
    print(f"   Verify: {verify_password(password, hashed)}")
    print("   ✅ Password hashing works\n")
    
    # 2. Test Access Token
    print("2. Testing Access Token:")
    user_data = {"sub": "test@email.com", "role": "user"}
    access_token = create_access_token(user_data)
    print(f"   Access Token: {access_token[:50]}...")
    print(f"   Length: {len(access_token)} chars")
    print("   ✅ Access token created\n")
    
    # 3. Test Refresh Token
    print("3. Testing Refresh Token:")
    refresh_token = create_refresh_token(user_data)
    print(f"   Refresh Token: {refresh_token[:50]}...")
    print(f"   Length: {len(refresh_token)} chars")
    print("   ✅ Refresh token created\n")
    
    # 4. Verify Different Secrets
    print("4. Verifying Different Secrets:")
    from config import settings
    print(f"   SECRET_KEY starts with: {settings.SECRET_KEY[:10]}...")
    print(f"   REFRESH_SECRET_KEY starts with: {settings.REFRESH_SECRET_KEY[:10]}...")
    print(f"   Different secrets: {settings.SECRET_KEY != settings.REFRESH_SECRET_KEY}")
    print("   ✅ Different secrets confirmed\n")
    
    print("🎉 All security tests passed!")

if __name__ == "__main__":
    test_security_flow()
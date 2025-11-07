import requests
import json

BASE_URL = "https://localhost:8000"

def try_different_login_methods():
    """Try different login endpoints and methods"""
    
    credentials = {
        "email": "mariselvams@gmail.com",
        "password": "your_password"  # Replace with actual password
    }
    
    endpoints_to_try = [
        "/api/auth/login",
        "/auth/login", 
        "/api/token",
        "/auth/token",
        "/api/users/login",
        "/login",
        "/api/auth/jwt/login"
    ]
    
    for endpoint in endpoints_to_try:
        print(f"🔑 Trying {endpoint}...")
        try:
            # Try JSON
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json=credentials,
                verify=False,
                timeout=10
            )
            print(f"   JSON Response: {response.status_code} - {response.text[:100]}")

            # Try form data
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                data=credentials,
                verify=False,
                timeout=10
            )
            print(f"   Form Response: {response.status_code} - {response.text[:100]}")

        except Exception as e:
            print(f"   Error: {e}")

def check_available_endpoints():
    """Check what endpoints are available"""
    print("\n🔍 Checking available endpoints...")
    
    endpoints_to_check = [
        "/docs",
        "/redoc", 
        "/openapi.json",
        "/api",
        "/auth",
        "/api/users/me"
    ]
    
    for endpoint in endpoints_to_check:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", verify=False, timeout=5)
            print(f"📋 {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"📋 {endpoint}: Error - {e}")

if __name__ == "__main__":
    print("🚀 Finding authentication endpoint...")
    check_available_endpoints()
    print("\n" + "="*50)
    try_different_login_methods()
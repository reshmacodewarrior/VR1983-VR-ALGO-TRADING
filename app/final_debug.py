import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import FastAPI
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

print("🔧 STEP 1: Testing imports...")

# Test importing routes.py
try:
    from app.api.routes import router as main_router
    print("✅ Main router imported from app.api.routes")
    
    # Include main router
    app.include_router(main_router)
    print("✅ Main router included")
    
except Exception as e:
    print(f"❌ Main router failed: {e}")
    import traceback
    traceback.print_exc()

print("\n🔧 STEP 2: Testing direct upstox import...")
try:
    from api.upstox import router as upstox_router
    print("✅ Upstox router imported directly")
    
    # Include it directly too
    app.include_router(upstox_router)
    print("✅ Upstox router included directly")
    
except Exception as e:
    print(f"❌ Direct upstox failed: {e}")

print("\n🔍 STEP 3: Listing ALL routes...")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = getattr(route, 'methods', ['GET'])
        print(f"  {list(methods)} {route.path}")

print("\n🎯 STEP 4: Testing specific endpoints...")
from fastapi.testclient import TestClient
client = TestClient(app)

test_paths = [
    "/api/upstox/login",
    "/api/upstox/test", 
    "/api/upstox/callback",
    "/"
]

for path in test_paths:
    try:
        response = client.get(path)
        print(f"  {path}: {response.status_code}")
        if response.status_code == 200:
            print(f"    → {response.json()}")
    except Exception as e:
        print(f"  {path}: ERROR - {e}")
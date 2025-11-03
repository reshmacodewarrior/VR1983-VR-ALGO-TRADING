import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

# Try to import upstox directly
try:
    from api.upstox import router as upstox_router
    app.include_router(upstox_router)
    print("✅ Upstox router imported successfully")
    
    # Test with test client
    client = TestClient(app)
    response = client.get("/api/upstox/test")
    print(f"✅ Test endpoint response: {response.status_code} - {response.json()}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
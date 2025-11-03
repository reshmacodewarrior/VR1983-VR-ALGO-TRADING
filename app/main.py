import sys
from pathlib import Path
from venv import logger
sys.path.append(str(Path(__file__).parent.parent))
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware
from app.services.scheduler import start_scheduler, stop_scheduler

async def startup():
    """Application startup tasks"""
    await start_scheduler()

async def shutdown():
    """Application shutdown tasks"""
    await stop_scheduler()

app = FastAPI(
    title="VR1983 Trading Automation API",
    description="Trading automation platform with real-time signals and user watchlists",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Include main router
app.include_router(router)

# ✅ ADD THIS: Include upstox router directly
try:
    from api.upstox import router as upstox_router
    app.include_router(upstox_router)
    print("✅ Upstox router included directly")
except ImportError as e:
    print(f"❌ Upstox router import failed: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Trading API Server Running", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
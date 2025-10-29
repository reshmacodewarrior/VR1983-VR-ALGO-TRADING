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
    # Start the scheduler
    await start_scheduler()
    # ... other startup tasks

async def shutdown():
    """Application shutdown tasks"""
    # Stop the scheduler gracefully
    await stop_scheduler()
    # ... other shutdown tasks


app = FastAPI(
    title="VR1983 Trading Automation API",
    description="Trading automation platform with real-time signals and user watchlists",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI - /docs
    redoc_url="/redoc"  # ReDoc - /redoc
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(router)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("🔥 DEBUG: Startup event called")  # <--- add this
    logger.info("🚀 Starting VR Algo Trading Application...")
    from app.services.scheduler import start_scheduler
    start_scheduler()

@app.get("/scheduler/status")
async def get_scheduler_status():
    from app.services.scheduler import get_scheduler_status
    return get_scheduler_status()

try:
    from api.routes import router
    app.include_router(router, prefix="/api")
except ImportError as e:
    print(f"❌ Router import failed: {e}")

@app.get("/")
async def root():
    return {"message": "Trading API Server Running", "docs": "/docs"}
# Include other routes directly if needed
from api import watchlist, signal, market, user, upstox, broker, order

app.include_router(watchlist.router, prefix="/api/watchlist", tags=["Watchlist"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(signal.router, prefix="/api/signal", tags=["Signals"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(upstox.router,prefix="/api/upstox", tags=["Upstox"])
app.include_router(broker.router,prefix="/api/broker", tags=["broker"] )
app.include_router(order.router,prefix="/api/order", tags=["Orders"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

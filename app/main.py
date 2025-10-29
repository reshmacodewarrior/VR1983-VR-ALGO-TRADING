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



@app.get("/")
async def root():
    return {"message": "Trading API Server Running", "docs": "/docs"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

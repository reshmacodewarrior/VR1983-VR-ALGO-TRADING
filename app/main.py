import sys
from pathlib import Path
from venv import logger
sys.path.append(str(Path(__file__).parent.parent))
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.api.routes import api_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(api_router)



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

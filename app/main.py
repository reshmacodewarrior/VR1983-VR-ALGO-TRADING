import sys
from pathlib import Path
from venv import logger
sys.path.append(str(Path(__file__).parent.parent))
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.api.routes import api_router
from app.admin.routes import admin_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VR1983 Trading Automation", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(api_router)

app.include_router(admin_router, prefix="/admin/api/v1")

@app.get("/")
async def root():
    return {"message": "VR1983 Trading Automation API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



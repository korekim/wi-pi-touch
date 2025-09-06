from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import sys
from pathlib import Path

# Add the backend directory to Python path to ensure imports work
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Import route modules
from api import hello, interfaces, adapter, scan, deauth, handshake, eviltwin

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Include all route modules with /api prefix
app.include_router(hello.router, prefix="/api", tags=["general"])
app.include_router(interfaces.router, prefix="/api", tags=["interfaces"])
app.include_router(adapter.router, prefix="/api", tags=["adapter"])
app.include_router(scan.router, prefix="/api", tags=["scan"])
app.include_router(deauth.router, prefix="/api", tags=["attacks"])
app.include_router(handshake.router, prefix="/api", tags=["attacks"])
app.include_router(eviltwin.router, prefix="/api", tags=["attacks"])

# --- Serve exported Next app ---
# Adjust path to your built folder on the Pi:
UI_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "out"))
# Comment out for now to avoid missing directory errors in development
# app.mount("/", StaticFiles(directory=UI_DIR, html=True), name="ui")

if __name__ == "__main__":
    import uvicorn
    # Bind to 0.0.0.0 so it's accessible from host machine when running in VM
    uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, subprocess

app = FastAPI()

# (Optional in this setup: same-origin means CORS isn't needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_methods=["*"], allow_headers=["*"]
)

# --- API under /api ---
@app.get("/api/hello")
def hello_world():
    r = subprocess.run("echo hello world!", capture_output=True, text=True, shell=True)
    return {"output": r.stdout.strip()}

# --- Serve exported Next app ---
# Adjust path to your built folder on the Pi:
UI_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "out"))
app.mount("/ui", StaticFiles(directory=UI_DIR, html=True), name="ui")

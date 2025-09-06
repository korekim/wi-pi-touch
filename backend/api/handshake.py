from fastapi import APIRouter
from models.requests import HandshakeRequest

router = APIRouter()

@router.post("/handshake")
def capture_handshake(request: HandshakeRequest):
    """Capture WPA handshake"""
    return {
        "status": "success", 
        "message": f"Handshake capture started for {request.target_bssid}",
        "output": f"[DUMMY] airodump-ng --bssid {request.target_bssid} -c 6 -w handshake {request.adapter}\n[DUMMY] Listening for handshake...\n[DUMMY] Capture will run for {request.duration} seconds"
    }

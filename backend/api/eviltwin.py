from fastapi import APIRouter
from models.requests import EvilTwinRequest

router = APIRouter()

@router.post("/eviltwin")
def evil_twin_attack(request: EvilTwinRequest):
    """Start evil twin attack"""
    return {
        "status": "success",
        "message": f"Evil twin AP '{request.target_ssid}' started",
        "output": f"[DUMMY] hostapd /tmp/hostapd.conf\n[DUMMY] dnsmasq --conf-file=/tmp/dnsmasq.conf\n[DUMMY] Evil twin '{request.target_ssid}' running on channel {request.channel}"
    }

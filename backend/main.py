from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os, subprocess

app = FastAPI()

# (Optional in this setup: same-origin means CORS isn't needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"]
)

# Request models
class AdapterModeRequest(BaseModel):
    adapter: str
    mode: str

class NetworkScanRequest(BaseModel):
    adapter: str
    duration: int = 30

class DeauthRequest(BaseModel):
    adapter: str
    target_bssid: str
    target_mac: str = None

class HandshakeRequest(BaseModel):
    adapter: str
    target_bssid: str
    duration: int = 60

class EvilTwinRequest(BaseModel):
    adapter: str
    target_ssid: str
    channel: str = "auto"

# --- API under /api ---
@app.get("/api/hello")
def hello_world():
    r = subprocess.run("echo hello world!", capture_output=True, text=True, shell=True)
    return {"output": r.stdout.strip()}

@app.post("/api/adapter/mode")
def set_adapter_mode(request: AdapterModeRequest):
    """Set WiFi adapter to monitor or managed mode"""
    return {
        "status": "success",
        "message": f"Set {request.adapter} to {request.mode} mode",
        "output": f"[DUMMY] iwconfig {request.adapter} mode {request.mode}\n[DUMMY] ifconfig {request.adapter} up\n[DUMMY] Mode changed successfully"
    }

@app.post("/api/scan")
def scan_networks(request: NetworkScanRequest):
    """Scan for WiFi networks"""
    dummy_networks = [
        {"bssid": "AA:BB:CC:DD:EE:FF", "ssid": "HomeNetwork", "channel": "6", "signal": "-45", "encryption": "WPA2"},
        {"bssid": "11:22:33:44:55:66", "ssid": "OfficeWiFi", "channel": "11", "signal": "-67", "encryption": "WPA3"},
        {"bssid": "77:88:99:AA:BB:CC", "ssid": "CafeGuest", "channel": "1", "signal": "-78", "encryption": "Open"},
        {"bssid": "DD:EE:FF:00:11:22", "ssid": "SecureNet", "channel": "6", "signal": "-56", "encryption": "WPA2"}
    ]
    
    return {
        "status": "success",
        "message": f"Scanned for {request.duration} seconds using {request.adapter}",
        "networks": dummy_networks,
        "output": f"[DUMMY] airodump-ng {request.adapter}\n[DUMMY] Scanning complete - Found {len(dummy_networks)} networks"
    }

@app.post("/api/deauth")
def deauth_attack(request: DeauthRequest):
    """Perform deauthentication attack using aireplay-ng"""
    try:
        # Validate inputs
        if not request.target_bssid:
            raise HTTPException(status_code=400, detail="target_bssid is required")
        if not request.adapter:
            raise HTTPException(status_code=400, detail="adapter is required")
            
        target_info = f" against {request.target_mac}" if request.target_mac else " (broadcast)"
        
        # In a real implementation:
        # cmd = f"sudo aireplay-ng --deauth 10 -a {request.target_bssid}"
        # if request.target_mac:
        #     cmd += f" -c {request.target_mac}"
        # cmd += f" {request.adapter}"
        # subprocess.run(cmd, shell=True)
        
        return {
            "status": "success",
            "message": f"Deauth attack started on {request.target_bssid}{target_info}",
            "output": f"[DEMO] aireplay-ng --deauth 10 -a {request.target_bssid} {'-c ' + request.target_mac if request.target_mac else ''} {request.adapter}\n[DEMO] Sending deauth packets...\n[DEMO] Attack in progress"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deauth attack failed: {str(e)}")

@app.post("/api/handshake")
def capture_handshake(request: HandshakeRequest):
    """Capture WPA handshake"""
    return {
        "status": "success", 
        "message": f"Handshake capture started for {request.target_bssid}",
        "output": f"[DUMMY] airodump-ng --bssid {request.target_bssid} -c 6 -w handshake {request.adapter}\n[DUMMY] Listening for handshake...\n[DUMMY] Capture will run for {request.duration} seconds"
    }

@app.post("/api/eviltwin")
def evil_twin_attack(request: EvilTwinRequest):
    """Start evil twin attack"""
    return {
        "status": "success",
        "message": f"Evil twin AP '{request.target_ssid}' started",
        "output": f"[DUMMY] hostapd /tmp/hostapd.conf\n[DUMMY] dnsmasq --conf-file=/tmp/dnsmasq.conf\n[DUMMY] Evil twin '{request.target_ssid}' running on channel {request.channel}"
    }

# --- Serve exported Next app ---
# Adjust path to your built folder on the Pi:
UI_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "out"))
app.mount("/", StaticFiles(directory=UI_DIR, html=True), name="ui")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import os, subprocess, json, re
import platform

# Check if we're running in WSL or Linux
def is_wsl_or_linux():
    """Check if running in WSL or native Linux"""
    try:
        with open('/proc/version', 'r') as f:
            return 'microsoft' in f.read().lower() or 'WSL' in f.read()
    except:
        return platform.system().lower() == 'linux'

# Determine if we should use real commands or mock data
USE_REAL_TOOLS = 1

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
    target_mac: Optional[str] = None

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

@app.get("/api/interfaces")
def get_wireless_interfaces():
    """Get available wireless interfaces"""
    if USE_REAL_TOOLS:
        try:
            # Use airmon-ng to list interfaces
            result = subprocess.run("sudo airmon-ng", shell=True, capture_output=True, text=True)
            
            interfaces = []
            lines = result.stdout.split('\n')
            
            for line in lines:
                # Parse airmon-ng output for interfaces
                if 'wlan' in line or 'wlp' in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        interfaces.append({
                            "interface": parts[1],
                            "driver": parts[2] if len(parts) > 2 else "unknown",
                            "chipset": ' '.join(parts[3:]) if len(parts) > 3 else "unknown"
                        })
            
            return {
                "status": "success",
                "interfaces": interfaces,
                "output": result.stdout
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to get interfaces: {str(e)}",
                "interfaces": []
            }
    else:
        # Dummy data for Windows
        return {
            "status": "success", 
            "interfaces": [
                {"interface": "wlan0", "driver": "rtl8188eu", "chipset": "Realtek RTL8188EUS"},
                {"interface": "wlan1", "driver": "ath9k_htc", "chipset": "Atheros AR9271"}
            ],
            "output": "[DUMMY] Wireless interfaces detected"
        }

@app.post("/api/adapter/mode")
def set_adapter_mode(request: AdapterModeRequest):
    """Set WiFi adapter to monitor or managed mode"""
    if USE_REAL_TOOLS:
        try:
            if request.mode == "monitor":
                # Use airmon-ng to enable monitor mode
                cmd = f"sudo airmon-ng start {request.adapter}"
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                
                if result.returncode == 0:
                    # Extract the monitor interface name (usually wlan0 becomes wlan0mon)
                    monitor_interface = f"{request.adapter}mon"
                    return {
                        "status": "success",
                        "message": f"Monitor mode enabled on {monitor_interface}",
                        "output": result.stdout,
                        "monitor_interface": monitor_interface
                    }
                else:
                    raise HTTPException(status_code=500, detail=f"Failed to enable monitor mode: {result.stderr}")
                    
            elif request.mode == "managed":
                # Use airmon-ng to disable monitor mode
                cmd = f"sudo airmon-ng stop {request.adapter}"
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                
                if result.returncode == 0:
                    return {
                        "status": "success", 
                        "message": f"Monitor mode disabled on {request.adapter}",
                        "output": result.stdout
                    }
                else:
                    raise HTTPException(status_code=500, detail=f"Failed to disable monitor mode: {result.stderr}")
            else:
                raise HTTPException(status_code=400, detail="Mode must be 'monitor' or 'managed'")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Command failed: {str(e)}")
    else:
        # Fallback to dummy response for Windows
        return {
            "status": "success",
            "message": f"Set {request.adapter} to {request.mode} mode",
            "output": f"[DUMMY] iwconfig {request.adapter} mode {request.mode}\n[DUMMY] ifconfig {request.adapter} up\n[DUMMY] Mode changed successfully"
        }

@app.post("/api/scan")
def scan_networks(request: NetworkScanRequest):
    """Scan for WiFi networks"""
    if USE_REAL_TOOLS:
        try:
            # First check if adapter is in monitor mode
            check_cmd = f"iwconfig {request.adapter}"
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
            
            if "Mode:Monitor" not in check_result.stdout:
                raise HTTPException(status_code=400, detail=f"Interface {request.adapter} must be in monitor mode")
            
            # Run airodump-ng for specified duration
            output_file = f"/tmp/scan_{request.adapter}"
            cmd = f"timeout {request.duration} airodump-ng {request.adapter} -w {output_file} --output-format csv"
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            networks = []
            csv_file = f"{output_file}-01.csv"
            
            if os.path.exists(csv_file):
                with open(csv_file, 'r') as f:
                    lines = f.readlines()
                    
                # Parse CSV output from airodump-ng
                for line in lines:
                    if line.strip() and not line.startswith('BSSID') and ',' in line:
                        parts = line.strip().split(',')
                        if len(parts) >= 14:
                            networks.append({
                                "bssid": parts[0].strip(),
                                "ssid": parts[13].strip() or "Hidden",
                                "channel": parts[3].strip(),
                                "signal": parts[8].strip(),
                                "encryption": parts[5].strip()
                            })
                
                # Clean up temp files
                os.remove(csv_file)
                if os.path.exists(f"{output_file}-01.cap"):
                    os.remove(f"{output_file}-01.cap")
            
            return {
                "status": "success",
                "message": f"Scanned for {request.duration} seconds using {request.adapter}",
                "networks": networks,
                "output": f"Found {len(networks)} networks"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
    else:
        # Dummy data for Windows
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
# Comment out for now to avoid missing directory errors in development
# app.mount("/", StaticFiles(directory=UI_DIR, html=True), name="ui")

if __name__ == "__main__":
    import uvicorn
    # Bind to 0.0.0.0 so it's accessible from host machine when running in VM
    uvicorn.run(app, host="0.0.0.0", port=8000)


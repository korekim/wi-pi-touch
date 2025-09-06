from fastapi import APIRouter, HTTPException
import subprocess
import os
from models.requests import NetworkScanRequest
from utils.system import USE_REAL_TOOLS

router = APIRouter()

@router.post("/scan")
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

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
            check_cmd = f"sudo iwconfig {request.adapter}"
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
            
            if "Mode:Monitor" not in check_result.stdout:
                raise HTTPException(status_code=400, detail=f"Interface {request.adapter} must be in monitor mode")
            
            # Run airodump-ng for specified duration
            output_file = f"/tmp/scan_{request.adapter}"
            cmd = f"timeout {request.duration} sudo airodump-ng {request.adapter} -w {output_file} --output-format csv"
            
            print(f"Running command: {cmd}")  # Debug logging
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            print(f"Command exit code: {result.returncode}")  # Debug logging
            print(f"Command stderr: {result.stderr}")  # Debug logging
            
            networks = []
            csv_file = f"{output_file}-01.csv"
            
            print(f"Looking for CSV file: {csv_file}")  # Debug logging
            print(f"CSV file exists: {os.path.exists(csv_file)}")  # Debug logging
            
            if os.path.exists(csv_file):
                try:
                    with open(csv_file, 'r') as f:
                        lines = f.readlines()
                        print(f"CSV file has {len(lines)} lines")  # Debug logging
                        
                    # Parse CSV output from airodump-ng
                    # Skip the header lines and empty lines
                    parsing_stations = False
                    for i, line in enumerate(lines):
                        line = line.strip()
                        if not line:
                            continue
                            
                        # Skip until we get past the header
                        if line.startswith('BSSID'):
                            continue
                        if line.startswith('Station MAC'):
                            parsing_stations = True
                            continue
                        if parsing_stations:
                            break  # Stop when we reach stations section
                            
                        # Parse network entries
                        if ',' in line and not line.startswith('BSSID'):
                            parts = line.split(',')
                            if len(parts) >= 14:
                                bssid = parts[0].strip()
                                if bssid and ':' in bssid:  # Valid MAC address
                                    networks.append({
                                        "bssid": bssid,
                                        "ssid": parts[13].strip() or "Hidden",
                                        "channel": parts[3].strip(),
                                        "signal": parts[8].strip(),
                                        "encryption": parts[5].strip()
                                    })
                    
                    print(f"Parsed {len(networks)} networks")  # Debug logging
                    
                except Exception as parse_error:
                    print(f"Error parsing CSV: {parse_error}")
                    return {
                        "status": "error",
                        "message": f"Failed to parse scan results: {str(parse_error)}",
                        "networks": [],
                        "output": result.stdout + "\n" + result.stderr
                    }
                finally:
                    # Clean up temp files
                    try:
                        if os.path.exists(csv_file):
                            os.remove(csv_file)
                        if os.path.exists(f"{output_file}-01.cap"):
                            os.remove(f"{output_file}-01.cap")
                    except Exception as cleanup_error:
                        print(f"Error cleaning up files: {cleanup_error}")
            else:
                # No CSV file created - check why
                return {
                    "status": "error", 
                    "message": "No scan results file created. Check if airodump-ng ran successfully.",
                    "networks": [],
                    "output": f"stdout: {result.stdout}\nstderr: {result.stderr}\nexit_code: {result.returncode}"
                }
            
            return {
                "status": "success",
                "message": f"Scanned for {request.duration} seconds using {request.adapter}",
                "networks": networks,
                "output": f"Found {len(networks)} networks"
            }
            
        except HTTPException:
            raise  # Re-raise HTTP exceptions as-is
        except Exception as e:
            print(f"Unexpected error in scan: {str(e)}")
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

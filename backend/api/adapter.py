from fastapi import APIRouter, HTTPException
import subprocess
from models.requests import AdapterModeRequest
from utils.system import USE_REAL_TOOLS

router = APIRouter()

@router.post("/adapter/mode")
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

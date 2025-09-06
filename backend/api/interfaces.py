from fastapi import APIRouter
import subprocess
from utils.system import USE_REAL_TOOLS

router = APIRouter()

@router.get("/interfaces")
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

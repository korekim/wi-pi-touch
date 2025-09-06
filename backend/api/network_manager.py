from fastapi import APIRouter, HTTPException
import subprocess
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/network-manager/kill")
async def kill_network_manager():
    """
    Kill interfering processes using airmon-ng check kill
    """
    try:
        logger.info("Executing airmon-ng check kill")
        
        # Run airmon-ng check kill
        process = subprocess.run(
            ["sudo", "airmon-ng", "check", "kill"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        output = process.stdout + process.stderr
        logger.info(f"airmon-ng check kill output: {output}")
        
        if process.returncode == 0:
            return {
                "status": "success",
                "message": "Network manager and interfering processes killed successfully",
                "output": output
            }
        else:
            logger.error(f"airmon-ng check kill failed with return code {process.returncode}")
            return {
                "status": "error",
                "message": f"Failed to kill interfering processes (return code: {process.returncode})",
                "output": output
            }
            
    except subprocess.TimeoutExpired:
        logger.error("airmon-ng check kill timed out")
        return {
            "status": "error",
            "message": "Command timed out after 30 seconds",
            "output": ""
        }
    except FileNotFoundError:
        logger.error("airmon-ng not found")
        return {
            "status": "error", 
            "message": "airmon-ng not found. Please install aircrack-ng suite.",
            "output": ""
        }
    except Exception as e:
        logger.error(f"Unexpected error in kill_network_manager: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/network-manager/start")
async def start_network_manager():
    """
    Start the network manager service
    """
    try:
        logger.info("Starting network manager service")
        
        # Try to start NetworkManager service
        process = subprocess.run(
            ["sudo", "systemctl", "start", "NetworkManager"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        output = process.stdout + process.stderr
        logger.info(f"NetworkManager start output: {output}")
        
        if process.returncode == 0:
            return {
                "status": "success",
                "message": "Network manager started successfully",
                "output": output
            }
        else:
            logger.error(f"NetworkManager start failed with return code {process.returncode}")
            return {
                "status": "error",
                "message": f"Failed to start network manager (return code: {process.returncode})",
                "output": output
            }
            
    except subprocess.TimeoutExpired:
        logger.error("NetworkManager start timed out")
        return {
            "status": "error",
            "message": "Command timed out after 30 seconds",
            "output": ""
        }
    except FileNotFoundError:
        logger.error("systemctl not found")
        return {
            "status": "error",
            "message": "systemctl not found. Cannot control NetworkManager service.",
            "output": ""
        }
    except Exception as e:
        logger.error(f"Unexpected error in start_network_manager: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/network-manager/status")
async def get_network_manager_status():
    """
    Check if NetworkManager service is running
    """
    try:
        logger.info("Checking NetworkManager status")
        
        # Check NetworkManager service status
        process = subprocess.run(
            ["systemctl", "is-active", "NetworkManager"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        is_active = process.stdout.strip() == "active"
        
        return {
            "status": "success",
            "running": is_active,
            "service_status": process.stdout.strip()
        }
        
    except subprocess.TimeoutExpired:
        logger.error("NetworkManager status check timed out")
        return {
            "status": "error",
            "message": "Status check timed out",
            "running": None
        }
    except Exception as e:
        logger.error(f"Error checking NetworkManager status: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "running": None
        }

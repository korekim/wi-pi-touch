import os
import subprocess
import threading
import time
from pathlib import Path
from datetime import datetime
from typing import Dict
from fastapi import APIRouter, HTTPException
from models.requests import HandshakeRequest
from utils.system import USE_REAL_TOOLS

router = APIRouter()

# Global variables to manage handshake processes
handshake_processes: Dict[str, "HandshakeManager"] = {}

# Create handshakes directory in user's Documents folder
# When running with sudo, use the actual user's home directory, not root's
import os
if os.environ.get('SUDO_USER'):
    # Running with sudo, get the real user's home directory
    user_home = Path(f"/home/{os.environ['SUDO_USER']}")
else:
    # Running normally
    user_home = Path.home()

HANDSHAKES_DIR = user_home / "Documents" / "handshakes"
HANDSHAKES_DIR.mkdir(parents=True, exist_ok=True)

class HandshakeManager:
    def __init__(self, adapter: str, target_bssid: str, channel: int = None, duration: int = 0):
        self.adapter = adapter
        self.target_bssid = target_bssid
        self.channel = channel
        self.duration = duration
        self.process = None
        self.thread = None
        self.stop_event = threading.Event()
        self.handshake_captured = False
        self.packets_captured = 0
        
        # Generate output filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        bssid_clean = target_bssid.replace(":", "")
        self.output_file = HANDSHAKES_DIR / f"handshake_{bssid_clean}_{timestamp}"
        
    def set_channel(self):
        """Set adapter to specific channel if provided"""
        if self.channel:
            try:
                cmd = f"sudo iwconfig {self.adapter} channel {self.channel}"
                print(f"Setting channel: {cmd}")
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=10)
                if result.returncode != 0:
                    print(f"Warning: Failed to set channel {self.channel}: {result.stderr}")
                    return False
                print(f"Successfully set {self.adapter} to channel {self.channel}")
                return True
            except Exception as e:
                print(f"Error setting channel: {e}")
                return False
        return True
        
    def start_capture(self):
        """Start handshake capture"""
        try:
            # Set channel if specified
            if not self.set_channel():
                print(f"Failed to set channel {self.channel}")
                
            # Start worker thread
            self.thread = threading.Thread(target=self._capture_worker)
            self.thread.daemon = True
            self.thread.start()
            
            # Wait a bit longer and check if process actually started successfully
            time.sleep(2)
            
            # Check if thread is still alive and process started
            if not self.thread.is_alive():
                print("Thread died immediately - capture failed")
                return False
                
            if self.process is None:
                print("Process was not created - capture failed")
                return False
                
            if self.process.poll() is not None:
                print(f"Process exited immediately with code: {self.process.poll()}")
                return False
            
            print(f"Capture started successfully - Thread alive: {self.thread.is_alive()}, Process PID: {self.process.pid if self.process else 'None'}")
            return True
            
        except Exception as e:
            print(f"Error starting handshake capture: {e}")
            return False
            
    def stop_capture(self):
        """Stop handshake capture"""
        try:
            self.stop_event.set()
            
            if self.process:
                try:
                    # Kill the process group
                    os.killpg(os.getpgid(self.process.pid), 9)
                except:
                    # Fallback to killing just the process
                    self.process.kill()
                    
                self.process = None
                
            # Only join thread if we're not calling from within the thread itself
            if self.thread and self.thread.is_alive() and threading.current_thread() != self.thread:
                self.thread.join(timeout=5)
                
        except Exception as e:
            print(f"Error stopping handshake capture: {e}")
            
    def _cleanup_process(self):
        """Clean up process without thread join (called from within thread)"""
        try:
            self.stop_event.set()
            
            if self.process:
                try:
                    # Kill the process group
                    os.killpg(os.getpgid(self.process.pid), 9)
                except:
                    # Fallback to killing just the process
                    self.process.kill()
                    
                self.process = None
                
        except Exception as e:
            print(f"Error cleaning up handshake capture process: {e}")
            
    def is_running(self):
        """Check if capture is running"""
        return (self.process is not None and 
                self.process.poll() is None and 
                not self.stop_event.is_set())
                
    def get_status(self):
        """Get current status"""
        return {
            "adapter": self.adapter,
            "target_bssid": self.target_bssid,
            "channel": self.channel,
            "duration": self.duration,
            "is_running": self.is_running(),
            "handshake_captured": self.handshake_captured,
            "packets_captured": self.packets_captured,
            "output_file": str(self.output_file),
            "stop_requested": self.stop_event.is_set()
        }
        
    def _capture_worker(self):
        """Background worker for handshake capture"""
        try:
            print(f"Starting handshake capture worker for {self.target_bssid}")
            
            # Build airodump-ng command
            cmd = [
                "sudo", "airodump-ng",
                "--bssid", self.target_bssid,
                "--write", str(self.output_file),
                "--output-format", "cap"
            ]
            
            if self.channel:
                cmd.extend(["--channel", str(self.channel)])
                
            cmd.append(self.adapter)
            
            print(f"Starting handshake capture: {' '.join(cmd)}")
            
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1,
                preexec_fn=os.setsid
            )
            
            print(f"Handshake capture process started with PID: {self.process.pid}")
            
            # Monitor output and look for handshake
            start_time = time.time()
            line_count = 0
            for line in iter(self.process.stdout.readline, ''):
                if self.stop_event.is_set():
                    break
                
                line_count += 1
                print(f"Handshake capture output: {line.strip()}")
                
                # Check for common error conditions
                if any(error_phrase in line.lower() for error_phrase in [
                    "no such file or directory",
                    "permission denied", 
                    "no such device",
                    "interface doesn't support monitor mode",
                    "device busy",
                    "invalid argument"
                ]):
                    print(f"Error detected in airodump-ng output: {line.strip()}")
                    break
                    
                # Check for duration timeout
                if self.duration > 0 and (time.time() - start_time) > self.duration:
                    print(f"Handshake capture timeout after {self.duration} seconds")
                    break
                    
                # Parse airodump-ng output
                line_lower = line.lower()
                if ("wpa handshake" in line_lower and ("captured" in line_lower or "found" in line_lower)) or \
                   ("handshake" in line_lower and "wpa" in line_lower and ("detected" in line_lower or "saved" in line_lower)):
                    self.handshake_captured = True
                    print(f"Handshake captured! {line.strip()}")
                    # Stop capture automatically when handshake is found
                    break
                elif "packets" in line_lower or "data" in line_lower:
                    # Try to extract packet count (basic parsing)
                    try:
                        import re
                        numbers = re.findall(r'\d+', line)
                        if numbers:
                            self.packets_captured = max(self.packets_captured, int(numbers[-1]))
                    except:
                        pass
            
            # Check if process exited too quickly (likely an error)
            if line_count < 5 and (time.time() - start_time) < 5:
                print(f"Process exited too quickly after {line_count} lines in {time.time() - start_time:.1f}s - likely an error")
                
        except Exception as e:
            print(f"Error in handshake capture worker: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print(f"Handshake capture worker finishing for {self.target_bssid}")
            self._cleanup_process()

@router.post("/handshake/start")
def start_handshake_capture(request: HandshakeRequest):
    """Start handshake capture"""
    import uuid
    request_id = str(uuid.uuid4())[:8]
    print(f"[{request_id}] DEBUG: Received handshake request - adapter: '{request.adapter}', target_bssid: '{request.target_bssid}', duration: {request.duration}")
    
    if USE_REAL_TOOLS:
        try:
            print(f"[{request_id}] Checking adapter monitor mode...")
            # Check if adapter is in monitor mode
            check_cmd = f"sudo iwconfig {request.adapter}"
            print(f"[{request_id}] DEBUG: Running command: {check_cmd}")
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
            print(f"[{request_id}] DEBUG: iwconfig output: {check_result.stdout}")
            
            if "Mode:Monitor" not in check_result.stdout:
                print(f"[{request_id}] ERROR: Adapter not in monitor mode")
                raise HTTPException(status_code=400, detail=f"Interface {request.adapter} must be in monitor mode")
            
            # Create unique key for this capture
            capture_key = f"{request.adapter}_{request.target_bssid}"
            print(f"[{request_id}] Using capture key: {capture_key}")
            
            # Check if already capturing this target
            if capture_key in handshake_processes:
                manager = handshake_processes[capture_key]
                if manager.is_running():
                    print(f"[{request_id}] Already running capture for {capture_key}")
                    return {
                        "status": "already_running",
                        "message": f"Handshake capture already running for {request.target_bssid}",
                        "capture_key": capture_key
                    }
                else:
                    print(f"[{request_id}] Removing old stopped capture for {capture_key}")
                    del handshake_processes[capture_key]
            
            # Start new capture
            # Try to determine channel if not provided
            channel = getattr(request, 'channel', None)
            print(f"[{request_id}] Creating HandshakeManager with channel: {channel}")
            manager = HandshakeManager(request.adapter, request.target_bssid, channel, request.duration)
            
            print(f"[{request_id}] Starting capture...")
            if manager.start_capture():
                handshake_processes[capture_key] = manager
                print(f"[{request_id}] Capture started successfully")
                
                return {
                    "status": "started",
                    "message": f"Handshake capture started for {request.target_bssid}",
                    "capture_key": capture_key,
                    "target_bssid": request.target_bssid,
                    "adapter": request.adapter,
                    "duration": request.duration,
                    "output_file": str(manager.output_file)
                }
            else:
                print(f"[{request_id}] Failed to start capture")
                raise HTTPException(status_code=500, detail="Failed to start handshake capture")
                
        except HTTPException:
            raise
        except Exception as e:
            print(f"[{request_id}] Exception: {str(e)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Failed to start handshake capture: {str(e)}")
    else:
        # Mock response for development
        return {
            "status": "started",
            "message": f"[MOCK] Handshake capture started for {request.target_bssid}",
            "capture_key": f"mock_{request.adapter}_{request.target_bssid}",
            "target_bssid": request.target_bssid,
            "adapter": request.adapter,
            "duration": request.duration,
            "output_file": f"/tmp/mock_handshake_{request.target_bssid.replace(':', '')}"
        }

@router.post("/handshake/stop")
def stop_handshake_capture(request: HandshakeRequest):
    """Stop handshake capture"""
    if USE_REAL_TOOLS:
        try:
            capture_key = f"{request.adapter}_{request.target_bssid}"
            
            if capture_key in handshake_processes:
                manager = handshake_processes[capture_key]
                if manager.is_running():
                    manager.stop_capture()
                    
                # Get final status before removing
                final_status = manager.get_status()
                del handshake_processes[capture_key]
                
                return {
                    "status": "stopped",
                    "message": f"Handshake capture stopped for {request.target_bssid}",
                    "capture_key": capture_key,
                    "handshake_captured": final_status["handshake_captured"],
                    "packets_captured": final_status["packets_captured"],
                    "output_file": final_status["output_file"]
                }
            else:
                return {
                    "status": "not_running",
                    "message": f"No active handshake capture found for {request.target_bssid}",
                    "capture_key": capture_key
                }
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stop handshake capture: {str(e)}")
    else:
        # Mock response
        return {
            "status": "stopped",
            "message": f"[MOCK] Handshake capture stopped for {request.target_bssid}",
            "capture_key": f"mock_{request.adapter}_{request.target_bssid}",
            "handshake_captured": True,
            "packets_captured": 42
        }

@router.get("/handshake/status")
def get_handshake_status():
    """Get status of all running handshake captures"""
    if USE_REAL_TOOLS:
        status = {}
        for capture_key, manager in handshake_processes.items():
            status[capture_key] = manager.get_status()
        
        return {
            "status": "success",
            "captures": status,
            "total_captures": len([k for k, m in handshake_processes.items() if m.is_running()])
        }
    else:
        return {
            "status": "success",
            "captures": {},
            "total_captures": 0
        }

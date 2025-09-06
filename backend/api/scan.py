from fastapi import APIRouter, HTTPException
import subprocess
import os
import threading
import time
import signal
from typing import Dict, List, Optional
from models.requests import NetworkScanRequest, ScanControlRequest
from utils.system import USE_REAL_TOOLS

router = APIRouter()

# Global variables to manage scanning state
scanning_processes: Dict[str, dict] = {}

class ScanManager:
    def __init__(self, adapter: str):
        self.adapter = adapter
        self.process = None
        self.thread = None
        self.stop_event = threading.Event()
        self.networks = []
        self.output_file = f"/tmp/scan_{adapter}"
        
    def start_scan(self):
        """Start background scanning"""
        if self.is_running():
            return False
            
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._scan_worker)
        self.thread.daemon = True
        self.thread.start()
        return True
        
    def stop_scan(self):
        """Stop background scanning"""
        self.stop_event.set()
        if self.process:
            try:
                # Kill the airodump-ng process
                self.process.terminate()
                self.process.wait(timeout=5)
            except:
                try:
                    self.process.kill()
                except:
                    pass
        
        # Also kill any remaining airodump-ng processes for this adapter
        subprocess.run(f"sudo pkill -f 'airodump-ng {self.adapter}'", shell=True, capture_output=True)
        
        # Clean up temp files
        self._cleanup_files()
        
    def is_running(self):
        """Check if scan is currently running"""
        return self.thread and self.thread.is_alive() and not self.stop_event.is_set()
        
    def get_networks(self):
        """Get current scan results"""
        return self.networks.copy()
        
    def _scan_worker(self):
        """Background worker that runs airodump-ng and parses results"""
        try:
            # Start airodump-ng process
            cmd = f"sudo airodump-ng {self.adapter} -w {self.output_file} --output-format csv"
            print(f"Starting background scan: {cmd}")
            
            self.process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid  # Create new process group
            )
            
            # Monitor and parse results periodically
            while not self.stop_event.is_set():
                time.sleep(3)  # Check every 3 seconds
                self._parse_current_results()
                
        except Exception as e:
            print(f"Error in scan worker: {e}")
        finally:
            self.stop_scan()
            
    def _parse_current_results(self):
        """Parse the current CSV file and update networks"""
        csv_file = f"{self.output_file}-01.csv"
        
        if not os.path.exists(csv_file):
            return
            
        try:
            with open(csv_file, 'r') as f:
                lines = f.readlines()
                
            networks = []
            parsing_stations = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Skip headers and station data
                if line.startswith('BSSID'):
                    continue
                if line.startswith('Station MAC'):
                    parsing_stations = True
                    continue
                if parsing_stations:
                    break
                    
                # Parse network entries
                if ',' in line:
                    parts = line.split(',')
                    if len(parts) >= 14:
                        bssid = parts[0].strip()
                        if bssid and ':' in bssid:  # Valid MAC address
                            networks.append({
                                "bssid": bssid,
                                "ssid": parts[13].strip() or "Hidden",
                                "channel": parts[3].strip(),
                                "signal": parts[8].strip(),
                                "encryption": parts[5].strip(),
                                "last_seen": int(time.time())
                            })
            
            # Update networks (remove duplicates, keep most recent)
            network_map = {}
            for network in networks:
                network_map[network["bssid"]] = network
                
            self.networks = list(network_map.values())
            print(f"Updated scan results: {len(self.networks)} networks")
            
        except Exception as e:
            print(f"Error parsing scan results: {e}")
            
    def _cleanup_files(self):
        """Clean up temporary files"""
        try:
            for i in range(1, 10):
                csv_file = f"{self.output_file}-{i:02d}.csv"
                cap_file = f"{self.output_file}-{i:02d}.cap"
                if os.path.exists(csv_file):
                    os.remove(csv_file)
                if os.path.exists(cap_file):
                    os.remove(cap_file)
        except Exception as e:
            print(f"Error cleaning up files: {e}")

@router.post("/scan/start")
def start_scan(request: ScanControlRequest):
    """Start continuous background scanning"""
    if USE_REAL_TOOLS:
        try:
            # Check if adapter is in monitor mode
            check_cmd = f"sudo iwconfig {request.adapter}"
            check_result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
            
            if "Mode:Monitor" not in check_result.stdout:
                raise HTTPException(status_code=400, detail=f"Interface {request.adapter} must be in monitor mode")
            
            # Check if already scanning
            if request.adapter in scanning_processes:
                manager = scanning_processes[request.adapter]
                if manager.is_running():
                    return {
                        "status": "already_running",
                        "message": f"Scan already running on {request.adapter}",
                        "adapter": request.adapter
                    }
            
            # Start new scan
            manager = ScanManager(request.adapter)
            if manager.start_scan():
                scanning_processes[request.adapter] = manager
                
                return {
                    "status": "started",
                    "message": f"Background scan started on {request.adapter}",
                    "adapter": request.adapter
                }
            else:
                raise HTTPException(status_code=500, detail="Failed to start scan")
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to start scan: {str(e)}")
    else:
        # Mock response for development
        return {
            "status": "started",
            "message": f"[MOCK] Background scan started on {request.adapter}",
            "adapter": request.adapter
        }

@router.post("/scan/stop")
def stop_scan(request: ScanControlRequest):
    """Stop continuous background scanning"""
    if USE_REAL_TOOLS:
        try:
            if request.adapter not in scanning_processes:
                return {
                    "status": "not_running",
                    "message": f"No scan running on {request.adapter}",
                    "adapter": request.adapter
                }
            
            manager = scanning_processes[request.adapter]
            manager.stop_scan()
            
            # Clean up
            del scanning_processes[request.adapter]
            
            return {
                "status": "stopped",
                "message": f"Scan stopped on {request.adapter}",
                "adapter": request.adapter
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to stop scan: {str(e)}")
    else:
        # Mock response for development
        return {
            "status": "stopped", 
            "message": f"[MOCK] Scan stopped on {request.adapter}",
            "adapter": request.adapter
        }

@router.get("/scan/results/{adapter}")
def get_scan_results(adapter: str):
    """Get current scan results for an adapter"""
    if USE_REAL_TOOLS:
        if adapter in scanning_processes:
            manager = scanning_processes[adapter]
            networks = manager.get_networks()
            
            return {
                "status": "success",
                "adapter": adapter,
                "scanning": manager.is_running(),
                "networks": networks,
                "count": len(networks)
            }
        else:
            return {
                "status": "success",
                "adapter": adapter,
                "scanning": False,
                "networks": [],
                "count": 0
            }
    else:
        # Mock data for development
        import random
        mock_networks = [
            {"bssid": "AA:BB:CC:DD:EE:FF", "ssid": "HomeNetwork", "channel": "6", "signal": f"-{random.randint(40, 80)}", "encryption": "WPA2", "last_seen": int(time.time())},
            {"bssid": "11:22:33:44:55:66", "ssid": "OfficeWiFi", "channel": "11", "signal": f"-{random.randint(40, 80)}", "encryption": "WPA3", "last_seen": int(time.time())},
            {"bssid": "77:88:99:AA:BB:CC", "ssid": "CafeGuest", "channel": "1", "signal": f"-{random.randint(40, 80)}", "encryption": "Open", "last_seen": int(time.time())},
        ]
        
        return {
            "status": "success",
            "adapter": adapter,
            "scanning": True,
            "networks": mock_networks,
            "count": len(mock_networks)
        }

@router.get("/scan/status")
def get_scan_status():
    """Get status of all running scans"""
    if USE_REAL_TOOLS:
        status = {}
        for adapter, manager in scanning_processes.items():
            status[adapter] = {
                "running": manager.is_running(),
                "network_count": len(manager.get_networks())
            }
        
        return {
            "status": "success",
            "adapters": status,
            "total_scanning": len([a for a, m in scanning_processes.items() if m.is_running()])
        }
    else:
        return {
            "status": "success",
            "adapters": {"wlan0": {"running": True, "network_count": 3}},
            "total_scanning": 1
        }

# Keep the original scan endpoint for backward compatibility
@router.post("/scan")
def scan_networks_legacy(request: NetworkScanRequest):
    """Legacy single scan endpoint - starts scan, waits, then stops"""
    if USE_REAL_TOOLS:
        try:
            # Start scan
            start_response = start_scan(request)
            if start_response["status"] not in ["started", "already_running"]:
                return start_response
            
            # Wait for the duration
            time.sleep(request.duration)
            
            # Get results
            results = get_scan_results(request.adapter)
            
            # Stop scan
            stop_scan(request)
            
            return {
                "status": "success",
                "message": f"Scanned for {request.duration} seconds using {request.adapter}",
                "networks": results["networks"],
                "output": f"Found {results['count']} networks"
            }
            
        except Exception as e:
            # Make sure to stop scan if something went wrong
            try:
                stop_scan(request)
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")
    else:
        # Dummy data for Windows development
        dummy_networks = [
            {"bssid": "AA:BB:CC:DD:EE:FF", "ssid": "HomeNetwork", "channel": "6", "signal": "-45", "encryption": "WPA2", "last_seen": int(time.time())},
            {"bssid": "11:22:33:44:55:66", "ssid": "OfficeWiFi", "channel": "11", "signal": "-67", "encryption": "WPA3", "last_seen": int(time.time())},
            {"bssid": "77:88:99:AA:BB:CC", "ssid": "CafeGuest", "channel": "1", "signal": "-78", "encryption": "Open", "last_seen": int(time.time())},
            {"bssid": "DD:EE:FF:00:11:22", "ssid": "SecureNet", "channel": "6", "signal": "-56", "encryption": "WPA2", "last_seen": int(time.time())}
        ]
        
        return {
            "status": "success",
            "message": f"[DUMMY] Scanned for {request.duration} seconds using {request.adapter}",
            "networks": dummy_networks,
            "output": f"[DUMMY] Found {len(dummy_networks)} networks"
        }

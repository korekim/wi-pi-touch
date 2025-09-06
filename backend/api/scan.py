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
        """Background worker that runs airodump-ng and parses real-time output"""
        try:
            # Start airodump-ng process with real-time output (no file writing)
            cmd = f"sudo airodump-ng {self.adapter}"
            print(f"Starting background scan with real-time output: {cmd}")
            
            self.process = subprocess.Popen(
                cmd,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,  # Combine stderr with stdout
                universal_newlines=True,
                bufsize=1,  # Line buffered
                preexec_fn=os.setsid  # Create new process group
            )
            
            # Parse real-time output
            self._parse_realtime_output()
                
        except Exception as e:
            print(f"Error in scan worker: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.stop_scan()
            
    def _parse_realtime_output(self):
        """Parse real-time airodump-ng output"""
        networks_dict = {}
        current_networks = []
        parsing_mode = None
        line_count = 0
        
        print("Starting real-time output parsing...")
        
        try:
            for line in iter(self.process.stdout.readline, ''):
                if self.stop_event.is_set():
                    break
                    
                line_count += 1
                raw_line = line
                line = line.strip()
                
                # Debug: print first 20 lines to see what we're getting
                if line_count <= 20:
                    print(f"Line {line_count}: '{raw_line.rstrip()}'")
                
                if not line:
                    continue
                    
                # Handle ANSI escape sequences more selectively
                # Only skip clear screen and cursor movement, but allow lines with data
                if line.startswith('\033[2J') or line.startswith('\033[H') or line == '\033[2J\033[H':
                    # Clear screen commands
                    if line_count <= 20:
                        print(f"  -> Skipping clear screen command")
                    continue
                elif '\033[' in line and not any(keyword in line for keyword in ['BSSID', 'PWR', 'Beacons', ':']):
                    # Skip cursor movement and formatting commands that don't contain data
                    if line_count <= 20:
                        print(f"  -> Skipping ANSI formatting line")
                    continue
                    
                # Clean ANSI escape sequences from the line but keep the content
                import re
                cleaned_line = re.sub(r'\033\[[0-9;]*m', '', line)  # Remove color codes
                cleaned_line = re.sub(r'\033\[[0-9;]*[A-Za-z]', '', cleaned_line)  # Remove other ANSI sequences
                line = cleaned_line.strip()
                
                if not line:
                    continue
                    
                # Detect section headers - be more flexible with header detection
                if 'BSSID' in line and ('PWR' in line or 'Beacons' in line):
                    parsing_mode = 'networks'
                    print(f"Found networks header at line {line_count}: {line}")
                    continue
                elif ('Station MAC' in line) or ('BSSID' in line and 'Station' in line):
                    parsing_mode = 'stations'
                    print(f"Found stations header at line {line_count}: {line}")
                    continue
                elif 'CH' in line and ('Elapsed' in line or 'Time' in line):
                    # This is the status line, skip it
                    print(f"Found status header at line {line_count}: {line}")
                    continue
                    
                # Parse network data
                if parsing_mode == 'networks':
                    print(f"Parsing network line {line_count}: '{line}'")
                    network = self._parse_network_line(line)
                    if network:
                        print(f"  -> Parsed network: {network}")
                        networks_dict[network['bssid']] = network
                    else:
                        print(f"  -> Failed to parse network line")
                        
                elif parsing_mode == 'stations':
                    # We can ignore station data for now
                    continue
                    
                # Update our networks list periodically
                if len(networks_dict) != len(current_networks):
                    current_networks = list(networks_dict.values())
                    self.networks = current_networks.copy()
                    print(f"Real-time scan update: {len(self.networks)} networks found")
                    
        except Exception as e:
            print(f"Error parsing real-time output: {e}")
            import traceback
            traceback.print_exc()
            
    def _parse_network_line(self, line):
        """Parse a single network line from airodump-ng output"""
        try:
            # Split by whitespace to handle formatting
            parts = line.split()
            
            print(f"    Network line parts ({len(parts)}): {parts}")
            
            if len(parts) < 7:  # Need at least BSSID, PWR, Beacons, Data, #/s, CH, MB
                print(f"    -> Too few parts, skipping")
                return None
                
            # Parse according to airodump-ng format:
            # BSSID PWR Beacons Data #/s CH MB ENC CIPHER AUTH ESSID
            bssid = parts[0]
            power = parts[1] 
            beacons = parts[2]
            data = parts[3]
            rate = parts[4]  # #/s
            channel = parts[5]
            mb = parts[6]
            
            # Basic validation - first part should be a MAC address
            if ':' not in bssid or len(bssid) < 17:
                print(f"    -> Invalid BSSID format: {bssid}")
                return None
                
            print(f"    -> Basic fields: BSSID={bssid}, PWR={power}, CH={channel}")
            
            # ENC, CIPHER, AUTH, and ESSID are in the remaining parts
            encryption_info = []
            essid_parts = []
            
            if len(parts) > 7:
                # Look for encryption info and ESSID
                remaining_parts = parts[7:]
                
                # Common encryption indicators
                enc_indicators = ['WPA', 'WEP', 'OPN', 'WPS', 'CCMP', 'TKIP', 'PSK', 'MGT']
                
                essid_started = False
                for part in remaining_parts:
                    # If we haven't found ESSID yet and this looks like encryption
                    if not essid_started and any(enc in part.upper() for enc in enc_indicators):
                        encryption_info.append(part)
                    else:
                        # This should be part of ESSID
                        essid_started = True
                        essid_parts.append(part)
                
                # If no clear ESSID found, last parts might be ESSID
                if not essid_parts and len(remaining_parts) > 3:
                    # Assume last part(s) are ESSID
                    encryption_info = remaining_parts[:-1]
                    essid_parts = [remaining_parts[-1]]
                
            essid = ' '.join(essid_parts).strip() if essid_parts else ""
            encryption = ' '.join(encryption_info).strip() if encryption_info else "Unknown"
            
            # Clean up values
            if not essid or essid == "":
                essid = "Hidden"
                
            print(f"    -> Final: ESSID='{essid}', ENC='{encryption}'")
                
            # Filter out obviously invalid entries
            try:
                power_val = int(power) if power and power.lstrip('-').isdigit() else -100
                if power_val < -100:  # Too weak, probably noise
                    print(f"    -> Signal too weak: {power_val}")
                    return None
            except ValueError:
                print(f"    -> Could not parse power: {power}")
                pass
                
            return {
                "bssid": bssid,
                "ssid": essid,
                "channel": channel,
                "signal": power,
                "encryption": encryption or "Unknown",
                "last_seen": int(time.time())
            }
            
        except Exception as e:
            print(f"Error parsing network line '{line}': {e}")
            return None
            
    def _cleanup_files(self):
        """Clean up temporary files (not needed for real-time parsing, but kept for compatibility)"""
        try:
            # Clean up any leftover files from previous CSV-based scans
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

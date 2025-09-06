"use client";

import { useState, useEffect, useRef } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

export default function ScanPage() {
  const [showHidden, setShowHidden] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedScanAdapter, setSelectedScanAdapter] = useState<string>("");
  
  const { scannedNetworks, setScannedNetworks } = useNetworkContext();
  const { selectedAdapters } = useAdapterContext();
  
  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Set default adapter when adapters are available
  useEffect(() => {
    const adapters = Object.values(selectedAdapters);
    if (adapters.length > 0 && !selectedScanAdapter) {
      setSelectedScanAdapter(adapters[0]);
    }
  }, [selectedAdapters, selectedScanAdapter]);

  // Get the selected adapter for scanning
  const getSelectedAdapter = () => {
    return selectedScanAdapter || null;
  };

  // Check current scan status on component mount
  useEffect(() => {
    const checkScanStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/scan/status");
        const data = await response.json();
        
        if (data.status === "success" && data.total_scanning > 0) {
          setIsScanning(true);
          startPolling();
        }
      } catch (error) {
        console.error("Error checking scan status:", error);
      }
    };
    
    checkScanStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPolling = () => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    console.log("Starting polling for scan results...");

    // Start polling for results every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;
      
      const selectedAdapter = getSelectedAdapter();
      if (!selectedAdapter) {
        console.log("No adapter selected, skipping poll");
        return;
      }

      try {
        console.log(`Polling scan results for adapter: ${selectedAdapter}`);
        const response = await fetch(`http://localhost:8000/api/scan/results/${selectedAdapter}`);
        const data = await response.json();
        
        console.log("Poll response:", data);
        
        if (!isMountedRef.current) return;
        
        if (data.status === "success") {
          console.log(`Found ${data.networks?.length || 0} networks`);
          setScannedNetworks(data.networks || []);
          
          // If scan stopped, update state
          if (!data.scanning) {
            console.log("Scan stopped, updating state");
            setIsScanning(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        } else {
          console.error("Poll failed:", data);
        }
      } catch (error) {
        console.error("Error polling scan results:", error);
        if (isMountedRef.current) {
          setScanError("Failed to get scan results");
        }
      }
    }, 3000);
  };

  const handleScanToggle = async () => {
    const selectedAdapter = getSelectedAdapter();
    
    if (!selectedAdapter) {
      alert("Please select an adapter first in the adapter menu above.");
      return;
    }

    setScanError(null);

    if (isScanning) {
      // Stop scanning
      try {
        const response = await fetch("http://localhost:8000/api/scan/stop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adapter: selectedAdapter
          }),
        });

        const data = await response.json();
        console.log("Stop scan result:", data);
        
        if (data.status === "stopped" || data.status === "not_running") {
          setIsScanning(false);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          setScanError(`Failed to stop scan: ${data.message}`);
        }
      } catch (error) {
        console.error("Error stopping scan:", error);
        setScanError("Failed to stop scan - check if backend is running");
      }
    } else {
      // Start scanning
      setScannedNetworks([]);
      
      try {
        const response = await fetch("http://localhost:8000/api/scan/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adapter: selectedAdapter
          }),
        });

        const data = await response.json();
        console.log("Start scan result:", data);
        
        if (data.status === "started" || data.status === "already_running") {
          setIsScanning(true);
          console.log("Scan started successfully, beginning polling...");
          startPolling();
        } else {
          setScanError(`Failed to start scan: ${data.message}`);
        }
      } catch (error) {
        console.error("Error starting scan:", error);
        setScanError("Failed to start scan - check if backend is running");
      }
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">WiFi Network Scan</h2>
      <div className="bg-card p-4 rounded-lg border border-border shadow-custom">
        <p className="text-muted-foreground mb-4">
          Scan for nearby WiFi networks and gather information about access points. Scanning runs continuously until stopped.
        </p>
        
        {/* Adapter Selection */}
        <div className="mb-4 p-3 bg-muted border border-border rounded">
          <h4 className="text-sm font-medium text-foreground mb-2">Select Adapter for Scanning:</h4>
          <div className="flex items-center space-x-2">
            <select 
              value={selectedScanAdapter} 
              onChange={(e) => setSelectedScanAdapter(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isScanning}
            >
              <option value="">Select an adapter...</option>
              {Object.values(selectedAdapters).map((adapter) => (
                <option key={adapter} value={adapter}>
                  {adapter}
                </option>
              ))}
            </select>
            {isScanning && (
              <span className="text-xs text-muted-foreground">
                (Cannot change while scanning)
              </span>
            )}
          </div>
          {Object.values(selectedAdapters).length === 0 && (
            <p className="text-sm text-destructive mt-2">
              No adapters available - please select adapters in the adapter menu above
            </p>
          )}
        </div>
        
        {/* Error Display */}
        {scanError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive">
            {scanError}
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="show-hidden" 
              className="mr-2 rounded border-border text-primary focus:ring-primary" 
              checked={showHidden}
              onChange={(e) => setShowHidden(e.target.checked)}
            />
            <label htmlFor="show-hidden" className="text-sm text-foreground">Show hidden networks</label>
          </div>
          
          <button 
            className={`px-4 py-2 rounded font-medium transition-all shadow-custom ${
              isScanning 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:bg-muted disabled:text-muted-foreground`}
            onClick={handleScanToggle}
            disabled={!getSelectedAdapter()}
          >
            {isScanning ? "Stop Scan" : "Start Scan"}
          </button>
        </div>

        {/* Real-time Scan Status */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Scan Status</h3>
          <div className="bg-muted border border-border rounded p-3 text-sm">
            {isScanning ? (
              <div className="text-primary flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                🔄 Scanning in progress... ({scannedNetworks.length} networks found)
              </div>
            ) : (
              <div className="text-muted-foreground">
                {scannedNetworks.length > 0 
                  ? `✅ Scan stopped - Found ${scannedNetworks.length} networks total.`
                  : "ℹ️ Ready to scan. Click 'Start Scan' to begin discovering networks in real-time."
                }
              </div>
            )}
            {/* Debug info */}
            <div className="text-xs text-muted-foreground mt-2 font-mono">
              Debug: isScanning={isScanning.toString()}, networksCount={scannedNetworks.length}, selectedAdapter={selectedScanAdapter}
            </div>
          </div>
        </div>

        {/* Scan Results Display */}
        {scannedNetworks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Discovered Networks ({scannedNetworks.length})
              {isScanning && <span className="text-sm font-normal text-muted-foreground ml-2">(updating live)</span>}
            </h3>
            <div className="bg-muted border border-border rounded p-3 text-sm max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <div className="font-bold grid grid-cols-6 gap-2 pb-2 border-b border-border text-foreground">
                  <span>BSSID</span>
                  <span>SSID</span>
                  <span>Channel</span>
                  <span>Signal</span>
                  <span>Encryption</span>
                  <span>Last Seen</span>
                </div>
                {scannedNetworks
                  .filter(network => showHidden || network.ssid !== "Hidden")
                  .sort((a, b) => parseInt(b.signal || "0") - parseInt(a.signal || "0"))
                  .map((network, index) => (
                  <div 
                    key={`${network.bssid}-${index}`}
                    className="grid grid-cols-6 gap-2 font-mono text-xs p-1 rounded hover:bg-card hover:shadow-custom transition-all text-foreground"
                  >
                    <span className="truncate">{network.bssid}</span>
                    <span className="truncate font-semibold">{network.ssid || "Hidden"}</span>
                    <span>{network.channel}</span>
                    <span className={`${parseInt(network.signal || "0") > -50 ? "text-green-600" : parseInt(network.signal || "0") > -70 ? "text-yellow-600" : "text-red-600"}`}>
                      {network.signal} dBm
                    </span>
                    <span>{network.encryption}</span>
                    <span className="text-xs text-muted-foreground">
                      {network.last_seen ? new Date(network.last_seen * 1000).toLocaleTimeString() : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
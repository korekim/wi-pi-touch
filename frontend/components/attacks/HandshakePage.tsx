"use client";

import { useState, useEffect, useRef } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

interface HandshakeStatus {
  running: boolean;
  handshake_captured: boolean;
  packets_captured: number;
  target_bssid: string;
  channel: string | null;
  output_file: string;
}

export default function HandshakePage() {
  const [targetNetwork, setTargetNetwork] = useState("");
  const [selectedAdapter, setSelectedAdapter] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureKey, setCaptureKey] = useState<string | null>(null);
  const [captureStatus, setCaptureStatus] = useState<HandshakeStatus | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);
  
  const { adapterNetworks } = useNetworkContext();
  const { selectedAdapters } = useAdapterContext();

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get only the selected adapters (not all available ones)
  const availableAdapters = Object.values(selectedAdapters).filter(adapter => adapter !== "");

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Auto-populate target network when an adapter's network is selected
  useEffect(() => {
    if (selectedAdapter) {
      const adapterMenuId = Object.entries(selectedAdapters).find(([, adapter]) => adapter === selectedAdapter)?.[0];
      const networkState = adapterMenuId ? adapterNetworks[adapterMenuId] : null;
      
      if (networkState?.selectedNetwork) {
        setTargetNetwork(networkState.selectedNetwork.bssid);
      }
    }
  }, [selectedAdapter, selectedAdapters, adapterNetworks]);

  const startStatusPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:8000/api/handshake/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Handshake capture status:", data);
        
        if (data.captures && captureKey && data.captures[captureKey]) {
          const status = data.captures[captureKey];
          setCaptureStatus(status);
          
          // If capture stopped or handshake captured, clear polling
          if (!status.running || status.handshake_captured) {
            setIsCapturing(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            if (status.handshake_captured) {
              setCaptureError(null);
              alert(`Handshake captured successfully! File: ${status.output_file}`);
            }
          }
        }
      } catch (error) {
        console.error("Error polling handshake capture status:", error);
      }
    }, 2000);
  };

  const handleHandshakeCapture = async () => {
    console.log("🔵 HandshakeCapture: Button clicked");
    
    if (isCapturing) {
      console.log("🟡 HandshakeCapture: Already capturing, ignoring click");
      return;
    }
    
    if (!selectedAdapter) {
      alert("Please select an adapter for the attack");
      return;
    }

    if (!targetNetwork) {
      alert("Please enter a target network BSSID or select a network from the scan results");
      return;
    }

    // Check if another adapter is already using this network for an attack
    const conflictingAdapter = Object.entries(adapterNetworks).find(
      ([adapter, state]) => 
        adapter !== selectedAdapter && 
        state.currentAttackType && 
        state.selectedNetwork?.bssid === targetNetwork
    );

    if (conflictingAdapter) {
      alert(`Network ${targetNetwork} is already being attacked by ${conflictingAdapter[0]}. Please choose a different network or stop the other attack.`);
      return;
    }

    console.log("🔵 HandshakeCapture: Setting isCapturing to true");
    setIsCapturing(true);

    try {
      // Get channel info from selected network if available
      const adapterMenuId = Object.entries(selectedAdapters).find(([, adapter]) => adapter === selectedAdapter)?.[0];
      const networkState = adapterMenuId ? adapterNetworks[adapterMenuId] : null;
      const selectedNetworkInfo = networkState?.selectedNetwork;
      const channel = selectedNetworkInfo?.channel || null;

      const requestBody = {
        adapter: selectedAdapter,
        target_bssid: targetNetwork,
        duration: 0, // 0 means run indefinitely
        channel: channel
      };

      console.log("🔵 HandshakeCapture: Sending request with body:", requestBody);

      const response = await fetch("http://localhost:8000/api/handshake/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🔵 HandshakeCapture: Received response:", response.status, response.statusText);
      const data = await response.json();
      console.log("🔵 HandshakeCapture: Response data:", data);
      
      if (data.status === "started") {
        console.log("🟢 HandshakeCapture: Started successfully");
        setCaptureKey(data.capture_key);
        setCaptureError(null);
        startStatusPolling();
        alert(`Handshake capture started for ${data.target_bssid}\nWill run until handshake captured or manually stopped\nOutput file: ${data.output_file}`);
      } else if (data.status === "already_running") {
        console.log("🟡 HandshakeCapture: Already running");
        alert(data.message);
        setIsCapturing(false);
      } else {
        console.log("🔴 HandshakeCapture: Unexpected status:", data.status);
        throw new Error(data.message || "Failed to start handshake capture");
      }
    } catch (error) {
      console.error("🔴 HandshakeCapture: Error occurred:", error);
      setCaptureError(error instanceof Error ? error.message : "Failed to start handshake capture");
      alert("Failed to start handshake capture: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsCapturing(false);
    }
  };

  const handleStopCapture = async () => {
    if (!selectedAdapter || !targetNetwork) {
      alert("No active capture to stop");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/handshake/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adapter: selectedAdapter,
          target_bssid: targetNetwork
        }),
      });

      const data = await response.json();
      console.log("Stop handshake capture result:", data);
      
      if (data.status === "stopped") {
        setIsCapturing(false);
        setCaptureKey(null);
        setCaptureStatus(null);
        
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        const message = data.handshake_captured 
          ? `Handshake capture stopped.\nHandshake captured: YES\nPackets: ${data.packets_captured}\nFile: ${data.output_file}`
          : `Handshake capture stopped.\nHandshake captured: NO\nPackets: ${data.packets_captured}`;
        
        alert(message);
      } else {
        alert(data.message || "Failed to stop handshake capture");
      }
    } catch (error) {
      console.error("Error stopping handshake capture:", error);
      alert("Failed to stop handshake capture: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Handshake Capture</h2>
      <div className="bg-card p-4 rounded-lg border border-border shadow-custom">
        <p className="text-muted-foreground mb-4">
          Capture WPA/WPA2 handshakes for offline password cracking. Capture will run until a handshake is found or manually stopped.
        </p>
        
        {/* Status Display */}
        {isCapturing && captureStatus && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent rounded-lg">
            <h3 className="font-bold text-accent mb-2">Capture Status</h3>
            <div className="text-sm space-y-1">
              <p><strong>Target:</strong> {captureStatus.target_bssid}</p>
              <p><strong>Channel:</strong> {captureStatus.channel || "Unknown"}</p>
              <p><strong>Status:</strong> {captureStatus.running ? "Running" : "Stopped"}</p>
              <p><strong>Packets Captured:</strong> {captureStatus.packets_captured}</p>
              <p><strong>Handshake:</strong> {captureStatus.handshake_captured ? "✅ CAPTURED" : "❌ Not yet"}</p>
              {captureStatus.output_file && (
                <p><strong>Output File:</strong> {captureStatus.output_file}</p>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {captureError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-medium">Error: {captureError}</p>
          </div>
        )}
        <div className="space-y-2">
          {/* Adapter Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground">Select Adapter:</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              value={selectedAdapter}
              onChange={(e) => setSelectedAdapter(e.target.value)}
            >
              <option value="">-- Select an adapter --</option>
              {availableAdapters.map((adapter) => (
                <option key={adapter} value={adapter}>
                  {adapter} {adapterNetworks[adapter as keyof typeof adapterNetworks]?.selectedNetwork 
                    ? `(${adapterNetworks[adapter as keyof typeof adapterNetworks]?.selectedNetwork?.ssid})` 
                    : '(no network selected)'
                  }
                </option>
              ))}
            </select>
          </div>

          {/* Network Status Display */}
          {selectedAdapter && adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork && (
            <div className="p-2 bg-accent/20 border border-accent rounded text-sm">
              <strong className="text-foreground">Using network from {selectedAdapter}:</strong> <span className="text-accent">{adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.ssid} ({adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.bssid})</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">Target Network BSSID:</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter BSSID (auto-filled from scan selection)"
              value={targetNetwork}
              onChange={(e) => setTargetNetwork(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/80 disabled:bg-muted disabled:text-muted-foreground transition-all shadow-custom"
              onClick={handleHandshakeCapture}
              disabled={isCapturing}
            >
              {isCapturing ? "Capturing..." : "Start Handshake Capture"}
            </button>
            
            {isCapturing && (
              <button 
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-all shadow-custom"
                onClick={handleStopCapture}
              >
                Stop Capture
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

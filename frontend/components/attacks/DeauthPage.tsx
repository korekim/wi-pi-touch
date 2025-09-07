"use client";

import { useState, useEffect, useRef } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

interface DeauthStatus {
  running: boolean;
  packets_sent: number;
  duration: number;
  target_bssid: string;
  target_mac: string | null;
}

export default function DeauthPage() {
  const [targetNetwork, setTargetNetwork] = useState("");
  const [targetDevice, setTargetDevice] = useState("");
  const [selectedAdapter, setSelectedAdapter] = useState<string>("");
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackKey, setAttackKey] = useState<string | null>(null);
  const [attackStatus, setAttackStatus] = useState<DeauthStatus | null>(null);
  const [attackError, setAttackError] = useState<string | null>(null);
  
  const { adapterNetworks } = useNetworkContext();
  const { } = useAdapterContext();

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get available adapters from the network context
  const availableAdapters = Object.keys(adapterNetworks);

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
    if (selectedAdapter && adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork) {
      const network = adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork;
      if (network) {
        setTargetNetwork(network.bssid);
      }
    }
  }, [selectedAdapter, adapterNetworks]);

  const startStatusPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:8000/api/deauth/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("Attack status:", data);
        
        if (data.running !== undefined) {
          setAttackStatus(data);
          
          // If attack stopped, clear polling
          if (!data.running && isAttacking) {
            setIsAttacking(false);
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Error polling attack status:", error);
      }
    }, 2000);
  };

  const handleDeauthAttack = async () => {
    if (!selectedAdapter) {
      alert("Please select an adapter for the attack");
      return;
    }

    if (!targetNetwork) {
      alert("Please enter a target network BSSID or select a network from the scan results");
      return;
    }

    // Validate BSSID format (should be 6 pairs of hex digits separated by colons)
    const bssidRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!bssidRegex.test(targetNetwork)) {
      alert("Invalid BSSID format. Please use format: AA:BB:CC:DD:EE:FF");
      return;
    }

    setAttackError(null);

    if (isAttacking) {
      // Stop attack
      try {
        const response = await fetch("http://localhost:8000/api/deauth/stop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adapter: selectedAdapter,
            target_bssid: targetNetwork,
            target_mac: targetDevice && targetDevice.trim() !== "" ? targetDevice.trim() : null
          }),
        });

        const data = await response.json();
        console.log("Stop deauth result:", data);
        
        if (data.status === "stopped" || data.status === "not_running") {
          setIsAttacking(false);
          setAttackStatus(null);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          setAttackError(`Failed to stop attack: ${data.message}`);
        }
      } catch (error) {
        console.error("Error stopping deauth attack:", error);
        setAttackError("Failed to stop attack - check if backend is running");
      }
    } else {
      // Start attack
      try {
        const requestBody = {
          adapter: selectedAdapter,
          target_bssid: targetNetwork,
          target_mac: targetDevice && targetDevice.trim() !== "" ? targetDevice.trim() : null
        };
        console.log("Sending deauth start request:", requestBody);
        
        const response = await fetch("http://localhost:8000/api/deauth/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log("Start deauth result:", data);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          console.error("Deauth start failed with status:", response.status);
          console.error("Error response:", data);
          setAttackError(`HTTP ${response.status}: ${data.detail || data.message || 'Unknown error'}`);
          return;
        }
        
        if (data.status === "started" || data.status === "already_running") {
          setIsAttacking(true);
          setAttackKey(data.attack_key);
          console.log("Deauth attack started successfully, beginning status polling...");
          startStatusPolling();
        } else {
          setAttackError(`Failed to start attack: ${data.message}`);
        }
      } catch (error) {
        console.error("Error starting deauth attack:", error);
        setAttackError("Failed to start attack - check if backend is running");
      }
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Deauthentication Attack</h2>

      {/* Error Display */}
      {attackError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {attackError}
        </div>
      )}

      {/* Attack Status Display */}
      {attackStatus && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Status:</strong> {attackStatus.running ? "Running" : "Stopped"}
            </div>
            <div>
              <strong>Packets Sent:</strong> {attackStatus.packets_sent}
            </div>
            <div>
              <strong>Duration:</strong> {attackStatus.duration}s
            </div>
            <div>
              <strong>Target:</strong> {attackStatus.target_bssid}
              {attackStatus.target_mac && ` -> ${attackStatus.target_mac}`}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card p-4 rounded-lg border border-border shadow-custom">
        <p className="text-muted-foreground mb-4">
          Deauthentication attacks disconnect devices from WiFi networks by sending spoofed deauth frames.
        </p>
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
          <div>
            <label className="block text-sm font-medium text-foreground">Target Device (optional):</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter specific device MAC address (leave empty for broadcast)"
              value={targetDevice}
              onChange={(e) => setTargetDevice(e.target.value)}
            />
          </div>
          <button 
            className={`px-4 py-2 rounded disabled:bg-muted disabled:text-muted-foreground transition-all shadow-custom ${
              isAttacking 
                ? "bg-orange-500 text-white hover:bg-orange-600" 
                : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
            }`}
            onClick={handleDeauthAttack}
            disabled={!selectedAdapter || !targetNetwork}
          >
            {isAttacking ? "Stop Attack" : "Start Deauth Attack"}
          </button>
        </div>
      </div>
    </div>
  );
}

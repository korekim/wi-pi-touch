"use client";

import { useState, useEffect } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

export default function DeauthPage() {
  const [targetNetwork, setTargetNetwork] = useState("");
  const [targetDevice, setTargetDevice] = useState("");
  const [selectedAdapter, setSelectedAdapter] = useState<string>("");
  const [isAttacking, setIsAttacking] = useState(false);
  
  const { adapterNetworks } = useNetworkContext();
  const { } = useAdapterContext();

  // Get available adapters from the network context
  const availableAdapters = Object.keys(adapterNetworks);

  // Auto-populate target network when an adapter's network is selected
  useEffect(() => {
    if (selectedAdapter && adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork) {
      const network = adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork;
      if (network) {
        setTargetNetwork(network.bssid);
      }
    }
  }, [selectedAdapter, adapterNetworks]);

  const handleDeauthAttack = async () => {
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

    setIsAttacking(true);

    try {
      const requestBody: { 
        adapter: string; 
        target_bssid: string; 
        target_mac?: string; 
      } = {
        adapter: "wlan0", // You might want to get this from context
        target_bssid: targetNetwork,
      };
      
      // Only include target_mac if it's not empty
      if (targetDevice && targetDevice.trim() !== "") {
        requestBody.target_mac = targetDevice.trim();
      }

      const response = await fetch("http://localhost:8000/api/deauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Deauth result:", data);
      alert(`${data.message}\n\nOutput:\n${data.output}`);
    } catch (error) {
      console.error("Error starting deauth attack:", error);
      alert("Failed to start deauth attack");
    } finally {
      setIsAttacking(false);
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Deauthentication Attack</h2>
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
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 disabled:bg-muted disabled:text-muted-foreground transition-all shadow-custom"
            onClick={handleDeauthAttack}
            disabled={isAttacking}
          >
            {isAttacking ? "Attacking..." : "Start Deauth Attack"}
          </button>
        </div>
      </div>
    </div>
  );
}

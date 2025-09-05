"use client";

import { useState, useEffect } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

export default function EvilTwinPage() {
  const [targetSsid, setTargetSsid] = useState("");
  const [channel, setChannel] = useState("auto");
  const [selectedAdapter, setSelectedAdapter] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  
  const { adapterNetworks } = useNetworkContext();
  const { } = useAdapterContext();

  // Get available adapters from the network context
  const availableAdapters = Object.keys(adapterNetworks);

  // Auto-populate target SSID and channel when an adapter's network is selected
  useEffect(() => {
    if (selectedAdapter && adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork) {
      const network = adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork;
      if (network) {
        setTargetSsid(network.ssid);
        setChannel(network.channel);
      }
    }
  }, [selectedAdapter, adapterNetworks]);

  const handleEvilTwin = async () => {
    if (!selectedAdapter) {
      alert("Please select an adapter for the attack");
      return;
    }

    if (!targetSsid) {
      alert("Please enter a target SSID to clone or select a network from the scan results");
      return;
    }

    // Check if another adapter is already using this network for an attack
    const conflictingAdapter = Object.entries(adapterNetworks).find(
      ([adapter, state]) => 
        adapter !== selectedAdapter && 
        state.currentAttackType && 
        state.selectedNetwork?.ssid === targetSsid
    );

    if (conflictingAdapter) {
      alert(`Network ${targetSsid} is already being attacked by ${conflictingAdapter[0]}. Please choose a different network or stop the other attack.`);
      return;
    }

    setIsRunning(true);

    try {
      const response = await fetch("http://localhost:8000/api/eviltwin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adapter: "wlan0", // You might want to get this from context
          target_ssid: targetSsid,
          channel: channel
        }),
      });

      const data = await response.json();
      console.log("Evil twin result:", data);
      alert(`${data.message}\n\nOutput:\n${data.output}`);
    } catch (error) {
      console.error("Error starting evil twin:", error);
      alert("Failed to start evil twin attack");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Evil Twin Attack</h2>
      <div className="bg-card p-4 rounded-lg border border-border shadow-custom">
        <p className="text-muted-foreground mb-4">
          Create a rogue access point to intercept network traffic and credentials.
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
            <div className="p-2 bg-secondary/20 border border-secondary rounded text-sm">
              <strong className="text-foreground">Using network from {selectedAdapter}:</strong> <span className="text-secondary">{adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.ssid} (Channel {adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.channel})</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground">Target SSID:</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Enter SSID to clone (auto-filled from scan selection)"
              value={targetSsid}
              onChange={(e) => setTargetSsid(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Channel:</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="auto">Auto</option>
              <option value="1">1</option>
              <option value="6">6</option>
              <option value="11">11</option>
            </select>
          </div>
          <button 
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:bg-muted disabled:text-muted-foreground transition-all shadow-custom"
            onClick={handleEvilTwin}
            disabled={isRunning}
          >
            {isRunning ? "Starting..." : "Start Evil Twin"}
          </button>
        </div>
      </div>
    </div>
  );
}

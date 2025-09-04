"use client";

import { useState, useEffect } from "react";
import { useNetworkContext } from "@/components/NetworkContext";
import { useAdapterContext } from "@/components/AdapterContext";

export default function HandshakePage() {
  const [targetNetwork, setTargetNetwork] = useState("");
  const [duration, setDuration] = useState(60);
  const [selectedAdapter, setSelectedAdapter] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);
  
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

  const handleHandshakeCapture = async () => {
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

    setIsCapturing(true);

    try {
      const response = await fetch("http://localhost:8000/api/handshake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adapter: "wlan0", // You might want to get this from context
          target_bssid: targetNetwork,
          duration: duration
        }),
      });

      const data = await response.json();
      console.log("Handshake capture result:", data);
      alert(`${data.message}\n\nOutput:\n${data.output}`);
    } catch (error) {
      console.error("Error starting handshake capture:", error);
      alert("Failed to start handshake capture");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Handshake Capture</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-700 mb-4">
          Capture WPA/WPA2 handshakes for offline password cracking.
        </p>
        <div className="space-y-2">
          {/* Adapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Adapter:</label>
            <select 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
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
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <strong>Using network from {selectedAdapter}:</strong> {adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.ssid} ({adapterNetworks[selectedAdapter as keyof typeof adapterNetworks]?.selectedNetwork?.bssid})
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Target Network BSSID:</label>
            <input 
              type="text" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="Enter BSSID (auto-filled from scan selection)"
              value={targetNetwork}
              onChange={(e) => setTargetNetwork(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capture Duration (seconds):</label>
            <input 
              type="number" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" 
              placeholder="60"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            />
          </div>
          <button 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            onClick={handleHandshakeCapture}
            disabled={isCapturing}
          >
            {isCapturing ? "Capturing..." : "Start Handshake Capture"}
          </button>
        </div>
      </div>
    </div>
  );
}

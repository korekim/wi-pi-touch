"use client";

import { useState } from "react";
import { useNetworkContext } from "@/components/NetworkContext";

export default function ScanPage() {
  const [duration, setDuration] = useState(30);
  const [showHidden, setShowHidden] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const { scannedNetworks, setScannedNetworks } = useNetworkContext();

  // For scan page, we'll just track scan results without selection

  const handleScan = async () => {
    setIsScanning(true);
    setScannedNetworks([]);

    try {
      const response = await fetch("http://localhost:8000/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adapter: "wlan0", // You might want to get this from context
          duration: duration
        }),
      });

      const data = await response.json();
      console.log("Scan result:", data);
      setScannedNetworks(data.networks || []);
    } catch (error) {
      console.error("Error scanning networks:", error);
      alert("Failed to scan networks");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="p-6 bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">WiFi Network Scan</h2>
      <div className="bg-card p-4 rounded-lg border border-border shadow-custom">
        <p className="text-muted-foreground mb-4">
          Scan for nearby WiFi networks and gather information about access points.
        </p>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Scan Duration (seconds):</label>
            <input 
              type="number" 
              className="mt-1 block w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-primary focus:border-primary" 
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              placeholder="30" 
            />
          </div>
          <div className="flex items-center">
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
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-secondary disabled:bg-muted disabled:text-muted-foreground transition-all shadow-custom"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Start Scan"}
          </button>
        </div>

        {/* Simple Scan Status */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Scan Status</h3>
          <div className="bg-muted border border-border rounded p-3 text-sm">
            {isScanning ? (
              <div className="text-primary">
                ⏳ Scanning in progress... ({scannedNetworks.length} networks found so far)
              </div>
            ) : (
              <div className="text-muted-foreground">
                {scannedNetworks.length > 0 
                  ? `✅ Scan complete - Found ${scannedNetworks.length} networks. Select networks in the adapter menus above.`
                  : "ℹ️ No scan results yet. Click 'Start Scan' to begin discovering networks."
                }
              </div>
            )}
          </div>
        </div>

        {/* Scan Results Display */}
        {scannedNetworks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Discovered Networks</h3>
            <div className="bg-muted border border-border rounded p-3 text-sm">
              <div className="space-y-2">
                <div className="font-bold grid grid-cols-5 gap-2 pb-2 border-b border-border text-foreground">
                  <span>BSSID</span>
                  <span>SSID</span>
                  <span>Channel</span>
                  <span>Signal</span>
                  <span>Encryption</span>
                </div>
                {scannedNetworks.map((network, index) => (
                  <div 
                    key={index} 
                    className="grid grid-cols-5 gap-2 font-mono text-xs p-1 rounded hover:bg-card hover:shadow-custom transition-all text-foreground"
                  >
                    <span>{network.bssid}</span>
                    <span>{network.ssid}</span>
                    <span>{network.channel}</span>
                    <span>{network.signal}</span>
                    <span>{network.encryption}</span>
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
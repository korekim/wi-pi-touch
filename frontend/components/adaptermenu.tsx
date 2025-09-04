"use client";

import React, { useState } from "react";
import { useAdapterContext } from "./AdapterContext";
import { useNetworkContext } from "./NetworkContext";

interface AdapterMenuProps {
    id: string;
}

export default function AdapterMenu({ id }: AdapterMenuProps) {
    const { selectedAdapters, selectAdapter } = useAdapterContext();
    const { scannedNetworks, adapterNetworks, setAdapterNetwork, syncNetworks, handleSyncToggle } = useNetworkContext();
    const [selected, setSelected] = useState("");
    
    const currentAdapter = adapterNetworks[id];
    const selectedNetwork = currentAdapter?.selectedNetwork;
    
    const adapters = [
        { value: "wlan0", label: "WiFi Adapter 1 (wlan0)" },
        { value: "wlan1", label: "WiFi Adapter 2 (wlan1)" },
        { value: "wlan2", label: "WiFi Adapter 3 (wlan2)" },
    ];

    // Get all selected adapters except for this instance
    const takenAdapters = Object.entries(selectedAdapters)
        .filter(([otherId]) => otherId !== id)
        .map(([, adapter]) => adapter);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelected(e.target.value);
        selectAdapter(id, e.target.value);
    };

    const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value) {
            const [bssid, ssid] = e.target.value.split('|');
            const network = scannedNetworks.find(n => n.bssid === bssid && n.ssid === ssid);
            setAdapterNetwork(id, network || null);
        } else {
            setAdapterNetwork(id, null);
        }
    };

    const handleModeChange = async (mode: string) => {
        if (!selected) {
            alert("Please select an adapter first");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/adapter/mode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    adapter: selected,
                    mode: mode
                }),
            });

            const data = await response.json();
            console.log("Mode change result:", data);
            alert(`${data.message}\n\nOutput:\n${data.output}`);
        } catch (error) {
            console.error("Error changing adapter mode:", error);
            alert("Failed to change adapter mode");
        }
    };

    return (
        <div id={id} className="flex flex-col space-y-2">
            <div className="flex flex-row items-center space-x-3">
            <label htmlFor={`adapter-select-${id}`} className="text-gray-700 text-sm whitespace-nowrap">
                Select Adapter:
            </label>
            <select
                id={`adapter-select-${id}`}
                className="px-3 py-2 border rounded bg-white text-gray-800 text-sm"
                value={selected}
                onChange={handleChange}
            >
                <option value="" disabled>Unselected</option>
                {adapters.map((adapter) => (
                    <option
                        key={adapter.value}
                        value={adapter.value}
                        disabled={takenAdapters.includes(adapter.value)}
                    >
                        {adapter.label}
                    </option>
                ))}
            </select>
            <button 
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                onClick={() => handleModeChange("monitor")}
            >
                Monitor Mode
            </button>
            <button 
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm whitespace-nowrap"
                onClick={() => handleModeChange("managed")}
            >
                Managed Mode
            </button>
            </div>
            
            <div className="flex flex-row items-center space-x-3">
                <label htmlFor={`network-select-${id}`} className="text-gray-700 text-sm whitespace-nowrap">
                    Selected Network:
                </label>
                <select
                    id={`network-select-${id}`}
                    className="px-3 py-2 border rounded bg-white text-gray-800 text-sm flex-1"
                    value={selectedNetwork ? `${selectedNetwork.bssid}|${selectedNetwork.ssid}` : ""}
                    onChange={handleNetworkChange}
                >
                    <option value="">-- No network selected --</option>
                    {scannedNetworks.map((network, index) => (
                        <option key={index} value={`${network.bssid}|${network.ssid}`}>
                            {network.ssid} ({network.bssid}) - {network.signal}dBm
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Sync button only on adapter1 */}
            {id === "adapter1" && (
                <div className="flex flex-row items-center space-x-3">
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={syncNetworks}
                            onChange={(e) => handleSyncToggle(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-gray-700">Sync network selection between adapters</span>
                    </label>
                </div>
            )}
        </div>
    );
}
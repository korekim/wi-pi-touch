"use client";

import React, { useState, useEffect } from "react";
import { useAdapterContext } from "./AdapterContext";
import { useNetworkContext } from "./NetworkContext";

interface AdapterMenuProps {
    id: string;
}

interface WirelessInterface {
    interface: string;
    driver: string;
    chipset: string;
}

export default function AdapterMenu({ id }: AdapterMenuProps) {
    const { selectedAdapters, selectAdapter } = useAdapterContext();
    const { scannedNetworks, adapterNetworks, setAdapterNetwork, syncNetworks, handleSyncToggle } = useNetworkContext();
    const [selected, setSelected] = useState("");
    const [interfaces, setInterfaces] = useState<WirelessInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const currentAdapter = adapterNetworks[id];
    const selectedNetwork = currentAdapter?.selectedNetwork;
    
    // Fetch wireless interfaces on component mount
    useEffect(() => {
        fetchInterfaces();
    }, []);
    
    const fetchInterfaces = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch("http://localhost:8000/api/interfaces");
            const data = await response.json();
            
            if (data.status === "success") {
                setInterfaces(data.interfaces);
            } else {
                setError(data.message || "Failed to fetch interfaces");
            }
        } catch (err) {
            console.error("Error fetching interfaces:", err);
            setError("Failed to connect to backend");
        } finally {
            setLoading(false);
        }
    };
    
    // Convert interfaces to adapter options
    const adapters = interfaces.map(iface => ({
        value: iface.interface,
        label: `${iface.interface} (${iface.driver} - ${iface.chipset})`
    }));

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
        <div id={id} className="flex flex-col space-y-2 w-full max-w-md mx-auto">
            <div className="flex flex-row items-center space-x-2">
            <label htmlFor={`adapter-select-${id}`} className="text-gray-700 text-xs whitespace-nowrap flex-shrink-0">
                Adapter:
            </label>
            <select
                id={`adapter-select-${id}`}
                className="px-2 py-1 border rounded bg-white text-gray-800 text-xs flex-1 min-w-0"
                value={selected}
                onChange={handleChange}
                disabled={loading}
            >
                <option value="" disabled>
                    {loading ? "Loading..." : error ? "Error" : "Select"}
                </option>
                {!loading && !error && adapters.map((adapter) => (
                    <option
                        key={adapter.value}
                        value={adapter.value}
                        disabled={takenAdapters.includes(adapter.value)}
                    >
                        {adapter.label}
                    </option>
                ))}
                {error && (
                    <option value="" disabled style={{ color: 'red' }}>
                        {error}
                    </option>
                )}
            </select>
            <button 
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs whitespace-nowrap flex-shrink-0"
                onClick={fetchInterfaces}
                disabled={loading}
            >
                {loading ? "..." : "🔄"}
            </button>
            <div className="flex space-x-1">
            <button 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs whitespace-nowrap flex-shrink-0"
                onClick={() => handleModeChange("monitor")}
            >
                Monitor
            </button>
            <button 
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs whitespace-nowrap flex-shrink-0"
                onClick={() => handleModeChange("managed")}
            >
                Managed
            </button>
            </div>
            </div>
            
            <div className="flex flex-row items-center space-x-2">
                <label htmlFor={`network-select-${id}`} className="text-gray-700 text-xs whitespace-nowrap flex-shrink-0">
                    Network:
                </label>
                <select
                    id={`network-select-${id}`}
                    className="px-2 py-1 border rounded bg-white text-gray-800 text-xs flex-1 min-w-0"
                    value={selectedNetwork ? `${selectedNetwork.bssid}|${selectedNetwork.ssid}` : ""}
                    onChange={handleNetworkChange}
                >
                    <option value="">-- None --</option>
                    {scannedNetworks.map((network, index) => (
                        <option key={index} value={`${network.bssid}|${network.ssid}`}>
                            {network.ssid} ({network.signal}dBm)
                        </option>
                    ))}
                </select>
                {/* Sync button only on adapter1 */}
                {id === "adapter1" && (
                    <label className="flex items-center space-x-1 text-xs whitespace-nowrap flex-shrink-0">
                        <input
                            type="checkbox"
                            checked={syncNetworks}
                            onChange={(e) => handleSyncToggle(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-gray-700">Sync</span>
                    </label>
                )}
            </div>
        </div>
    );
}
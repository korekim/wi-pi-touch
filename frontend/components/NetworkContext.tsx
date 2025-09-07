"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NetworkResult {
  bssid: string;
  ssid: string;
  channel: string;
  signal: string;
  encryption: string;
  last_seen?: number;
}

interface AdapterNetworkState {
  selectedNetwork: NetworkResult | null;
  isUsedForAttack: boolean;
  currentAttackType?: string;
}

interface NetworkContextType {
  scannedNetworks: NetworkResult[];
  setScannedNetworks: (networks: NetworkResult[]) => void;
  
  // Per-adapter network selections
  adapterNetworks: Record<string, AdapterNetworkState>;
  setAdapterNetwork: (adapterId: string, network: NetworkResult | null) => void;
  
  // Attack adapter assignments
  setAdapterForAttack: (adapterId: string, attackType: string | null) => void;
  getAvailableAdapters: () => string[];
  getNetworkForAdapter: (adapterId: string) => NetworkResult | null;
  
  // Sync functionality
  syncNetworks: boolean;
  setSyncNetworks: (sync: boolean) => void;
  handleSyncToggle: (sync: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [scannedNetworks, setScannedNetworks] = useState<NetworkResult[]>([]);
  const [syncNetworks, setSyncNetworks] = useState(true);
  const [adapterNetworks, setAdapterNetworks] = useState<Record<string, AdapterNetworkState>>({});

  // Fetch real adapters on mount
  useEffect(() => {
    const fetchAdapters = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/interfaces");
        const data = await response.json();
        
        if (data.status === "success" && data.interfaces) {
          const newAdapterNetworks: Record<string, AdapterNetworkState> = {};
          data.interfaces.forEach((iface: { interface: string }) => {
            newAdapterNetworks[iface.interface] = {
              selectedNetwork: null,
              isUsedForAttack: false
            };
          });
          
          if (Object.keys(newAdapterNetworks).length > 0) {
            setAdapterNetworks(newAdapterNetworks);
            console.log("Loaded real adapters:", Object.keys(newAdapterNetworks));
          } else {
            // Fallback to dummy adapters if no real ones found
            setAdapterNetworks({
              wlan0: { selectedNetwork: null, isUsedForAttack: false },
              wlan1: { selectedNetwork: null, isUsedForAttack: false }
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch adapters:", error);
        // Fallback to dummy adapters
        setAdapterNetworks({
          wlan0: { selectedNetwork: null, isUsedForAttack: false },
          wlan1: { selectedNetwork: null, isUsedForAttack: false }
        });
      }
    };
    
    fetchAdapters();
  }, []);

  const handleSyncToggle = (sync: boolean) => {
    setSyncNetworks(sync);
    
    // If enabling sync and networks are different, sync adapter2 to adapter1
    if (sync && adapterNetworks.adapter1?.selectedNetwork && 
        adapterNetworks.adapter2?.selectedNetwork?.bssid !== adapterNetworks.adapter1.selectedNetwork.bssid) {
      setAdapterNetworks(prev => ({
        ...prev,
        adapter2: {
          ...prev.adapter2,
          selectedNetwork: prev.adapter1?.selectedNetwork || null
        }
      }));
    }
  };

  const setAdapterNetwork = (adapterId: string, network: NetworkResult | null) => {
    setAdapterNetworks(prev => {
      const newState = {
        ...prev,
        [adapterId]: {
          ...prev[adapterId],
          selectedNetwork: network
        }
      };

      // If sync is enabled, update both adapters
      if (syncNetworks && network) {
        Object.keys(newState).forEach(id => {
          if (id !== adapterId) {
            newState[id] = {
              ...newState[id],
              selectedNetwork: network
            };
          }
        });
      }

      return newState;
    });
  };

  const setAdapterForAttack = (adapterId: string, attackType: string | null) => {
    setAdapterNetworks(prev => ({
      ...prev,
      [adapterId]: {
        ...prev[adapterId],
        isUsedForAttack: attackType !== null,
        currentAttackType: attackType || undefined
      }
    }));
  };

  const getAvailableAdapters = () => {
    return Object.entries(adapterNetworks)
      .filter(([, state]) => !state.isUsedForAttack)
      .map(([id]) => id);
  };

  const getNetworkForAdapter = (adapterId: string) => {
    return adapterNetworks[adapterId]?.selectedNetwork || null;
  };

  return (
    <NetworkContext.Provider value={{
      scannedNetworks,
      setScannedNetworks,
      adapterNetworks,
      setAdapterNetwork,
      setAdapterForAttack,
      getAvailableAdapters,
      getNetworkForAdapter,
      syncNetworks,
      setSyncNetworks,
      handleSyncToggle
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkContext() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
}

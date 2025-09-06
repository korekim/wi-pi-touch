"use client";

import { useState, useEffect } from "react";
import AdapterMenu from "@/components/adaptermenu";
import { AdapterProvider } from "@/components/AdapterContext";
import { NetworkProvider } from "@/components/NetworkContext";
import DeauthPage from "@/components/attacks/DeauthPage";
import HandshakePage from "@/components/attacks/HandshakePage";
import EvilTwinPage from "@/components/attacks/EvilTwinPage";
import ScanPage from "@/components/attacks/ScanPage";
import DecoyEmail from "@/components/DecoyEmail";

type AttackType = 'scan' | 'deauth' | 'handshake' | 'eviltwin';

export default function Home() {
  const [activeAttack, setActiveAttack] = useState<AttackType>('scan');
  const [showDecoyEmail, setShowDecoyEmail] = useState(false);
  const [networkManagerKilled, setNetworkManagerKilled] = useState(false);
  const [nmLoading, setNmLoading] = useState(false);

  // Check network manager status on component mount
  useEffect(() => {
    const checkNetworkManagerStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/network-manager/status");
        const data = await response.json();
        
        if (data.status === "success") {
          // If NetworkManager is NOT running, we assume it was killed
          setNetworkManagerKilled(!data.running);
        }
      } catch (error) {
        console.error("Error checking network manager status:", error);
        // Default to false if we can't check
        setNetworkManagerKilled(false);
      }
    };
    
    checkNetworkManagerStatus();
  }, []);

  const renderContent = () => {
    switch (activeAttack) {
      case 'scan':
        return <ScanPage />;
      case 'deauth':
        return <DeauthPage />;
      case 'handshake':
        return <HandshakePage />;
      case 'eviltwin':
        return <EvilTwinPage />;
      default:
        return <ScanPage />;
    }
  };

  const handleNetworkManagerToggle = async () => {
    setNmLoading(true);
    try {
      const endpoint = networkManagerKilled ? "/api/network-manager/start" : "/api/network-manager/kill";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (data.status === "success") {
        setNetworkManagerKilled(!networkManagerKilled);
        alert(`${data.message}\n\nOutput:\n${data.output || "Success"}`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error toggling network manager:", error);
      alert("Failed to toggle network manager - check if backend is running");
    } finally {
      setNmLoading(false);
    }
  };

  return (
    <AdapterProvider>
      <NetworkProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Main Header */}
          <div className="text-center py-6 bg-card border-b border-border relative">
            <h1 className="text-4xl font-bold text-foreground">Wi-Pi Touch</h1>
            {/* Header Buttons */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex space-x-2">
              {/* Network Manager Toggle Button */}
              <button 
                onClick={handleNetworkManagerToggle}
                disabled={nmLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-custom ${
                  networkManagerKilled 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {nmLoading ? "..." : networkManagerKilled ? "Start NM" : "Kill NM"}
              </button>
              {/* Decoy Email Button */}
              <button 
                onClick={() => setShowDecoyEmail(true)}
                className="bg-primary hover:bg-secondary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-custom"
              >
                Mail
              </button>
            </div>
          </div>
          
          {/* Adapter Menu Header */}
          <div className="flex flex-row items-center justify-between p-4 bg-muted border-b border-border">
            <div className="flex justify-center flex-1">
              <AdapterMenu id="adapter1" />
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="flex justify-center flex-1">
              <AdapterMenu id="adapter2" />
            </div>
          </div>

          {/* Attack Navigation Header */}
          <div className="flex flex-row items-center justify-center p-3 bg-card border-b border-border">
            <button
              onClick={() => setActiveAttack('scan')}
              className={`flex-1 px-4 py-2 rounded-l text-sm font-medium transition-all ${
                activeAttack === 'scan' 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Network Scan
            </button>
            <button
              onClick={() => setActiveAttack('deauth')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                activeAttack === 'deauth' 
                  ? 'bg-destructive text-destructive-foreground shadow-glow' 
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Deauth Attack
            </button>
            <button
              onClick={() => setActiveAttack('handshake')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                activeAttack === 'handshake' 
                  ? 'bg-accent text-accent-foreground shadow-glow' 
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Handshake Capture
            </button>
            <button
              onClick={() => setActiveAttack('eviltwin')}
              className={`flex-1 px-4 py-2 rounded-r text-sm font-medium transition-all ${
                activeAttack === 'eviltwin' 
                  ? 'bg-secondary text-secondary-foreground shadow-glow' 
                  : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              Evil Twin
            </button>
          </div>
          
          {/* Main content area */}
          {renderContent()}

          {/* Decoy Email Overlay */}
          <DecoyEmail 
            isVisible={showDecoyEmail} 
            onClose={() => setShowDecoyEmail(false)} 
          />
        </div>
      </NetworkProvider>
    </AdapterProvider>
  );
}

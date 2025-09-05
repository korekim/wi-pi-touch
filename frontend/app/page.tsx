"use client";

import { useState } from "react";
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

  return (
    <AdapterProvider>
      <NetworkProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Main Header */}
          <div className="text-center py-6 bg-card border-b border-border relative">
            <h1 className="text-4xl font-bold text-foreground">Wi-Pi Touch</h1>
            {/* Decoy Button */}
            <button 
              onClick={() => setShowDecoyEmail(true)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-secondary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-custom"
            >
              Mail
            </button>
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

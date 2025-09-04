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
        <div className="min-h-screen bg-white text-gray-800">
          {/* Main Header */}
          <div className="text-center py-6 bg-white border-b border-gray-200 relative">
            <h1 className="text-4xl font-bold text-gray-900">Wi-Pi Touch</h1>
            {/* Decoy Button */}
            <button 
              onClick={() => setShowDecoyEmail(true)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              📧 Email
            </button>
          </div>
          
          {/* Adapter Menu Header */}
          <div className="flex flex-row items-center justify-between p-4 bg-gray-100 border-b border-gray-300">
            <div className="flex justify-center flex-1">
              <AdapterMenu id="adapter1" />
            </div>
            <div className="w-px h-8 bg-gray-400"></div>
            <div className="flex justify-center flex-1">
              <AdapterMenu id="adapter2" />
            </div>
          </div>

          {/* Attack Navigation Header */}
          <div className="flex flex-row items-center justify-center p-3 bg-gray-200 border-b border-gray-300">
            <button
              onClick={() => setActiveAttack('scan')}
              className={`flex-1 px-4 py-2 rounded-l text-sm font-medium ${
                activeAttack === 'scan' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Network Scan
            </button>
            <button
              onClick={() => setActiveAttack('deauth')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeAttack === 'deauth' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Deauth Attack
            </button>
            <button
              onClick={() => setActiveAttack('handshake')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeAttack === 'handshake' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Handshake Capture
            </button>
            <button
              onClick={() => setActiveAttack('eviltwin')}
              className={`flex-1 px-4 py-2 rounded-r text-sm font-medium ${
                activeAttack === 'eviltwin' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
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

import React, { createContext, useContext, useState } from "react";

interface AdapterContextType {
  selectedAdapters: Record<string, string>;
  selectAdapter: (id: string, adapter: string) => void;
}

const AdapterContext = createContext<AdapterContextType | undefined>(undefined);

export const AdapterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAdapters, setSelectedAdapters] = useState<Record<string, string>>({});

  const selectAdapter = (id: string, adapter: string) => {
    setSelectedAdapters((prev) => ({ ...prev, [id]: adapter }));
  };

  return (
    <AdapterContext.Provider value={{ selectedAdapters, selectAdapter }}>
      {children}
    </AdapterContext.Provider>
  );
};

export const useAdapterContext = () => {
  const context = useContext(AdapterContext);
  if (!context) throw new Error("useAdapterContext must be used within AdapterProvider");
  return context;
};

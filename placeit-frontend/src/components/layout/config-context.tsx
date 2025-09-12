'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface ConfigContextType {
  apiBaseUrl: string;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({
  children,
  apiBaseUrl,
}: {
  children: ReactNode;
  apiBaseUrl: string;
}) {
  return (
    <ConfigContext.Provider value={{ apiBaseUrl }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context)
    throw new Error('useConfig must be used within a ConfigProvider');
  return context;
}

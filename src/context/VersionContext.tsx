'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppVersionMode = '2.5.0' | '5.1.0';

interface VersionContextType {
  version: AppVersionMode;
  setVersion: (v: AppVersionMode) => void;
  isV5: boolean;
  versionName: string;
}

const VersionContext = createContext<VersionContextType>({
  version: '5.1.0',
  setVersion: () => {},
  isV5: true,
  versionName: 'GravityTune v5.1.0',
});

export const VersionProvider = ({ children }: { children: React.ReactNode }) => {
  const [version, setVersionState] = useState<AppVersionMode>('5.1.0');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if user previously explicitly selected a version
    const saved = localStorage.getItem('gravitytune_active_version') as AppVersionMode | null;
    if (saved === '2.5.0' || saved === '5.1.0') {
      setVersionState(saved);
      return;
    }

    // 2. Check environment variable if configured in Vercel
    const envVer = process.env.NEXT_PUBLIC_APP_VERSION;
    if (envVer === '2.5.0' || envVer === '5.1.0') {
      setVersionState(envVer);
      return;
    }

    // 3. Auto-detect from domain hostname:
    // If opened via gravity-tune-three -> Default to 2.5.0
    // If opened via gravity-tune-v5 or local -> Default to 5.1.0
    const host = window.location.hostname;
    if (host.includes('three') || host.includes('v2')) {
      setVersionState('2.5.0');
    } else {
      setVersionState('5.1.0');
    }
  }, []);

  const setVersion = (v: AppVersionMode) => {
    setVersionState(v);
    try {
      localStorage.setItem('gravitytune_active_version', v);
    } catch (_) {}
  };

  const isV5 = version === '5.1.0';
  const versionName = isV5 
    ? 'GravityTune v5.1.0 (Liquid Glass & Podcasts)' 
    : 'GravityTune v2.5.0 (Classic Lightweight)';

  return (
    <VersionContext.Provider value={{ version, setVersion, isV5, versionName }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);

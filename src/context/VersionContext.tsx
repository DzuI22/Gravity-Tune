'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppVersionMode = '2.5.0' | '5.1.0' | '7.5.3';

interface VersionContextType {
  version: AppVersionMode;
  setVersion: (v: AppVersionMode) => void;
  isV5: boolean;
  isV7: boolean;
  versionName: string;
}

const VersionContext = createContext<VersionContextType>({
  version: '7.5.3',
  setVersion: () => {},
  isV5: false,
  isV7: true,
  versionName: 'GravityTune v7.5.3 (Warm Amber OLED & Apple Music Lyrics)',
});

export const VersionProvider = ({ children }: { children: React.ReactNode }) => {
  const [version, setVersionState] = useState<AppVersionMode>('7.5.3');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if user previously explicitly selected a version
    const saved = localStorage.getItem('gravitytune_active_version') as AppVersionMode | null;
    if (saved === '2.5.0' || saved === '5.1.0' || saved === '7.5.3') {
      setVersionState(saved);
      return;
    }

    // 2. Check environment variable if configured in Vercel
    const envVer = process.env.NEXT_PUBLIC_APP_VERSION as AppVersionMode | undefined;
    if (envVer === '2.5.0' || envVer === '5.1.0' || envVer === '7.5.3') {
      setVersionState(envVer);
      return;
    }

    // 3. Auto-detect from domain hostname:
    const host = window.location.hostname;
    if (host.includes('three') || host.includes('v2')) {
      setVersionState('2.5.0');
    } else if (host.includes('v5')) {
      setVersionState('5.1.0');
    } else {
      setVersionState('7.5.3');
    }
  }, []);

  const setVersion = (v: AppVersionMode) => {
    setVersionState(v);
    try {
      localStorage.setItem('gravitytune_active_version', v);
    } catch (_) {}
  };

  const isV5 = version === '5.1.0';
  const isV7 = version === '7.5.3';
  const versionName = isV7
    ? 'GravityTune v7.5.3 (Warm Amber OLED & Apple Music Lyrics)'
    : isV5
    ? 'GravityTune v5.1.0 (Liquid Glass & Podcasts)'
    : 'GravityTune v2.5.0 (Classic Lightweight)';

  return (
    <VersionContext.Provider value={{ version, setVersion, isV5, isV7, versionName }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);

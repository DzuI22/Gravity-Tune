'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => console.log('[GravityTune] Service Worker registered:', reg.scope))
        .catch(err => console.warn('[GravityTune] SW registration failed:', err));
    }
  }, []);
  return null;
}

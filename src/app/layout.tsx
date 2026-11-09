import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import { AuthProvider } from '@/context/AuthContext';
import AmbientBackground from '@/components/AmbientBackground';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import AuthModal from '@/components/AuthModal';
import PWAInstaller from '@/components/PWAInstaller';

export const metadata: Metadata = {
  title: 'GravityTune - Audiophile Music Player',
  description: 'Streaming music player with Apple Music & Spotify modern aesthetics, live synced lyrics, and artist search.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GravityTune',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen relative text-foreground selection:bg-rose-500 selection:text-white">
        <AuthProvider>
          <PlayerProvider>
            <AmbientBackground />
            {children}
            <MiniPlayer />
            <FullPlayer />
            <AuthModal />
            <PWAInstaller />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

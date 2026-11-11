import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import { AuthProvider } from '@/context/AuthContext';
import { VersionProvider } from '@/context/VersionContext';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import PWAInstaller from '@/components/PWAInstaller';
import UpdateChecker from '@/components/UpdateChecker';

export const metadata: Metadata = {
  title: 'GravityTune - Next-Gen Music Player',
  description: 'Modern audiophile YouTube Music web player with GravityTune UI — Mood & Genres, Live Lyrics, 2026 Recap, and more.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GravityTune',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0e0d0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-[#0e0d0c] text-[#ede9dc] selection:bg-[#d1e289] selection:text-black">
        <VersionProvider>
          <AuthProvider>
            <PlayerProvider>
              {children}
              <MiniPlayer />
              <FullPlayer />
              <PWAInstaller />
              <UpdateChecker />
            </PlayerProvider>
          </AuthProvider>
        </VersionProvider>
      </body>
    </html>
  );
}

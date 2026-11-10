import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PlayerProvider } from '@/context/PlayerContext';
import { AuthProvider } from '@/context/AuthContext';
import MiniPlayer from '@/components/MiniPlayer';
import FullPlayer from '@/components/FullPlayer';
import PWAInstaller from '@/components/PWAInstaller';

export const metadata: Metadata = {
  title: 'ArchiveTune - YouTube Music Player',
  description: 'High-performance YouTube Music web player with ArchiveTune UI — Mood & Genres, Live Lyrics, 2026 Recap, and more.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ArchiveTune',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
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
        <AuthProvider>
          <PlayerProvider>
            {children}
            <MiniPlayer />
            <FullPlayer />
            <PWAInstaller />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

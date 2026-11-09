'use client';

import React from 'react';
import { usePlayer } from '@/context/PlayerContext';

export default function AmbientBackground() {
  const { ambientColor, isPlaying } = usePlayer();

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000 ease-out">
      {/* Dynamic ambient color mesh gradient */}
      <div
        className="absolute -top-[30%] -left-[20%] w-[90vw] h-[90vw] rounded-full blur-[140px] opacity-40 transition-all duration-1000 ease-in-out"
        style={{
          background: ambientColor,
          animation: isPlaying ? 'float 12s ease-in-out infinite alternate' : 'none',
        }}
      />
      <div
        className="absolute top-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-full blur-[160px] opacity-25 transition-all duration-1000 ease-in-out"
        style={{
          background: ambientColor,
          animation: isPlaying ? 'float 16s ease-in-out infinite alternate-reverse' : 'none',
        }}
      />
      {/* Dark vignette overlay for contrast and focus */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#09090b]/95" />
    </div>
  );
}

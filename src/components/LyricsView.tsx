'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { Sparkles } from 'lucide-react';

export default function LyricsView() {
  const { lyrics, currentLyricIndex, seek, currentSong } = usePlayer();
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth auto-scroll active lyric to center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLyricIndex]);

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 text-center p-8">
        <Sparkles className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No song playing</p>
      </div>
    );
  }

  if (!lyrics || lyrics.lines.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 text-center p-8">
        <p className="text-base font-semibold text-white/60 mb-1">Lyrics Not Found</p>
        <p className="text-xs text-white/40 max-w-xs">
          Synchronized lyrics for this track could not be loaded from LRCLIB.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-12 space-y-6 scroll-smooth select-none"
    >
      {lyrics.lines.map((line, idx) => {
        const isActive = idx === currentLyricIndex;
        const isPast = currentLyricIndex !== -1 && idx < currentLyricIndex;

        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => {
              if (lyrics.synced) {
                seek(line.time);
              }
            }}
            className={`transition-all duration-300 cursor-pointer text-left leading-relaxed ${
              isActive
                ? 'lyric-active text-2xl sm:text-3xl font-extrabold text-white scale-[1.02] origin-left'
                : isPast
                ? 'text-lg sm:text-xl font-bold text-white/40 hover:text-white/70'
                : 'text-lg sm:text-xl font-bold text-white/25 hover:text-white/60'
            }`}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
}

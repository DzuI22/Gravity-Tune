'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Mic2, Heart } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';

export default function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isFavorite,
    toggleFavorite,
    setIsFullPlayerOpen,
    setIsLyricsOpen,
    isLyricsOpen,
  } = usePlayer();

  if (!currentSong) return null;

  const isFav = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-3 left-3 right-3 md:left-68 md:right-6 z-30">
      <div className="glass-panel rounded-2xl px-4 py-3 shadow-2xl flex flex-col gap-2 border border-white/10 backdrop-blur-2xl">
        {/* Progress Bar (interactive slider) */}
        <div className="relative w-full group flex items-center h-2 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Song Info (Click to open full player) */}
          <div
            onClick={() => setIsFullPlayerOpen(true)}
            className="flex items-center gap-3 min-w-0 max-w-[40%] cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 shadow-md">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                {currentSong.title}
              </h4>
              <p className="text-xs text-white/50 truncate font-medium">
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentSong);
              }}
              className="hidden sm:block p-1 text-white/40 hover:text-rose-400 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={prevSong}
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Previous Song"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={nextSong}
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Next Song"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-white/40 mt-1">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Live Lyrics Button */}
            <button
              onClick={() => {
                setIsFullPlayerOpen(true);
                setIsLyricsOpen(true);
              }}
              className={`p-2 rounded-xl transition-all ${
                isLyricsOpen ? 'bg-rose-500/20 text-rose-400' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-5 h-5" />
            </button>

            {/* Volume control */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Expand button */}
            <button
              onClick={() => setIsFullPlayerOpen(true)}
              className="text-white/60 hover:text-white transition-colors p-2"
              title="Full Screen Player"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

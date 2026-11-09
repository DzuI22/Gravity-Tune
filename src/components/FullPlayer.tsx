'use client';

import React, { useState } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2, ListMusic, Heart } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';
import LyricsView from './LyricsView';

export default function FullPlayer() {
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
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    isLyricsOpen,
    setIsLyricsOpen,
    queue,
    playSong,
    ambientColor,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics');

  if (!isFullPlayerOpen || !currentSong) return null;

  const isFav = isFavorite(currentSong.id);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-3xl text-white overflow-hidden transition-all duration-500">
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 opacity-40 blur-[150px] -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${ambientColor}, transparent 70%)`,
        }}
      />

      {/* Top Bar with dismiss button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
            Playing From Music Catalog
          </p>
          <p className="text-xs font-medium text-white/70 truncate max-w-xs">
            {currentSong.album || currentSong.artist}
          </p>
        </div>

        {/* Tab Switcher: Lyrics or Queue */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'lyrics' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'queue' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12 py-6 overflow-hidden max-w-7xl mx-auto w-full items-center">
        {/* Left column: Big Album Artwork & Meta */}
        <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[380px] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group">
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full mt-6 flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <h2 className="text-xl sm:text-2xl font-bold truncate text-white">
                {currentSong.title}
              </h2>
              <p className="text-sm sm:text-base text-white/60 font-medium truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
            <button
              onClick={() => toggleFavorite(currentSong)}
              className="p-2.5 rounded-full glass-pill hover:scale-105 transition-all text-white/70 hover:text-rose-400"
            >
              <Heart className={`w-6 h-6 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Scrub bar */}
          <div className="w-full mt-6 space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-white/50">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Large Controls */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <button
              onClick={prevSong}
              className="p-3 text-white/70 hover:text-white hover:scale-110 transition-all"
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="p-3 text-white/70 hover:text-white hover:scale-110 transition-all"
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 w-full max-w-xs mt-6">
            <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        {/* Right column: Interactive Synced Lyrics or Queue list */}
        <div className="h-[460px] md:h-[540px] glass-panel rounded-3xl overflow-hidden border border-white/10 relative">
          {activeTab === 'lyrics' ? (
            <LyricsView />
          ) : (
            <div className="h-full overflow-y-auto p-4 space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 py-2">
                Up Next ({queue.length})
              </p>
              {queue.map((song, i) => {
                const isSelected = song.id === currentSong.id;
                return (
                  <div
                    key={song.id + i}
                    onClick={() => playSong(song)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <img src={song.thumbnail} alt={song.title} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-rose-400' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-white/40 truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-white/40">{song.durationFormatted || '3:30'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

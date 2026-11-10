'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Heart,
  Loader2,
  Share2,
  MoreHorizontal,
  Shuffle,
  Repeat,
  Repeat1,
  Moon,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration } from '@/lib/utils';
import LyricsView from './LyricsView';

export default function FullPlayer() {
  const {
    currentSong,
    isPlaying,
    isBuffering,
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
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    sleepTimer,
    sleepTimerRemaining,
    setSleepTimer,
    queue,
    playSong,
    ambientColor,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('lyrics');
  const [mobileTab, setMobileTab] = useState<'player' | 'lyrics' | 'queue'>('player');
  const [showShareToast, setShowShareToast] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  if (!isFullPlayerOpen || !currentSong) return null;

  const isFav = isFavorite(currentSong.id);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?song=${currentSong.id}` : '';
    const shareText = `Dengarkan lagu "${currentSong.title}" dari ${currentSong.artist} di GravityTune!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (_) {}
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      } catch (_) {}
    }
  };

  const sleepTimerMinutes = [15, 30, 45, 60];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0d0e]/95 backdrop-blur-3xl text-[#ede9dc] overflow-hidden transition-all duration-500 font-sans">
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 opacity-35 blur-[160px] -z-10 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${ambientColor}, transparent 70%)`,
        }}
      />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 relative z-10">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2.5 rounded-full hover:bg-white/10 text-[#ede9dc]/70 hover:text-white transition-colors"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#ede9dc]/40">
            PLAYING FROM MUSIC CATALOG
          </p>
          <p className="text-xs font-semibold text-[#ede9dc]/80 truncate max-w-xs mt-0.5">
            {currentSong.album || currentSong.artist}
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 bg-white/[0.08] p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'lyrics' ? 'bg-[#ede9dc] text-black shadow-md' : 'text-[#ede9dc]/60 hover:text-white'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'queue' ? 'bg-[#ede9dc] text-black shadow-md' : 'text-[#ede9dc]/60 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-12 py-5 overflow-y-auto max-w-7xl mx-auto w-full items-center">
        {/* Left column: Player Controller Styled Persis Seperti Foto */}
        <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-3 sm:space-y-5">
          {/* Album Artwork Cover OR Mobile Lyrics/Queue when toggled */}
          <div className="relative aspect-square w-full max-w-[200px] sm:max-w-[280px] md:max-w-[360px] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 group">
            {mobileTab === 'lyrics' ? (
              <div className="w-full h-full p-4 overflow-y-auto bg-black/60 backdrop-blur-md">
                <LyricsView />
              </div>
            ) : mobileTab === 'queue' ? (
              <div className="w-full h-full p-3 overflow-y-auto bg-black/60 backdrop-blur-md space-y-1">
                <p className="text-[11px] font-bold text-white/50 uppercase px-2 py-1">Daftar Putar ({queue.length})</p>
                {queue.map(s => (
                  <div
                    key={s.id}
                    onClick={() => playSong(s)}
                    className={`p-2 rounded-xl text-xs flex items-center gap-2.5 cursor-pointer ${
                      s.id === currentSong.id ? 'bg-white/20 text-rose-400 font-bold' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <img src={s.thumbnail} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="truncate flex-1 font-semibold">{s.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Title & Action Buttons Row (Persis seperti Foto Tulus - Teh Hijau) */}
          <div className="w-full flex items-center justify-between pt-1">
            <div className="min-w-0 pr-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ede9dc] tracking-tight truncate leading-tight">
                {currentSong.title}
              </h2>
              <p className="text-base text-[#a39f93] font-semibold truncate mt-1">
                {currentSong.artist}
              </p>
            </div>

            {/* 3 Squircle Action Buttons: Share, Heart, More */}
            <div className="flex items-center gap-2 flex-shrink-0 relative">
              {/* Share button */}
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                title="Bagikan Lagu"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Heart favorite button */}
              <button
                onClick={() => toggleFavorite(currentSong)}
                className="w-12 h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                title="Favorit"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* More button */}
              <button
                onClick={() => setIsMoreMenuOpen(prev => !prev)}
                className="w-12 h-12 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 shadow-sm"
                title="Lainnya"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* More Menu Dropdown */}
              {isMoreMenuOpen && (
                <div className="absolute right-0 top-14 w-48 bg-[#1a1917] border border-white/10 rounded-2xl shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      handleShare();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-white"
                  >
                    <Share2 className="w-4 h-4 text-rose-400" />
                    <span>Salin Link Lagu</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSleepModalOpen(true);
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-white"
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Atur Timer Tidur</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress / Scrubber Bar (Persis seperti Foto) */}
          <div className="w-full space-y-1.5">
            <div className="relative w-full h-3 flex items-center cursor-pointer group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="w-full h-2.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#ede9dc] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#a39f93]">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* 5 Controller Row: Shuffle, Prev, Big Round Play, Next, Repeat (Persis Foto) */}
          <div className="w-full flex items-center justify-between gap-3 pt-2">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all border border-white/5 active:scale-95 ${
                isShuffle ? 'bg-white/25 text-rose-400 shadow-md' : 'bg-white/[0.08] text-[#ede9dc]/70 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle Aktif' : 'Acak Lagu'}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Prev */}
            <button
              onClick={prevSong}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 active:scale-95"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            {/* Big Round Play / Pause Button in Center */}
            <button
              onClick={togglePlay}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#ede9dc] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/60"
              title={isBuffering ? 'Buffering...' : isPlaying ? 'Pause' : 'Play'}
            >
              {isBuffering ? (
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSong}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-[#ede9dc] flex items-center justify-center transition-all border border-white/5 active:scale-95"
              title="Lagu Selanjutnya"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all border border-white/5 active:scale-95 ${
                repeatMode !== 'off' ? 'bg-white/25 text-rose-400 shadow-md' : 'bg-white/[0.08] text-[#ede9dc]/70 hover:text-white'
              }`}
              title={repeatMode === 'one' ? 'Ulangi 1 Lagu' : repeatMode === 'all' ? 'Ulangi Semua' : 'Repeat Mati'}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Bottom Bar: Queue Pill, Sleep Timer Circle, Lyrics Pill (Persis Foto) */}
          <div className="w-full flex items-center justify-between gap-3 pt-3">
            {/* Queue Pill */}
            <button
              onClick={() => {
                setActiveTab('queue');
                setMobileTab(prev => (prev === 'queue' ? 'player' : 'queue'));
              }}
              className={`flex-1 py-3.5 px-4 rounded-3xl flex items-center justify-center gap-2 text-sm font-extrabold transition-all border border-white/5 active:scale-95 ${
                activeTab === 'queue' && (mobileTab === 'queue' || typeof window !== 'undefined' && window.innerWidth >= 768)
                  ? 'bg-[#ede9dc] text-black shadow-lg'
                  : 'bg-white/[0.08] text-[#ede9dc] hover:bg-white/[0.14]'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>Queue</span>
            </button>

            {/* Sleep Timer Moon Circle Button */}
            <button
              onClick={() => setIsSleepModalOpen(true)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border border-white/5 relative active:scale-95 ${
                sleepTimerRemaining ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/[0.08] text-[#ede9dc] hover:bg-white/[0.14]'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-5 h-5" />
              {sleepTimerRemaining && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-[10px] text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">
                  {Math.ceil(sleepTimerRemaining / 60)}m
                </span>
              )}
            </button>

            {/* Lyrics Pill */}
            <button
              onClick={() => {
                setActiveTab('lyrics');
                setMobileTab(prev => (prev === 'lyrics' ? 'player' : 'lyrics'));
              }}
              className={`flex-1 py-3.5 px-4 rounded-3xl flex items-center justify-center gap-2 text-sm font-extrabold transition-all border border-white/5 active:scale-95 ${
                activeTab === 'lyrics' && (mobileTab === 'lyrics' || typeof window !== 'undefined' && window.innerWidth >= 768)
                  ? 'bg-[#ede9dc] text-black shadow-lg'
                  : 'bg-white/[0.08] text-[#ede9dc] hover:bg-white/[0.14]'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>Lyrics</span>
            </button>
          </div>
        </div>

        {/* Right column: Interactive Synced Lyrics OR Queue list (Visible on Desktop / Tablets) */}
        <div className="hidden md:block h-[560px] glass-panel rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
          {activeTab === 'lyrics' ? (
            <LyricsView />
          ) : (
            <div className="h-full overflow-y-auto p-4 space-y-1 scrollbar-none">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  Daftar Putar ({queue.length})
                </p>
                {isShuffle && (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                    Shuffle Aktif
                  </span>
                )}
              </div>
              {queue.map((song, i) => {
                const isSelected = song.id === currentSong.id;
                return (
                  <div
                    key={song.id + i}
                    onClick={() => playSong(song)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                      isSelected ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <img src={song.thumbnail} alt={song.title} className="w-11 h-11 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-rose-400' : 'text-white'}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-white/50 truncate mt-0.5">{song.artist}</p>
                    </div>
                    <span className="text-xs text-white/40 font-medium">{song.durationFormatted || '3:30'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {isSleepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#181715] border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Timer Tidur</h3>
              </div>
              <button
                onClick={() => setIsSleepModalOpen(false)}
                className="text-xs font-bold text-white/50 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-white/60">
              Pilih waktu pemutaran lagu otomatis berhenti saat Anda tertidur:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {sleepTimerMinutes.map(min => (
                <button
                  key={min}
                  onClick={() => {
                    setSleepTimer(min);
                    setIsSleepModalOpen(false);
                  }}
                  className={`p-3.5 rounded-2xl text-xs font-bold border transition-all ${
                    sleepTimer === min
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/5'
                  }`}
                >
                  {min} Menit
                </button>
              ))}
            </div>

            {sleepTimerRemaining && (
              <button
                onClick={() => {
                  setSleepTimer(null);
                  setIsSleepModalOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all border border-rose-500/30"
              >
                Matikan Timer Tidur
              </button>
            )}
          </div>
        </div>
      )}

      {/* Share Copied Toast */}
      {showShareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#ede9dc] text-black px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Tautan lagu berhasil disalin ke clipboard!</span>
        </div>
      )}
    </div>
  );
}

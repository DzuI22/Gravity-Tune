'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Sparkles, Share2, Music2, Disc, User, Clock, Check, TrendingUp } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'recap'>('stats');
  const [totalSeconds, setTotalSeconds] = useState(180);
  const [totalPlays, setTotalPlays] = useState(12);
  const [copied, setCopied] = useState(false);
  const { currentSong, favorites } = usePlayer();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSec = parseInt(localStorage.getItem('gravity_total_listen_time') || '180', 10);
      const savedPlays = parseInt(localStorage.getItem('gravity_total_plays') || '12', 10);
      setTotalSeconds(savedSec);
      setTotalPlays(savedPlays);
    } catch (_) {}
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const topArtist = currentSong?.artist || 'Yuika';
  const topSong = currentSong?.title || 'Love Story (Taylor Swift)';
  const topThumb = currentSong?.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop';

  const handleShareCard = async () => {
    const text = `🎵 My 2026 Music Recap on GravityTune:\n⏱️ Total Listen Time: ${minutes} minutes\n⭐ Top Artist: ${topArtist}\n🔥 Top Song: ${topSong}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: '2026 Recap', text });
        return;
      } catch (_) {}
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] bg-[#141212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#ede9dc] font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-1.5 text-[#ede9dc]">
                Stats <Sparkles className="w-4 h-4 text-[#d1e289]" />
              </h3>
              <p className="text-[11px] text-[#9e9a8f]">Your top songs, artists, and playback history</p>
            </div>
          </div>

          {/* Switcher Tab */}
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-full text-xs">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'stats' ? 'bg-[#d1e289] text-black shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setActiveTab('recap')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                activeTab === 'recap' ? 'bg-[#d1e289] text-black shadow' : 'text-white/60 hover:text-white'
              }`}
            >
              2026 Recap
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'stats' ? (
            <>
              {/* Total Time Listened Card (Styled like Photo 5) */}
              <div className="w-full bg-[#522222]/90 border border-rose-500/20 rounded-2xl p-4 text-white shadow-lg">
                <p className="text-xs font-semibold text-rose-200/80">Total Time Listened</p>
                <h1 className="text-4xl font-extrabold tracking-tight mt-1">{formattedTime}</h1>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3 text-center">
                  <p className="text-xl font-extrabold text-[#d1e289]">{totalPlays}</p>
                  <p className="text-[10px] font-semibold text-[#9e9a8f] mt-0.5">Total Plays</p>
                </div>
                <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3 text-center">
                  <p className="text-xl font-extrabold text-[#ede9dc]">{Math.max(favorites.length, 3)}</p>
                  <p className="text-[10px] font-semibold text-[#9e9a8f] mt-0.5">Unique Songs</p>
                </div>
                <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3 text-center">
                  <p className="text-xl font-extrabold text-[#ede9dc]">4</p>
                  <p className="text-[10px] font-semibold text-[#9e9a8f] mt-0.5">Unique Artists</p>
                </div>
              </div>

              {/* Artist Breakdown Donut Chart */}
              <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#ede9dc]">Artist breakdown</h4>
                  <span className="text-[11px] font-bold text-[#9e9a8f]">100%</span>
                </div>

                <div className="flex items-center gap-5">
                  {/* SVG Donut Chart */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2a2725" strokeWidth="4.5" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="4.5"
                        strokeDasharray="65, 100"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#d1e289"
                        strokeWidth="4.5"
                        strokeDasharray="35, 100"
                        strokeDashoffset="-65"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-white font-semibold truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        {topArtist}
                      </span>
                      <span className="text-[#9e9a8f] font-bold">65%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-white/80 font-semibold truncate">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d1e289] inline-block" />
                        Other Artists
                      </span>
                      <span className="text-[#9e9a8f] font-bold">35%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Favourite Artist Card */}
              <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <img src={topThumb} alt={topArtist} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-[#9e9a8f] uppercase">Your Favourite Artist</p>
                  <p className="text-sm font-extrabold text-[#ede9dc] truncate">{topArtist}</p>
                  <p className="text-xs text-white/50">{totalPlays} plays • {formattedTime}</p>
                </div>
              </div>

              {/* Your Favourite Song Card */}
              <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <img src={topThumb} alt={topSong} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-[#9e9a8f] uppercase">Your Favourite Song</p>
                  <p className="text-sm font-extrabold text-[#ede9dc] truncate">{topSong}</p>
                  <p className="text-xs text-white/50">{Math.ceil(totalPlays / 2)} times played</p>
                </div>
              </div>
            </>
          ) : (
            /* 2026 Recap Card (Matches Photo 6 Right) */
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden p-6 text-center shadow-2xl border border-white/20 bg-gradient-to-b from-[#8ab4f8] via-[#e8b4d8] to-[#fbcfe8] text-black">
                <p className="text-xs font-black tracking-widest uppercase text-black/60">2026 RECAP</p>
                <h2 className="text-xl font-black mt-1 text-black tracking-tight">MY MUSICAL PASSPORT</h2>

                {/* Top Artists Avatars */}
                <div className="my-5 flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <img src={topThumb} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                    <span className="text-[10px] font-extrabold bg-[#d1e289] text-black px-2 py-0.5 rounded-full -mt-2 shadow">
                      Top Artist
                    </span>
                    <p className="text-xs font-bold text-black mt-1 truncate max-w-[80px]">{topArtist}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <img src={topThumb} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md" />
                    <span className="text-[10px] font-extrabold bg-[#d1e289] text-black px-2 py-0.5 rounded-full -mt-2 shadow">
                      Top Song
                    </span>
                    <p className="text-xs font-bold text-black mt-1 truncate max-w-[80px]">{topSong}</p>
                  </div>
                </div>

                {/* Listening Time */}
                <div className="pt-2">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-black/60">LISTENING TIME</p>
                  <p className="text-3xl font-black text-black">{minutes}</p>
                  <p className="text-xs font-black uppercase text-black/70">MINUTES</p>
                </div>

                <div className="mt-5 text-[10px] font-bold text-black/50">
                  GravityTune • 2026 Music Recap
                </div>
              </div>

              {/* Share Card Button */}
              <button
                onClick={handleShareCard}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Share card'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

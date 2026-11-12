import React, { useState, useEffect } from 'react';
import {
  Moon,
  Battery,
  Lock,
  Unlock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronRight,
  Clock as ClockIcon
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration, getHdThumbnail } from '@/lib/utils';

interface SleepLockOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SleepLockOverlay({ isOpen, onClose }: SleepLockOverlayProps) {
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, isBuffering } = usePlayer();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(60);
  const [sliderPos, setSliderPos] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Live Digital Clock
  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Real Battery API
  useEffect(() => {
    if (!isOpen) return;
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {
        setBatteryLevel(60);
      });
    } else {
      setBatteryLevel(60);
    }
  }, [isOpen]);

  if (!isOpen || !currentSong) return null;

  const hdThumb = getHdThumbnail(currentSong.thumbnail, currentSong.id);

  // Handle slide to unlock
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const track = document.getElementById('slide-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const max = rect.width - 56;
    const current = Math.max(0, Math.min(clientX - rect.left - 28, max));
    setSliderPos(current);

    if (current >= max * 0.88) {
      setIsDragging(false);
      setSliderPos(0);
      onClose();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setSliderPos(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between p-6 select-none animate-in fade-in duration-500 overflow-hidden"
      onMouseMove={handleTouchMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Dynamic Background Glow with Pitch Black Center */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 mix-blend-screen"
          style={{ backgroundColor: '#d1e289' }}
        />
        <div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[140px] opacity-15 mix-blend-screen"
          style={{ backgroundColor: '#eab308' }}
        />
      </div>

      {/* Top Bar: Battery & Status */}
      <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-white/70 pt-2 px-2">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-[#d1e289]" />
          <span className="tracking-wide">In-App Sleep Mode</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
          <Battery className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white">{batteryLevel !== null ? `${batteryLevel}%` : '60%'}</span>
        </div>
      </div>

      {/* Center: Big Digital Clock & Date */}
      <div className="relative z-10 text-center my-auto space-y-4">
        <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_25px_rgba(209,226,137,0.3)]">
          {timeStr || '5:03 PM'}
        </h1>
        <p className="text-sm font-semibold text-[#ede9dc]/70 uppercase tracking-widest">
          {dateStr || 'Kamis, 12 Nov 2026'}
        </p>

        {/* Floating Glowing Artwork */}
        <div className="py-6 flex justify-center">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-[36px] overflow-hidden shadow-[0_15px_60px_rgba(209,226,137,0.25)] border-2 border-white/20 animate-pulse">
            <img src={hdThumb} alt={currentSong.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <p className="text-sm font-extrabold text-white truncate">{currentSong.title}</p>
              <p className="text-xs text-[#d1e289] font-medium truncate">{currentSong.artist}</p>
            </div>
          </div>
        </div>

        {/* Compact Player Controls */}
        <div className="flex items-center justify-center gap-8 pt-2">
          <button
            onClick={prevSong}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
            title="Lagu Sebelumnya"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-[#d1e289] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#d1e289]/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>
          <button
            onClick={nextSong}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center active:scale-95 transition-all"
            title="Lagu Selanjutnya"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom: Slide to Unlock Bar */}
      <div className="relative z-10 max-w-sm w-full mx-auto pb-4">
        <div
          id="slide-track"
          className="relative h-14 bg-white/10 border border-white/20 rounded-full flex items-center px-2 overflow-hidden shadow-inner cursor-pointer"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold tracking-widest text-white/50 uppercase flex items-center gap-1.5 animate-pulse">
              Slide to Unlock &gt;&gt;&gt;
            </span>
          </div>

          <div
            className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center shadow-lg transition-transform duration-75 relative z-10"
            style={{ transform: `translateX(${sliderPos}px)` }}
          >
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </div>
        </div>
      </div>
    </div>
  );
}

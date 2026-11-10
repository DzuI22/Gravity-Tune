'use client';

import React, { useState } from 'react';
import { X, Settings, Volume2, Shield, Moon, Trash2, Smartphone, Sparkles, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [audioQuality, setAudioQuality] = useState<'high' | 'normal' | 'data_saver'>('high');
  const [cleared, setCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        setCleared(true);
        setTimeout(() => setCleared(false), 2500);
      } catch (_) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#141212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#ede9dc] font-sans">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#d1e289]" />
            <h3 className="text-base font-extrabold text-[#ede9dc]">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Audio Quality */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9e9a8f]">Audio Quality</p>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'normal', 'data_saver'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setAudioQuality(q)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                    audioQuality === q
                      ? 'bg-[#d1e289] text-black border-[#d1e289] shadow'
                      : 'bg-[#1f1c1b] text-white/70 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {q.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Display */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9e9a8f]">Interface & Theme</p>
            <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Moon className="w-4 h-4 text-[#d1e289]" />
                <span className="font-semibold text-xs">OLED Pure Dark</span>
              </div>
              <span className="text-[11px] font-bold text-[#d1e289] bg-[#d1e289]/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>

          {/* Offline & Cache */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9e9a8f]">Storage & Cache</p>
            <button
              onClick={handleClearCache}
              className="w-full bg-[#1f1c1b] hover:bg-[#282523] border border-white/5 rounded-2xl p-3 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-xs text-white">Clear Offline Cache & Data</span>
              </div>
              {cleared ? (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Cleared
                </span>
              ) : (
                <span className="text-[11px] text-[#9e9a8f]">Tap to clear</span>
              )}
            </button>
          </div>

          {/* About */}
          <div className="bg-[#1f1c1b]/60 border border-white/5 rounded-2xl p-3.5 text-xs space-y-1 text-[#9e9a8f]">
            <p className="font-bold text-[#ede9dc]">GravityTune Web v2.5</p>
            <p>High performance YouTube Music web player with next-gen audio engine.</p>
            <p className="text-[10px] text-white/40 pt-1">Free open-source deployment on Vercel</p>
          </div>
        </div>
      </div>
    </div>
  );
}

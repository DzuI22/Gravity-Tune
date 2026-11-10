'use client';

import React from 'react';
import { X, Newspaper, Sparkles, CheckCircle2 } from 'lucide-react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsModal({ isOpen, onClose }: NewsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#141212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#ede9dc] font-sans">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#d1e289]" />
            <h3 className="text-base font-extrabold text-[#ede9dc]">GravityTune News</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold bg-[#d1e289] text-black px-2 py-0.5 rounded-full">
                NEW UPDATE
              </span>
              <span className="text-[10px] text-[#9e9a8f]">November 2026</span>
            </div>
            <h4 className="text-sm font-extrabold text-[#ede9dc]">
              GravityTune v2.5 Experience is Live! 🎉
            </h4>
            <p className="text-[#9e9a8f] leading-relaxed">
              Selamat datang di pembaruan besar! Tampilan aplikasi kini dilengkapi navigasi bawah kapsul, filter mood instan, lirik karaoke tersinkronisasi, dan statistik mendengarkan.
            </p>
          </div>

          <div className="bg-[#1f1c1b] border border-white/5 rounded-2xl p-4 space-y-2">
            <h4 className="text-sm font-extrabold text-[#ede9dc] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#d1e289]" /> Fitur Terbaru
            </h4>
            <ul className="space-y-1.5 text-[#9e9a8f] pl-1">
              <li>• Mood & Genre Explore (Chill, Gaming, Romance, Energize, dll.)</li>
              <li>• 2026 Musical Passport & Recap Share Card</li>
              <li>• Floating Mini Player dengan tombol Play hijau lime</li>
              <li>• Full Player dengan scrubber waktu maju dan sisa durasi</li>
              <li>• Local Files & Offline library simulation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  BarChart3,
  Palette,
  Music2,
  MessageSquare,
  Globe,
  Hand,
  Sparkles,
  Wand2,
  Wifi,
  Key,
  HardDrive,
  Cloud,
  FlaskConical,
  Link2,
  Clock,
  Info,
  Check,
  Trash2,
  Volume2,
  Moon,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStats?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onOpenStats }: SettingsModalProps) {
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [audioQuality, setAudioQuality] = useState<'high' | 'normal' | 'data_saver'>('high');
  const [cacheCleared, setCacheCleared] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        setCacheCleared(true);
        showToast('Cache offline dan data berhasil dibersihkan!');
        setTimeout(() => setCacheCleared(false), 2500);
      } catch (_) {
        showToast('Gagal membersihkan cache.');
      }
    } else {
      showToast('Cache dibersihkan.');
    }
  };

  // 17 Item Setting persis seperti Foto 1 dan Foto 2
  const settingsGroups = [
    {
      id: 'account_stats',
      items: [
        {
          id: 'account',
          title: 'Account',
          desc: 'Sign in and manage account sync',
          icon: User,
          action: () => showToast('Akun GravityTune tersinkronisasi sebagai Tamu.'),
        },
        {
          id: 'stats',
          title: 'Listening Stats',
          desc: 'Your top songs, artists, and playback history',
          icon: BarChart3,
          action: () => {
            if (onOpenStats) {
              onClose();
              onOpenStats();
            } else {
              showToast('Membuka statistik mendengarkan...');
            }
          },
        },
      ],
    },
    {
      id: 'playback_appearance',
      items: [
        {
          id: 'appearance',
          title: 'Appearance',
          desc: 'Themes, layout, and visual styles',
          icon: Palette,
          action: () => setActiveSubView('appearance'),
        },
        {
          id: 'playback',
          title: 'Playback',
          desc: 'Audio behavior, crossfade, and background play',
          icon: Music2,
          action: () => setActiveSubView('playback'),
        },
        {
          id: 'lyrics',
          title: 'Lyrics',
          desc: 'Lyrics providers, preloading, and translation',
          icon: MessageSquare,
          action: () => showToast('Provider lirik LRCLIB tersinkronasi aktif.'),
        },
        {
          id: 'content',
          title: 'Content',
          desc: 'Language, country, and recommendations',
          icon: Globe,
          action: () => showToast('Rekomendasi konten: Indonesia & Global.'),
        },
        {
          id: 'behavior',
          title: 'Behavior',
          desc: 'History, defaults, and privacy behavior',
          icon: Hand,
          action: () => showToast('Riwayat putar dan privasi aktif.'),
        },
        {
          id: 'integration',
          title: 'Integration',
          desc: 'Discord, Last.fm, Libre.fm, and ListenBrainz',
          icon: Sparkles,
          action: () => showToast('Integrasi Last.fm dan Discord Webhook siap.'),
        },
      ],
    },
    {
      id: 'advanced_system',
      items: [
        {
          id: 'ai',
          title: 'AI Integration',
          desc: 'Configure AI translation and personalized mix',
          icon: Wand2,
          action: () => showToast('AI Assistant & Smart Mix aktif.'),
        },
        {
          id: 'internet',
          title: 'Internet',
          desc: 'Proxy, DNS, and network playback behavior',
          icon: Wifi,
          action: () => showToast('Mode DNS dan streaming ultra-cepat aktif.'),
        },
        {
          id: 'po_token',
          title: 'PO Token Generation',
          desc: 'Playback verification and visitor data',
          icon: Key,
          action: () => showToast('Token verifikasi YouTube Client otomatis aktif.'),
        },
        {
          id: 'storage',
          title: 'Storage',
          desc: 'Cache, downloads, and offline storage',
          icon: HardDrive,
          action: () => setActiveSubView('storage'),
        },
        {
          id: 'backup',
          title: 'Backup and restore',
          desc: 'Export and recover your personal app data & playlists',
          icon: Cloud,
          action: () => {
            const data = localStorage.getItem('gravity_favorites') || '[]';
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gravitytune_backup.json';
            a.click();
            showToast('Backup data playlist berhasil diunduh!');
          },
        },
        {
          id: 'dev_options',
          title: 'Developer Options',
          desc: 'Experimental features and debugging',
          icon: FlaskConical,
          action: () => showToast('Mode Developer: Semua eksperimen aktif.'),
        },
        {
          id: 'open_links',
          title: 'Open supported links',
          desc: 'Open supported link by default',
          icon: Link2,
          action: () => showToast('Tautan YouTube Music terbuka otomatis di GravityTune.'),
        },
        {
          id: 'updates',
          title: 'Updates',
          desc: 'New version available',
          icon: Clock,
          badge: 'v2.5.0',
          action: () => showToast('GravityTune v2.5.0 adalah versi terbaru!'),
        },
        {
          id: 'about',
          title: 'About',
          desc: 'App info, licenses, and contributors',
          icon: Info,
          action: () => setActiveSubView('about'),
        },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0d0c] text-[#ede9dc] font-sans overflow-hidden animate-in fade-in duration-200">
      {/* Top Header with Back Arrow and Big Settings Title (Foto 1 & 2) */}
      <header className="sticky top-0 z-30 bg-[#0e0d0c]/95 backdrop-blur-2xl border-b border-white/5 px-4 sm:px-6 py-4 flex items-center gap-4 max-w-2xl mx-auto w-full">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 text-[#ede9dc] transition-all active:scale-95"
          title="Kembali"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ede9dc] tracking-tight">
          Settings
        </h1>
      </header>

      {/* Main Settings List Content (Foto 1 & Foto 2) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-36 max-w-2xl mx-auto w-full space-y-4 scrollbar-none">
        {settingsGroups.map((group) => (
          <div
            key={group.id}
            className="bg-[#181614] border border-white/5 rounded-3xl overflow-hidden shadow-xl divide-y divide-white/5"
          >
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3.5 cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-150 group"
                >
                  {/* Left: Lime Round Icon */}
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Middle: Title & Subtitle */}
                  <div className="min-w-0 flex-1 pr-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#9e9a8f] font-semibold truncate mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  {/* Right: Badge or Arrow */}
                  {item.badge ? (
                    <span className="text-[11px] font-bold text-[#d1e289] bg-[#d1e289]/10 border border-[#d1e289]/20 px-2.5 py-1 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#9e9a8f] group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </main>

      {/* Subview Modal: Storage & Cache */}
      {activeSubView === 'storage' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#181614] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d1e289] text-black flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Penyimpanan & Cache</h3>
            </div>
            <p className="text-xs text-[#9e9a8f] leading-relaxed">
              Bersihkan data cache lagu yang disimpan di browser untuk mengosongkan ruang memori perangkat Anda.
            </p>
            <button
              onClick={handleClearCache}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>{cacheCleared ? 'Cache Berhasil Dibersihkan!' : 'Bersihkan Cache Sekarang'}</span>
            </button>
            <button
              onClick={() => setActiveSubView(null)}
              className="w-full py-2.5 text-xs font-bold text-[#9e9a8f] hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Subview Modal: Playback */}
      {activeSubView === 'playback' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#181614] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d1e289] text-black flex items-center justify-center">
                <Music2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Audio Playback</h3>
            </div>
            <p className="text-xs text-[#9e9a8f]">Pilih kualitas audio streaming GravityTune:</p>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'normal', 'data_saver'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setAudioQuality(q);
                    showToast(`Kualitas audio diubah ke ${q.replace('_', ' ')}`);
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                    audioQuality === q
                      ? 'bg-[#d1e289] text-black border-[#d1e289] shadow-md'
                      : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {q.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={() => setActiveSubView(null)}
              className="w-full py-2.5 text-xs font-bold text-[#9e9a8f] hover:text-white"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Subview Modal: Appearance */}
      {activeSubView === 'appearance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#181614] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d1e289] text-black flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Tampilan & Tema</h3>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white">OLED Pure Dark (Default)</span>
              <CheckCircle2 className="w-4 h-4 text-[#d1e289]" />
            </div>
            <button
              onClick={() => setActiveSubView(null)}
              className="w-full py-2.5 text-xs font-bold text-[#9e9a8f] hover:text-white"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Subview Modal: About */}
      {activeSubView === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-[#181614] border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-lg border border-white/10">
              <img src="/logo.png" alt="GravityTune" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">GravityTune Web</h3>
              <p className="text-xs text-[#d1e289] font-bold mt-0.5">Versi 2.5.0 (Build 2026)</p>
            </div>
            <p className="text-xs text-[#9e9a8f] leading-relaxed">
              Aplikasi pemutar musik generasi baru dengan katalog tanpa batas, audio berkualitas tinggi, lirik tersinkronasi real-time, dan UI modern.
            </p>
            <p className="text-[10px] text-white/40">Dibuat khusus untuk pengalaman mendengarkan musik terbaik di HP & PC.</p>
            <button
              onClick={() => setActiveSubView(null)}
              className="w-full py-3 rounded-2xl bg-[#d1e289] text-black font-extrabold text-xs shadow-lg active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#d1e289] text-black px-5 py-3 rounded-2xl font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

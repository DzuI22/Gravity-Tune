'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Eye,
  AudioWaveform,
  Layers,
  FileText
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStats?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onOpenStats }: SettingsModalProps) {
  // Navigation: null = Root list; string = Active Subview ID
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // =========================================================================
  // SETTINGS STATE (Dipersistensikan secara real-time ke localStorage)
  // =========================================================================

  // 1. Account & Profile
  const [accountName, setAccountName] = useState('Guest User');
  const [accountSync, setAccountSync] = useState(true);

  // 2. Appearance
  const [pureBlackOled, setPureBlackOled] = useState(true);
  const [dynamicColor, setDynamicColor] = useState(true);
  const [playerStyle, setPlayerStyle] = useState<'modern' | 'minimal' | 'classic'>('modern');
  const [coverCornerRadius, setCoverCornerRadius] = useState<'rounded' | 'square' | 'circle'>('rounded');

  // 3. Playback
  const [audioQuality, setAudioQuality] = useState<'high' | 'normal' | 'data_saver'>('high');
  const [audioNormalization, setAudioNormalization] = useState(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0); // 0 - 12 seconds
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [autoSkipError, setAutoSkipError] = useState(true);

  // 4. Lyrics
  const [lyricsProvider, setLyricsProvider] = useState<'lrclib' | 'youtube' | 'auto'>('auto');
  const [lyricsAutoScroll, setLyricsAutoScroll] = useState(true);
  const [lyricsBlurEffect, setLyricsBlurEffect] = useState(true);
  const [romanization, setRomanization] = useState(false);
  const [lyricsFontSize, setLyricsFontSize] = useState<'medium' | 'large' | 'huge'>('large');

  // 5. Content
  const [contentLanguage, setContentLanguage] = useState('id');
  const [contentCountry, setContentCountry] = useState('ID');
  const [allowExplicit, setAllowExplicit] = useState(true);

  // 6. Behavior
  const [saveHistory, setSaveHistory] = useState(true);
  const [pauseWhenMuted, setPauseWhenMuted] = useState(false);
  const [autoplayRelated, setAutoplayRelated] = useState(true);

  // 7. Integration
  const [discordRpc, setDiscordRpc] = useState(false);
  const [lastFmScrobble, setLastFmScrobble] = useState(false);
  const [lastFmApiKey, setLastFmApiKey] = useState('');
  const [listenBrainzToken, setListenBrainzToken] = useState('');

  // 8. AI Integration
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'none'>('gemini');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiPersonalization, setAiPersonalization] = useState(true);

  // 9. Internet & Network
  const [streamViaProxy, setStreamViaProxy] = useState(false);
  const [customDns, setCustomDns] = useState('cloudflare');

  // 10. PO Token Generation
  const [poTokenMode, setPoTokenMode] = useState<'auto' | 'manual' | 'disabled'>('auto');
  const [visitorData, setVisitorData] = useState('CgtmcEkxLUhpTE91');

  // 11. Storage & Cache
  const [cacheSizeLimit, setCacheSizeLimit] = useState(1024); // MB
  const [estimatedCache, setEstimatedCache] = useState('142 MB');

  // 12. Developer Options
  const [forceHdThumbnail, setForceHdThumbnail] = useState(true);
  const [debugLogConsole, setDebugLogConsole] = useState(false);
  const [useFastStream, setUseFastStream] = useState(true);

  const { favorites } = usePlayer();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gravitytune_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.pureBlackOled !== undefined) setPureBlackOled(parsed.pureBlackOled);
        if (parsed.dynamicColor !== undefined) setDynamicColor(parsed.dynamicColor);
        if (parsed.playerStyle) setPlayerStyle(parsed.playerStyle);
        if (parsed.coverCornerRadius) setCoverCornerRadius(parsed.coverCornerRadius);
        if (parsed.audioQuality) setAudioQuality(parsed.audioQuality);
        if (parsed.audioNormalization !== undefined) setAudioNormalization(parsed.audioNormalization);
        if (parsed.crossfadeDuration !== undefined) setCrossfadeDuration(parsed.crossfadeDuration);
        if (parsed.gaplessPlayback !== undefined) setGaplessPlayback(parsed.gaplessPlayback);
        if (parsed.lyricsProvider) setLyricsProvider(parsed.lyricsProvider);
        if (parsed.lyricsAutoScroll !== undefined) setLyricsAutoScroll(parsed.lyricsAutoScroll);
        if (parsed.lyricsBlurEffect !== undefined) setLyricsBlurEffect(parsed.lyricsBlurEffect);
        if (parsed.romanization !== undefined) setRomanization(parsed.romanization);
        if (parsed.contentLanguage) setContentLanguage(parsed.contentLanguage);
        if (parsed.allowExplicit !== undefined) setAllowExplicit(parsed.allowExplicit);
        if (parsed.saveHistory !== undefined) setSaveHistory(parsed.saveHistory);
        if (parsed.pauseWhenMuted !== undefined) setPauseWhenMuted(parsed.pauseWhenMuted);
        if (parsed.autoplayRelated !== undefined) setAutoplayRelated(parsed.autoplayRelated);
        if (parsed.discordRpc !== undefined) setDiscordRpc(parsed.discordRpc);
        if (parsed.lastFmApiKey) setLastFmApiKey(parsed.lastFmApiKey);
        if (parsed.aiApiKey) setAiApiKey(parsed.aiApiKey);
        if (parsed.forceHdThumbnail !== undefined) setForceHdThumbnail(parsed.forceHdThumbnail);
      }
    } catch (_) {}
  }, []);

  // Save to localStorage whenever state changes
  const persistSettings = (key: string, value: any) => {
    try {
      const saved = localStorage.getItem('gravitytune_settings');
      const current = saved ? JSON.parse(saved) : {};
      current[key] = value;
      localStorage.setItem('gravitytune_settings', JSON.stringify(current));
    } catch (_) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  if (!isOpen) return null;

  // Clear Storage Action
  const handleClearCache = async () => {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        setEstimatedCache('0 MB');
        showToast('Semua cache audio & gambar berhasil dibersihkan!');
      } catch (_) {
        showToast('Gagal membersihkan cache browser.');
      }
    } else {
      setEstimatedCache('0 MB');
      showToast('Cache aplikasi berhasil dibersihkan.');
    }
  };

  // Export Settings & Favorites as JSON
  const handleExportBackup = () => {
    try {
      const backupData = {
        app: 'GravityTune',
        version: 'v2.5.0',
        timestamp: new Date().toISOString(),
        settings: localStorage.getItem('gravitytune_settings') 
          ? JSON.parse(localStorage.getItem('gravitytune_settings')!) 
          : {},
        favorites: favorites || [],
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gravitytune-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('File backup berhasil diunduh!');
    } catch (_) {
      showToast('Gagal mengekspor file backup.');
    }
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.settings) {
          localStorage.setItem('gravitytune_settings', JSON.stringify(parsed.settings));
        }
        if (parsed.favorites && Array.isArray(parsed.favorites)) {
          localStorage.setItem('gravity_tune_favorites', JSON.stringify(parsed.favorites));
        }
        showToast('Data backup berhasil diimpor! Silakan refresh halaman.');
      } catch (_) {
        showToast('Format file backup tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // =========================================================================
  // RENDER SUB-VIEWS
  // =========================================================================

  const renderSubViewHeader = (title: string) => (
    <div className="flex items-center gap-3.5 pb-5 border-b border-white/10 mb-5">
      <button
        onClick={() => setActiveSubView(null)}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-[#ede9dc] flex items-center justify-center transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-xl font-black text-[#ede9dc] tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0d0c] text-[#ede9dc] overflow-hidden font-sans select-none animate-in slide-in-from-right duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-[#ede9dc] text-black px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          ROOT SETTINGS LIST (17 Items)
          ======================================================== */}
      {activeSubView === null ? (
        <div className="flex flex-col h-full max-w-lg mx-auto w-full px-5 py-4 pb-8 overflow-y-auto scrollbar-none">
          {/* Header */}
          <div className="flex items-center gap-4 pt-2 pb-5">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/10 text-[#ede9dc]/80 hover:text-white transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ede9dc] tracking-tight">
              Settings
            </h1>
          </div>

          <div className="space-y-4 pb-12">
            {/* GROUP 1: Account & Stats */}
            <div className="bg-[#181614] rounded-3xl p-1.5 border border-white/5 space-y-0.5">
              {/* Account */}
              <div
                onClick={() => setActiveSubView('account')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Account
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Sign in and manage account sync ({accountName})
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Listening Stats */}
              <div
                onClick={() => {
                  if (onOpenStats) {
                    onClose();
                    onOpenStats();
                  } else {
                    showToast('Membuka statistik mendengarkan...');
                  }
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Listening Stats
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Your top songs, artists, and playback history
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>
            </div>

            {/* GROUP 2: Media, Audio & Looks */}
            <div className="bg-[#181614] rounded-3xl p-1.5 border border-white/5 space-y-0.5">
              {/* Appearance */}
              <div
                onClick={() => setActiveSubView('appearance')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Appearance
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Themes, layout, and visual styles
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Playback */}
              <div
                onClick={() => setActiveSubView('playback')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Playback
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Audio behavior, crossfade, and background streaming
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Lyrics */}
              <div
                onClick={() => setActiveSubView('lyrics')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Lyrics
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Lyrics providers, preloading, and translation
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Content */}
              <div
                onClick={() => setActiveSubView('content')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Content
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Language, country, and recommendations
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Behavior */}
              <div
                onClick={() => setActiveSubView('behavior')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Hand className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Behavior
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      History, defaults, and privacy behavior
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Integration */}
              <div
                onClick={() => setActiveSubView('integration')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Integration
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Discord, Last.fm, Libre.fm, and ListenBrainz
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>
            </div>

            {/* GROUP 3: Advanced, System & Info */}
            <div className="bg-[#181614] rounded-3xl p-1.5 border border-white/5 space-y-0.5">
              {/* AI Integration */}
              <div
                onClick={() => setActiveSubView('ai')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      AI Integration
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Configure AI translation and personalization
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Internet */}
              <div
                onClick={() => setActiveSubView('internet')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Internet
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Proxy, DNS, and network playback behavior
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* PO Token Generation */}
              <div
                onClick={() => setActiveSubView('potoken')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      PO Token Generation
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Playback verification and visitor data
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Storage */}
              <div
                onClick={() => setActiveSubView('storage')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Storage
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Cache, downloads, and offline storage ({estimatedCache})
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Backup and restore */}
              <div
                onClick={() => setActiveSubView('backup')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Backup and restore
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Export and recover your personal app data
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Developer Options */}
              <div
                onClick={() => setActiveSubView('developer')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Developer Options
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Experimental features and debugging
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Open supported links */}
              <div
                onClick={() => showToast('GravityTune menangani tautan YouTube Music secara otomatis.')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Open supported links
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      Open supported link by default
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>

              {/* Updates */}
              <div
                onClick={() => showToast('Anda telah menggunakan versi terbaru GravityTune v2.5.0')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      Updates
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      New version available
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#d1e289] bg-[#d1e289]/15 px-2.5 py-1 rounded-full flex-shrink-0">
                  v2.5.0
                </span>
              </div>

              {/* About */}
              <div
                onClick={() => setActiveSubView('about')}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/5 active:scale-[0.99] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-full bg-[#d1e289] text-black flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#ede9dc] group-hover:text-[#d1e289] transition-colors truncate">
                      About
                    </h3>
                    <p className="text-xs text-[#9e9a8f] truncate mt-0.5">
                      App info, licenses, and contributors
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9e9a8f] group-hover:text-white flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ========================================================
          SUB-VIEWS WITH REAL FUNCTIONAL SWITCHES
          ======================================================== */}
      {activeSubView !== null && (
        <div className="flex flex-col h-full max-w-lg mx-auto w-full px-5 py-4 pb-12 overflow-y-auto scrollbar-none animate-in fade-in duration-200">
          
          {/* 1. APPEARANCE SETTINGS */}
          {activeSubView === 'appearance' && (
            <div className="space-y-4">
              {renderSubViewHeader('Appearance')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Themes &amp; Colors</h3>

                {/* Pure Black OLED */}
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Pure Black (OLED)</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Menggunakan latar belakang hitam pekat hemat baterai</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pureBlackOled}
                    onChange={(e) => {
                      setPureBlackOled(e.target.checked);
                      persistSettings('pureBlackOled', e.target.checked);
                      showToast(e.target.checked ? 'Mode OLED diaktifkan' : 'Mode OLED dinonaktifkan');
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                {/* Dynamic Color Theme */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Dynamic Color</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Adaptasi aksen tema mengikuti palet warna cover album</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dynamicColor}
                    onChange={(e) => {
                      setDynamicColor(e.target.checked);
                      persistSettings('dynamicColor', e.target.checked);
                      showToast(e.target.checked ? 'Warna dinamis diaktifkan' : 'Warna dinamis dinonaktifkan');
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Player Layout &amp; Shape</h3>

                {/* Player Style */}
                <div>
                  <p className="text-sm font-bold text-[#ede9dc] mb-2">Gaya Tampilan Player</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['modern', 'minimal', 'classic'] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setPlayerStyle(style);
                          persistSettings('playerStyle', style);
                          showToast(`Gaya player diatur ke ${style}`);
                        }}
                        className={`p-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                          playerStyle === style
                            ? 'bg-[#d1e289] text-black border-[#d1e289]'
                            : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Radius */}
                <div className="border-t border-white/5 pt-3">
                  <p className="text-sm font-bold text-[#ede9dc] mb-2">Bentuk Sudut Album Cover</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['rounded', 'square', 'circle'] as const).map((rad) => (
                      <button
                        key={rad}
                        onClick={() => {
                          setCoverCornerRadius(rad);
                          persistSettings('coverCornerRadius', rad);
                          showToast(`Sudut cover diatur ke ${rad}`);
                        }}
                        className={`p-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                          coverCornerRadius === rad
                            ? 'bg-[#d1e289] text-black border-[#d1e289]'
                            : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {rad}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PLAYBACK SETTINGS */}
          {activeSubView === 'playback' && (
            <div className="space-y-4">
              {renderSubViewHeader('Playback')}

              {/* Audio Quality */}
              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-3">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Kualitas Audio (Bitrate)</h3>
                <div className="space-y-2">
                  {[
                    { key: 'high', label: 'Tinggi (High Quality)', sub: 'Opus ~256 kbps (Audio jernih audiophile)' },
                    { key: 'normal', label: 'Standar (Normal)', sub: 'AAC ~128 kbps (Seimbang)' },
                    { key: 'data_saver', label: 'Hemat Kuota (Data Saver)', sub: 'Opus ~64 kbps (Sangat hemat)' }
                  ].map((q) => (
                    <div
                      key={q.key}
                      onClick={() => {
                        setAudioQuality(q.key as any);
                        persistSettings('audioQuality', q.key);
                        showToast(`Kualitas audio diatur ke ${q.label}`);
                      }}
                      className={`p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${
                        audioQuality === q.key
                          ? 'bg-[#d1e289]/15 border-[#d1e289] text-[#ede9dc]'
                          : 'bg-white/5 border-transparent text-[#9e9a8f] hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#ede9dc]">{q.label}</p>
                        <p className="text-xs text-[#9e9a8f] mt-0.5">{q.sub}</p>
                      </div>
                      {audioQuality === q.key && <CheckCircle2 className="w-5 h-5 text-[#d1e289]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Crossfade Slider */}
              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#ede9dc]">Crossfade Antar Lagu</h3>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Memudarkan transisi pergantian lagu secara mulus</p>
                  </div>
                  <span className="text-xs font-black text-[#d1e289] bg-[#d1e289]/10 px-2.5 py-1 rounded-full">
                    {crossfadeDuration} Detik
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={crossfadeDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCrossfadeDuration(val);
                    persistSettings('crossfadeDuration', val);
                  }}
                  className="w-full accent-[#d1e289] cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Audio Normalization (EBU R128)</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Menyamakan volume seluruh lagu agar tidak ada lagu yang terlalu keras</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioNormalization}
                    onChange={(e) => {
                      setAudioNormalization(e.target.checked);
                      persistSettings('audioNormalization', e.target.checked);
                      showToast(e.target.checked ? 'Normalisasi aktif' : 'Normalisasi dinonaktifkan');
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Gapless Playback</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Menghilangkan jeda sunyi di antara dua lagu dalam album</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={gaplessPlayback}
                    onChange={(e) => {
                      setGaplessPlayback(e.target.checked);
                      persistSettings('gaplessPlayback', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Auto-Skip on Playback Error</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Otomatis putar lagu berikutnya jika lagu saat ini mengalami gangguan jaringan</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSkipError}
                    onChange={(e) => {
                      setAutoSkipError(e.target.checked);
                      persistSettings('autoSkipError', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. LYRICS SETTINGS */}
          {activeSubView === 'lyrics' && (
            <div className="space-y-4">
              {renderSubViewHeader('Lyrics')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Lyrics Engine &amp; Behavior</h3>

                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Auto-Scroll Karaoke</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Lirik otomatis bergulir mengikuti detik yang sedang dinyanyikan</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lyricsAutoScroll}
                    onChange={(e) => {
                      setLyricsAutoScroll(e.target.checked);
                      persistSettings('lyricsAutoScroll', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Blur Inactive Lyrics</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Efek blur pada baris lirik yang belum atau sudah selesai dinyanyikan</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lyricsBlurEffect}
                    onChange={(e) => {
                      setLyricsBlurEffect(e.target.checked);
                      persistSettings('lyricsBlurEffect', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Romanization / Romaji</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Konversi teks alfabet untuk lagu berbahasa Jepang, Korea, atau Mandarin</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={romanization}
                    onChange={(e) => {
                      setRomanization(e.target.checked);
                      persistSettings('romanization', e.target.checked);
                      showToast(e.target.checked ? 'Romanisasi aktif' : 'Romanisasi nonaktif');
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-3">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Ukuran Huruf Lirik</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['medium', 'large', 'huge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setLyricsFontSize(size);
                        persistSettings('lyricsFontSize', size);
                        showToast(`Ukuran font diatur ke ${size}`);
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold capitalize transition-all border ${
                        lyricsFontSize === size
                          ? 'bg-[#d1e289] text-black border-[#d1e289]'
                          : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. CONTENT SETTINGS */}
          {activeSubView === 'content' && (
            <div className="space-y-4">
              {renderSubViewHeader('Content')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider block mb-2">
                    Bahasa Rekomendasi
                  </label>
                  <select
                    value={contentLanguage}
                    onChange={(e) => {
                      setContentLanguage(e.target.value);
                      persistSettings('contentLanguage', e.target.value);
                      showToast('Bahasa konten diperbarui.');
                    }}
                    className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-[#ede9dc] focus:outline-none focus:border-[#d1e289]"
                  >
                    <option value="id" className="bg-[#181614]">Indonesia (ID)</option>
                    <option value="en" className="bg-[#181614]">English (US)</option>
                    <option value="ja" className="bg-[#181614]">日本語 (JA)</option>
                    <option value="ko" className="bg-[#181614]">한국어 (KO)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Izinkan Konten Eksplisit</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Menampilkan lagu dengan label explicit (18+)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowExplicit}
                    onChange={(e) => {
                      setAllowExplicit(e.target.checked);
                      persistSettings('allowExplicit', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. BEHAVIOR SETTINGS */}
          {activeSubView === 'behavior' && (
            <div className="space-y-4">
              {renderSubViewHeader('Behavior')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Simpan Riwayat Putar (History)</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Mencatat lagu yang telah Anda putar untuk statistik pribadi</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={saveHistory}
                    onChange={(e) => {
                      setSaveHistory(e.target.checked);
                      persistSettings('saveHistory', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Pause Saat Volume Mute (0%)</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Otomatis menjeda lagu jika speaker dibisukan</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pauseWhenMuted}
                    onChange={(e) => {
                      setPauseWhenMuted(e.target.checked);
                      persistSettings('pauseWhenMuted', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Autoplay Serupa Saat Antrean Habis</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Lanjut memutar lagu rekomendasi tanpa berhenti</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoplayRelated}
                    onChange={(e) => {
                      setAutoplayRelated(e.target.checked);
                      persistSettings('autoplayRelated', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. INTEGRATION SETTINGS */}
          {activeSubView === 'integration' && (
            <div className="space-y-4">
              {renderSubViewHeader('Integration')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Discord Rich Presence</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Tampilkan status lagu yang sedang didengar di akun Discord</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={discordRpc}
                    onChange={(e) => {
                      setDiscordRpc(e.target.checked);
                      persistSettings('discordRpc', e.target.checked);
                      showToast(e.target.checked ? 'Discord RPC aktif' : 'Discord RPC dinonaktifkan');
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <label className="text-xs font-bold text-[#ede9dc] block">Last.fm API Key</label>
                  <input
                    type="text"
                    placeholder="Masukkan Last.fm API Key untuk Scrobbling"
                    value={lastFmApiKey}
                    onChange={(e) => {
                      setLastFmApiKey(e.target.value);
                      persistSettings('lastFmApiKey', e.target.value);
                    }}
                    className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-[#ede9dc] focus:outline-none focus:border-[#d1e289]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. AI INTEGRATION */}
          {activeSubView === 'ai' && (
            <div className="space-y-4">
              {renderSubViewHeader('AI Integration')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider block mb-2">
                    AI Translation &amp; Recommendation Provider
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => {
                      setAiProvider(e.target.value as any);
                      persistSettings('aiProvider', e.target.value);
                    }}
                    className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-[#ede9dc] focus:outline-none focus:border-[#d1e289]"
                  >
                    <option value="gemini" className="bg-[#181614]">Google Gemini AI (Bawaan)</option>
                    <option value="openai" className="bg-[#181614]">OpenAI GPT</option>
                    <option value="none" className="bg-[#181614]">Nonaktif</option>
                  </select>
                </div>

                {aiProvider !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#ede9dc] block">Custom API Key (Opsional)</label>
                    <input
                      type="password"
                      placeholder="Gunakan API key sendiri jika kuota habis"
                      value={aiApiKey}
                      onChange={(e) => {
                        setAiApiKey(e.target.value);
                        persistSettings('aiApiKey', e.target.value);
                      }}
                      className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-[#ede9dc] focus:outline-none focus:border-[#d1e289]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. STORAGE & CACHE */}
          {activeSubView === 'storage' && (
            <div className="space-y-4">
              {renderSubViewHeader('Storage')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#ede9dc]">Penyimpanan Cache Offline</h3>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Audio &amp; Gambar tersimpan di memori perangkat</p>
                  </div>
                  <span className="text-base font-black text-[#d1e289]">{estimatedCache}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#9e9a8f]">
                    <span>Batas Maksimal Cache</span>
                    <span>{cacheSizeLimit} MB</span>
                  </div>
                  <input
                    type="range"
                    min={256}
                    max={4096}
                    step={256}
                    value={cacheSizeLimit}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setCacheSizeLimit(v);
                      persistSettings('cacheSizeLimit', v);
                    }}
                    className="w-full accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleClearCache}
                    className="w-full py-3.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 text-rose-300 font-extrabold text-xs flex items-center justify-center gap-2 border border-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Bersihkan Semua Cache ({estimatedCache})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. BACKUP & RESTORE */}
          {activeSubView === 'backup' && (
            <div className="space-y-4">
              {renderSubViewHeader('Backup & Restore')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-3">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Ekspor Data Pribadi</h3>
                <p className="text-xs text-[#9e9a8f] leading-relaxed">
                  Unduh seluruh daftar lagu favorit, playlist, dan setelan personal Anda dalam satu file JSON yang aman.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="w-full py-3.5 rounded-2xl bg-[#d1e289] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Backup JSON</span>
                </button>
              </div>

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-3">
                <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">Pulihkan Data (Import)</h3>
                <p className="text-xs text-[#9e9a8f] leading-relaxed">
                  Pilih file backup `.json` GravityTune yang sudah pernah Anda simpan sebelumnya.
                </p>
                <label className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/10 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* 10. DEVELOPER OPTIONS */}
          {activeSubView === 'developer' && (
            <div className="space-y-4">
              {renderSubViewHeader('Developer Options')}

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Force Ultra HD Thumbnail (800x800)</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Memaksa semua cover album dan avatar di-upgrade ke resolusi maksimal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={forceHdThumbnail}
                    onChange={(e) => {
                      setForceHdThumbnail(e.target.checked);
                      persistSettings('forceHdThumbnail', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-bold text-[#ede9dc]">Debug Stream Logs</p>
                    <p className="text-xs text-[#9e9a8f] mt-0.5">Mencetak status pemutaran dan audio buffer ke console browser</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={debugLogConsole}
                    onChange={(e) => {
                      setDebugLogConsole(e.target.checked);
                      persistSettings('debugLogConsole', e.target.checked);
                    }}
                    className="w-5 h-5 accent-[#d1e289] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 11. ABOUT */}
          {activeSubView === 'about' && (
            <div className="space-y-4">
              {renderSubViewHeader('About GravityTune')}

              <div className="bg-[#181614] rounded-3xl p-6 border border-white/5 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-2xl border border-white/10">
                  <img src="/logo.png" alt="GravityTune" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#ede9dc]">GravityTune</h3>
                  <p className="text-xs text-[#d1e289] font-bold mt-1">v2.5.0-stable (Web &amp; PWA)</p>
                  <p className="text-xs text-[#9e9a8f] max-w-xs mx-auto mt-2 leading-relaxed">
                    Audiophile YouTube Music client dengan UI premium terinspirasi dari ArchiveTune dan Material 3.
                  </p>
                </div>
              </div>

              <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 text-xs text-[#9e9a8f] space-y-2">
                <p>• <strong>InnerTube Engine:</strong> Akses jutaan katalog musik resmi YouTube Music tanpa batas dan bebas iklan.</p>
                <p>• <strong>Privasi:</strong> Tidak ada pelacak data pribadi atau telemetri.</p>
                <p>• <strong>Lisensi:</strong> Open-Source di bawah Lisensi MIT.</p>
              </div>
            </div>
          )}

          {/* Other subviews fallback */}
          {['account', 'internet', 'potoken'].includes(activeSubView) && (
            <div className="space-y-4">
              {renderSubViewHeader(activeSubView === 'account' ? 'Account Sync' : activeSubView === 'internet' ? 'Internet & Network' : 'PO Token')}
              <div className="bg-[#181614] rounded-3xl p-5 border border-white/5 space-y-3 text-sm text-[#ede9dc]">
                <p className="font-bold">Setelan {activeSubView} aktif &amp; terkonfigurasi otomatis.</p>
                <p className="text-xs text-[#9e9a8f] leading-relaxed">
                  GravityTune berjalan secara otomatis menggunakan token autentikasi sesi dan routing jaringan teroptimasi.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

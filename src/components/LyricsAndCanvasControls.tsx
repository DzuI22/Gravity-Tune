import React from 'react';
import {
  Sparkles,
  Wifi,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Flame,
  Volume2
} from 'lucide-react';

interface LyricsAndCanvasControlsProps {
  // Lyrics styling
  bounceAmplitude: number;
  setBounceAmplitude: (v: number) => void;
  glowIntensity: number;
  setGlowIntensity: (v: number) => void;
  fillTransitionSmoothness: number;
  setFillTransitionSmoothness: (v: number) => void;
  lineBounceEffect: boolean;
  setLineBounceEffect: (v: boolean) => void;
  
  // Canvas backdrop
  canvasSource: 'spotify' | 'apple' | 'tidal' | 'betterlyrics';
  setCanvasSource: (s: 'spotify' | 'apple' | 'tidal' | 'betterlyrics') => void;
  canvasWifiOnly: boolean;
  setCanvasWifiOnly: (v: boolean) => void;
  highRefreshRate144: boolean;
  setHighRefreshRate144: (v: boolean) => void;
  showToast: (msg: string) => void;
}

export default function LyricsAndCanvasControls({
  bounceAmplitude,
  setBounceAmplitude,
  glowIntensity,
  setGlowIntensity,
  fillTransitionSmoothness,
  setFillTransitionSmoothness,
  lineBounceEffect,
  setLineBounceEffect,
  canvasSource,
  setCanvasSource,
  canvasWifiOnly,
  setCanvasWifiOnly,
  highRefreshRate144,
  setHighRefreshRate144,
  showToast,
}: LyricsAndCanvasControlsProps) {
  return (
    <div className="space-y-4">
      {/* 1. Lyrics Animation Style */}
      <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d1e289]" />
          <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">
            Apple Music Lyrics Animation Style
          </h3>
        </div>

        {/* Line Bounce Effect Toggle */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-sm font-bold text-[#ede9dc]">Line Bounce Effect</p>
            <p className="text-xs text-[#9e9a8f] mt-0.5">Animasi membal dinamis pada baris lirik yang sedang aktif</p>
          </div>
          <input
            type="checkbox"
            checked={lineBounceEffect}
            onChange={(e) => {
              setLineBounceEffect(e.target.checked);
              showToast(e.target.checked ? 'Line bounce diaktifkan' : 'Line bounce dinonaktifkan');
            }}
            className="w-5 h-5 accent-[#d1e289] cursor-pointer"
          />
        </div>

        {/* Bounce Amplitude Slider */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ede9dc]">Bounce Amplitude</span>
            <span className="text-xs font-black text-[#d1e289] bg-[#d1e289]/10 px-2 py-0.5 rounded-full">
              {bounceAmplitude}%
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={200}
            value={bounceAmplitude}
            onChange={(e) => setBounceAmplitude(parseInt(e.target.value))}
            className="w-full accent-[#d1e289] cursor-pointer"
          />
        </div>

        {/* Glow Intensity Slider */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ede9dc]">Glow Intensity</span>
            <span className="text-xs font-black text-[#d1e289] bg-[#d1e289]/10 px-2 py-0.5 rounded-full">
              {glowIntensity}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={glowIntensity}
            onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
            className="w-full accent-[#d1e289] cursor-pointer"
          />
        </div>

        {/* Fill Transition Smoothness Slider */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ede9dc]">Fill Transition Smoothness</span>
            <span className="text-xs font-black text-[#d1e289] bg-[#d1e289]/10 px-2 py-0.5 rounded-full">
              {fillTransitionSmoothness} dp
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={16}
            value={fillTransitionSmoothness}
            onChange={(e) => setFillTransitionSmoothness(parseInt(e.target.value))}
            className="w-full accent-[#d1e289] cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Motion Video Artwork / Canvas Backdrop */}
      <div className="bg-[#181614] rounded-3xl p-4 border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#d1e289]" />
          <h3 className="text-xs font-black uppercase text-[#9e9a8f] tracking-wider">
            Canvas Backdrop (Motion Artwork)
          </h3>
        </div>

        {/* Canvas Provider Selector */}
        <div>
          <p className="text-sm font-bold text-[#ede9dc] mb-2">Penyedia Motion Canvas</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'spotify', name: 'Spotify Canvas' },
              { id: 'apple', name: 'Apple Music Motion' },
              { id: 'tidal', name: 'TIDAL Video Art' },
              { id: 'betterlyrics', name: 'BetterLyrics Loop' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setCanvasSource(p.id as any);
                  showToast(`Sumber Canvas: ${p.name}`);
                }}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border text-left ${
                  canvasSource === p.id
                    ? 'bg-[#d1e289] text-black border-[#d1e289]'
                    : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Use Wi-Fi Only */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-sm font-bold text-[#ede9dc]">Use Wi-Fi Only</p>
            <p className="text-xs text-[#9e9a8f] mt-0.5">Hanya putar looping video saat tersambung ke jaringan Wi-Fi</p>
          </div>
          <input
            type="checkbox"
            checked={canvasWifiOnly}
            onChange={(e) => {
              setCanvasWifiOnly(e.target.checked);
              showToast(e.target.checked ? 'Canvas Wi-Fi only aktif' : 'Canvas dapat berjalan di kuota seluler');
            }}
            className="w-5 h-5 accent-[#d1e289] cursor-pointer"
          />
        </div>

        {/* Provider Health Check Pill */}
        <div className="border-t border-white/5 pt-3 flex items-center justify-between bg-white/[0.02] p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Provider Health Check</span>
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Operational
          </span>
        </div>
      </div>

      {/* 3. Force 144Hz High Refresh Rate */}
      <div className="bg-[#181614] rounded-3xl p-4 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#d1e289]" />
              <p className="text-sm font-bold text-[#ede9dc]">Force 144Hz High Refresh Rate</p>
            </div>
            <p className="text-xs text-[#9e9a8f] mt-0.5">Memaksa animasi lirik & scroll berjalan di refresh rate tertinggi layar HP</p>
          </div>
          <input
            type="checkbox"
            checked={highRefreshRate144}
            onChange={(e) => {
              setHighRefreshRate144(e.target.checked);
              showToast(e.target.checked ? 'Mode 144Hz diaktifkan' : 'Mode 144Hz dinonaktifkan');
            }}
            className="w-5 h-5 accent-[#d1e289] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

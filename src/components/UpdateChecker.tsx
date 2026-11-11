'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, CheckCircle2, X, ExternalLink } from 'lucide-react';

interface UpdateCheckerProps {
  currentVersion?: string;
}

export default function UpdateChecker({ currentVersion = 'v5.1.0' }: UpdateCheckerProps) {
  const [latestRelease, setLatestRelease] = useState<{
    tagName: string;
    name: string;
    apkUrl: string;
    body: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check GitHub Releases for GravityTune
    const checkUpdates = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/DzuI22/Gravity-Tune/releases/latest', {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
        });
        if (res.ok) {
          const data = await res.json();
          const tag = data.tag_name;
          // If there's a valid release and tag is different/newer
          const apkAsset = data.assets?.find((a: any) => a.name?.endsWith('.apk'));
          if (apkAsset && tag && tag !== currentVersion) {
            setLatestRelease({
              tagName: tag,
              name: data.name || tag,
              apkUrl: apkAsset.browser_download_url,
              body: data.body || '',
            });
            // Show popup if not dismissed before
            const dismissedTag = localStorage.getItem('gravity_dismissed_update');
            if (dismissedTag !== tag) {
              setIsOpen(true);
            }
          }
        }
      } catch (_) {}
    };

    checkUpdates();
  }, [currentVersion]);

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    if (latestRelease) {
      localStorage.setItem('gravity_dismissed_update', latestRelease.tagName);
    }
  };

  if (!isOpen || !latestRelease || isDismissed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="p-4 rounded-3xl bg-[#131211]/90 backdrop-blur-2xl border border-[#d1e289]/30 shadow-[0_16px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#d1e289]/20 text-[#d1e289] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#ede9dc] leading-tight">
                Update Tersedia: {latestRelease.tagName}
              </h4>
              <p className="text-xs text-[#9e9a8f] font-medium mt-0.5">
                Versi baru GravityTune telah dirilis!
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-[#9e9a8f] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <a
            href={latestRelease.apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-full bg-[#d1e289] text-black text-xs font-black flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#d1e289]/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh APK Terbaru</span>
          </a>
          <button
            onClick={handleDismiss}
            className="py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#ede9dc] transition-all"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}

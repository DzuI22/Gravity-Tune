'use client';

import React from 'react';
import { Mic, Users, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserMenuProps {
  onClose: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function AvatarButton({ onClick }: { onClick: () => void }) {
  const { user, isGuest } = useAuth();
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill hover:bg-white/15 transition-all"
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getAvatarColor(user.displayName)}`}>
        {isGuest ? <User className="w-4 h-4" /> : getInitials(user.displayName)}
      </div>
      <span className="text-xs font-semibold text-white/80 hidden sm:block max-w-24 truncate">
        {user.displayName}
      </span>
    </button>
  );
}

export default function UserMenu({ onClose }: UserMenuProps) {
  const { user, isGuest, logout, setShowAuthModal } = useAuth();

  return (
    <div className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl z-50">
      {/* Profile Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${getAvatarColor(user.displayName)}`}>
          {isGuest ? <User className="w-6 h-6" /> : getInitials(user.displayName)}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
          <p className="text-xs text-white/40 font-medium">
            {isGuest ? 'Guest Mode' : 'Profile'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <span>{user.recentSongs.length} recently played</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 space-y-1">
        {isGuest && (
          <button
            onClick={() => { setShowAuthModal(true); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Create Profile</span>
          </button>
        )}
        <button
          onClick={() => { logout(); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>{isGuest ? 'Switch Account' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
}

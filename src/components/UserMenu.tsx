'use client';

import React from 'react';
import { Mic, User, LogOut, Settings, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'from-teal-500 to-emerald-600',
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${getAvatarColor(user.displayName)} overflow-hidden`}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
        ) : isGuest ? (
          <User className="w-4 h-4" />
        ) : (
          getInitials(user.displayName)
        )}
      </div>
      <span className="text-xs font-semibold text-white/90 hidden sm:block max-w-28 truncate">
        {user.displayName}
      </span>
    </button>
  );
}

interface UserMenuProps {
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function UserMenu({ onClose, onOpenSettings }: UserMenuProps) {
  const { user, accounts, switchAccount, logout, setShowAuthModal } = useAuth();

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-[#181614] rounded-2xl p-4 border border-white/15 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Current Active Profile Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${getAvatarColor(user.displayName)} overflow-hidden flex-shrink-0`}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
          ) : user.mode === 'guest' ? (
            <User className="w-5 h-5" />
          ) : (
            getInitials(user.displayName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white text-sm truncate">{user.displayName}</p>
          <p className="text-[11px] text-teal-400 font-medium truncate">
            {user.mode === 'google' ? user.email || 'Akun Google' : 'Akun Guest'}
          </p>
        </div>
      </div>

      {/* Switch Account List (if multi-account) */}
      {accounts.length > 1 && (
        <div className="py-2.5 border-b border-white/10 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-1 mb-1.5">
            Ganti Akun
          </p>
          {accounts.map(acc => {
            const isActive = acc.id === user.id;
            return (
              <button
                key={acc.id}
                onClick={() => {
                  switchAccount(acc.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                  isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-white/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getAvatarColor(acc.displayName)} overflow-hidden flex-shrink-0`}>
                    {acc.avatar ? (
                      <img src={acc.avatar} alt={acc.displayName} className="w-full h-full object-cover" />
                    ) : acc.mode === 'guest' ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      getInitials(acc.displayName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">{acc.displayName}</p>
                    <p className="text-[10px] text-white/40 truncate leading-tight">
                      {acc.mode === 'google' ? acc.email : 'Guest'}
                    </p>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-teal-400 flex-shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Mic className="w-3.5 h-3.5 text-teal-400" />
          <span>{user.recentSongs.length} lagu baru diputar</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2.5 space-y-1">
        <button
          onClick={() => {
            setShowAuthModal(true);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors text-left"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Tambah Akun Baru</span>
        </button>

        {onOpenSettings && (
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-white/50" />
            <span>Pengaturan Akun</span>
          </button>
        )}

        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar ke Guest Default</span>
        </button>
      </div>
    </div>
  );
}

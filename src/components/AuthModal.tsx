'use client';

import React, { useState } from 'react';
import { Sparkles, User, UserCheck, Music, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, loginAsGuest, loginAsUser } = useAuth();
  const [step, setStep] = useState<'choose' | 'name'>('choose');
  const [nameInput, setNameInput] = useState('');
  const [mode, setMode] = useState<'guest' | 'user'>('guest');

  if (!showAuthModal) return null;

  const handleContinue = () => {
    if (step === 'choose') {
      setStep('name');
    } else {
      const name = nameInput.trim() || (mode === 'guest' ? 'Guest' : 'Music Lover');
      if (mode === 'guest') {
        loginAsGuest(name);
      } else {
        loginAsUser(name);
      }
    }
  };

  const handleSkip = () => loginAsGuest('Guest');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-rose-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Gravity<span className="text-rose-400">Tune</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Your audiophile music companion</p>
        </div>

        {/* Step 1: Choose mode */}
        {step === 'choose' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white text-center mb-6">How would you like to continue?</h2>

            {/* Guest Option */}
            <button
              onClick={() => { setMode('guest'); setStep('name'); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${
                mode === 'guest'
                  ? 'border-rose-500/50 bg-rose-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white/70" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">Continue as Guest</p>
                <p className="text-xs text-white/50 mt-0.5">
                  No sign-in needed · Favorites saved locally · Fully free
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 ml-auto" />
            </button>

            {/* User Option */}
            <button
              onClick={() => { setMode('user'); setStep('name'); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">Create Profile</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Set a username · Personalized experience · Still free
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/40 ml-auto" />
            </button>

            <p className="text-xs text-white/30 text-center pt-2">
              <Music className="w-3 h-3 inline mr-1" />
              Streams from YouTube Music • No account required
            </p>
          </div>
        )}

        {/* Step 2: Enter name */}
        {step === 'name' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                mode === 'guest' ? 'bg-white/10' : 'bg-gradient-to-br from-indigo-600 to-rose-500'
              }`}>
                {mode === 'guest' ? (
                  <User className="w-8 h-8 text-white/70" />
                ) : (
                  <UserCheck className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'guest' ? 'What should we call you?' : 'Choose your display name'}
              </h2>
              <p className="text-xs text-white/40 mt-1">You can change this anytime</p>
            </div>

            <div>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleContinue()}
                placeholder={mode === 'guest' ? 'e.g. Music Lover, Dzul...' : 'Your name or username...'}
                maxLength={30}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl px-4 py-3 border border-white/15 focus:border-rose-400/70 outline-none transition-all text-sm"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-3 rounded-xl border border-white/15 text-white/60 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-rose-500/25"
              >
                {mode === 'guest' ? 'Start Listening →' : 'Create Profile →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

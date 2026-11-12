'use client';

import React, { useState } from 'react';
import { ArrowLeft, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GoogleSignInPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GoogleSignInPage({ isOpen, onClose, onSuccess }: GoogleSignInPageProps) {
  const { loginWithGoogle } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Strict Google Email validation to prevent spam bots
  const validateGoogleEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    // Valid standard email pattern
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com|[a-zA-Z0-9.-]+\.edu|[a-zA-Z0-9.-]+\.ac\.id)$/;
    return regex.test(trimmed);
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const trimmed = emailInput.trim();
    if (!trimmed) {
      setErrorMsg('Enter an email or phone number');
      return;
    }

    // Check if format is a real email
    if (!trimmed.includes('@')) {
      setErrorMsg("Couldn't find your Google Account. Please enter your full email address (e.g. name@gmail.com).");
      return;
    }

    if (!validateGoogleEmail(trimmed)) {
      setErrorMsg("Please enter a valid Google Account email address (@gmail.com).");
      return;
    }

    setIsLoading(true);
    try {
      const displayName = trimmed.split('@')[0];
      await loginWithGoogle(trimmed, displayName);
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (_) {
      setIsLoading(false);
      setErrorMsg('Something went wrong. Please check your internet connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#121212] text-white flex flex-col font-sans select-none overflow-y-auto animate-in fade-in duration-200">
      {/* Top Mobile Bar matching Screenshot 2 */}
      <header className="sticky top-0 z-10 bg-[#121212] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white flex items-center gap-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base font-bold">Login</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Google Sign-In Card Container (Exact replication of Photo 2) */}
      <main className="flex-1 flex flex-col justify-start max-w-sm sm:max-w-md w-full mx-auto px-6 pt-10 pb-8">
        {/* Google G Logo */}
        <div className="mb-4">
          <svg className="w-10 h-10" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-3xl font-normal text-white tracking-tight mb-2">
          Sign in
        </h1>
        <p className="text-base text-white/80 font-normal mb-8">
          Use your Google Account
        </p>

        {/* Input Form */}
        <form onSubmit={handleNext} className="space-y-3">
          <div className="space-y-1">
            <div
              className={`relative border rounded-md px-3.5 pt-2.5 pb-2 transition-all ${
                errorMsg
                  ? 'border-[#f28b82] bg-[#3c1e1e]/20'
                  : 'border-white/40 focus-within:border-[#8ab4f8] focus-within:ring-1 focus-within:ring-[#8ab4f8]'
              }`}
            >
              <label className="block text-[11px] font-medium text-white/60 mb-0.5">
                Email or phone
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder=""
                autoFocus
                className="w-full bg-transparent text-base text-white outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-[#f28b82] flex items-center gap-1.5 pt-1 pl-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setErrorMsg('Enter your full @gmail.com email address above.')}
              className="text-sm font-semibold text-[#8ab4f8] hover:text-[#aecbfa] transition-colors"
            >
              Forgot email?
            </button>
          </div>

          {/* Disclaimer Text */}
          <div className="pt-8 pb-8 text-sm text-white/70 leading-relaxed">
            Not your computer? Use Guest mode to sign in privately.{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="font-semibold text-[#8ab4f8] hover:text-[#aecbfa] transition-colors"
            >
              Learn more about using Guest mode
            </button>
          </div>

          {/* Action Row: Create account & Next */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                window.open('https://accounts.google.com/signup', '_blank');
              }}
              className="text-sm font-semibold text-[#8ab4f8] hover:text-[#aecbfa] transition-colors"
            >
              Create account
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-[#1b66c9] hover:bg-[#1a73e8] active:scale-95 text-white font-medium text-sm transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Next'}
            </button>
          </div>
        </form>

        {/* Footer Language & Links */}
        <div className="mt-auto pt-16 flex items-center justify-between text-xs text-white/50">
          <span className="hover:text-white/80 cursor-pointer">
            English (United States) â–¾
          </span>
          <div className="flex gap-4">
            <span className="hover:text-white/80 cursor-pointer">Help</span>
            <span className="hover:text-white/80 cursor-pointer">Privacy</span>
            <span className="hover:text-white/80 cursor-pointer">Terms</span>
          </div>
        </div>
      </main>
    </div>
  );
}

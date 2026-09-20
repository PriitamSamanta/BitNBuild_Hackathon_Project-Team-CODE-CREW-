'use client';

import React, { useState } from 'react';
import { Globe, User, PhoneCall, ChevronDown, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CitizenHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEmergencyClick: () => void;
}

export function CitizenHeader({
  activeTab,
  onTabChange,
  onEmergencyClick,
}: CitizenHeaderProps) {
  const { setUserRole } = useApp();
  const [language, setLanguage] = useState<'English' | 'ગુજરાતી' | 'हिंदी'>('English');
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090A0F]/95 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onTabChange('report')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 ring-1 ring-red-500/40">
            <span className="text-white font-extrabold text-xl tracking-wider">R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg tracking-tight">Res-Q</span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Safer Communities • Stronger Tomorrow
            </p>
          </div>
        </div>

        {/* Center Nav Tabs matching Image 1 */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#12141F] p-1 rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'home'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onTabChange('report')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Report
          </button>
          <button
            type="button"
            onClick={() => onTabChange('safety')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'safety'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Safety Tips
          </button>
          <button
            type="button"
            onClick={() => onTabChange('track')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'track'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Track Report
          </button>
        </nav>

        {/* Right actions: Language, Role Switcher, Guest User, Emergency 112 */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Switch to Admin Command Center Button */}
          <button
            type="button"
            onClick={() => setUserRole('admin')}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 sm:px-3 py-2 rounded-lg transition-all font-semibold"
            title="Switch to Admin Command Center"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin Mode</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#12141F] hover:bg-[#181B2A] border border-white/[0.08] px-3 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#12141F] border border-white/[0.1] rounded-lg shadow-xl py-1 z-50">
                {(['English', 'ગુજરાતી', 'हिंदी'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Guest User Pill */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-[#12141F] border border-white/[0.08] px-3 py-2 rounded-lg">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Guest User</span>
          </div>

          {/* Emergency 112 Button */}
          <button
            type="button"
            onClick={onEmergencyClick}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-red-600/30 border border-red-500/50 hover:border-red-400 transition-all transform active:scale-95"
          >
            <div className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black tracking-wide leading-none">Emergency 112</div>
              <div className="text-[10px] text-red-100 font-normal opacity-90 leading-tight hidden xs:block">
                Tap for immediate help
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

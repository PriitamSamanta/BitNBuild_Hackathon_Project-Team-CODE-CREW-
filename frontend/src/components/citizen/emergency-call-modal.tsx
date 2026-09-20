'use client';

import React from 'react';
import { PhoneCall, X, ShieldAlert, MapPin } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/citizenApi';
import { LocationCoordinates } from '@/types/incident';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: LocationCoordinates;
}

export function EmergencyCallModal({
  isOpen,
  onClose,
  userLocation,
}: EmergencyCallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12141F] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-900/30 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black text-lg tracking-wide uppercase">
                Emergency Dispatch 112
              </h3>
              <p className="text-xs text-red-100">National Unified Emergency Response</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main 112 Call Button */}
          <a
            href="tel:112"
            className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-600/40 transition-all transform active:scale-98 group"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>Call 112 Now (Toll-Free)</span>
          </a>

          {/* Current GPS Location for Operator */}
          <div className="bg-[#090A0F] border border-white/[0.08] rounded-xl p-3.5 flex items-start gap-3">
            <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="text-slate-400 font-medium">Read this location to the operator:</span>
              <p className="text-white font-mono font-medium">
                {userLocation.address || 'Ahmedabad, Gujarat (Coordinates below)'}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>

          {/* Other Direct Hotlines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Direct Specialized Helplines
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {EMERGENCY_CONTACTS.slice(1).map((item) => (
                <a
                  key={item.id}
                  href={`tel:${item.number}`}
                  className="p-3 bg-[#090A0F] hover:bg-[#181B2A] border border-white/[0.06] hover:border-white/[0.15] rounded-xl transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                      {item.title}
                    </span>
                    <span className="text-xs font-bold text-red-400 font-mono">
                      {item.number}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">{item.availableHours}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-[#090A0F]/60 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-slate-400">
            Calls to emergency services are free and prioritized on all mobile carriers.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { LocationCoordinates, IncidentCategory } from '@/types/incident';

const LiveMap = dynamic(
  () => import('@/components/LiveMap').then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-white/[0.08] bg-[#090A0F] text-xs text-slate-400">
        Loading emergency map...
      </div>
    ),
  }
);

interface ContextMapProps {
  currentLocation: LocationCoordinates;
  onLocationChange: (loc: LocationCoordinates) => void;
  selectedCategory?: IncidentCategory;
}

export function ContextMap({
  currentLocation,
  onLocationChange,
}: ContextMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`isolate relative z-0 bg-[#12141F] border border-white/[0.08] rounded-2xl p-5 shadow-lg space-y-4 transition-all overflow-hidden ${
          isExpanded
            ? 'fixed inset-4 sm:inset-10 !z-[9999] bg-[#12141F] border-white/20 shadow-2xl flex flex-col justify-between'
            : ''
        }`}
      >
        {/* Map Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base tracking-tight">Your Location</h3>
              <p className="text-[11px] text-slate-400">Real-time emergency command map & active units</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#090A0F] hover:bg-[#181B2A] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
        </div>

        {/* LiveMap Canvas - EXACTLY LIKE ADMIN PANEL */}
        <div className={`relative w-full rounded-xl overflow-hidden border border-white/[0.1] ${isExpanded ? 'flex-1 min-h-[480px]' : ''}`}>
          <LiveMap
            height={isExpanded ? '100%' : '320px'}
            userLocation={currentLocation}
            onLocationSelect={(coords) => {
              onLocationChange({
                lat: coords.lat,
                lng: coords.lng,
                area: coords.area || 'Bodakdev',
                address: coords.address || `${coords.area || 'SG Highway'}, Bodakdev, Ahmedabad, Gujarat`,
              });
            }}
            showTeams={true}
            showHospitals={true}
            showLegend={true}
          />
        </div>

        {/* Location Readout Pill */}
        <div className="bg-[#090A0F] border border-white/[0.06] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-slate-300 font-medium truncate">
              {currentLocation.address || 'SG Highway, Bodakdev, Ahmedabad, Gujarat'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono shrink-0">
            GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </span>
        </div>
      </div>
    </>
  );
}

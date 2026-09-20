'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  MapPin,
  Flame,
  Car,
  Waves,
  HeartPulse,
  Biohazard,
  Building,
  TreePine,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { CitizenIncident, IncidentCategory } from '@/types/incident';
import { trackIncidentStatus } from '@/lib/citizenApi';

interface TrackReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrackingCode?: string;
}

const CATEGORY_ICONS: Record<IncidentCategory, React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  accident: Car,
  flood: Waves,
  medical: HeartPulse,
  chemical: Biohazard,
  infrastructure: Building,
  natural: TreePine,
  other: HelpCircle,
};

export function TrackReportModal({
  isOpen,
  onClose,
  initialTrackingCode = '',
}: TrackReportModalProps) {
  const [queryCode, setQueryCode] = useState(initialTrackingCode);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [incident, setIncident] = useState<CitizenIncident | null>(null);

  const handleSearch = useCallback(async (codeToSearch?: string) => {
    const code = (codeToSearch || queryCode).trim();
    if (!code) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await trackIncidentStatus(code);
      setIncident(result);
    } catch {
      setIncident(null);
    } finally {
      setLoading(false);
    }
  }, [queryCode]);

  useEffect(() => {
    if (initialTrackingCode) {
      setQueryCode(initialTrackingCode);
      handleSearch(initialTrackingCode);
    }
  }, [initialTrackingCode, handleSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12141F] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#161928]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Track Emergency Report</h3>
              <p className="text-xs text-slate-400">Live operational status and dispatch timeline</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Search Bar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Enter Incident Tracking ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={queryCode}
                  onChange={(e) => setQueryCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. RESQ-2026-8491"
                  className="w-full bg-[#090A0F] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-red-500/60 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={loading || !queryCode.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
              </button>
            </div>
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Recent reports:</span>
            <button
              type="button"
              onClick={() => {
                setQueryCode('RESQ-2026-8491');
                handleSearch('RESQ-2026-8491');
              }}
              className="text-red-400 hover:underline font-mono"
            >
              RESQ-2026-8491 (Fire)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setQueryCode('RESQ-2026-3102');
                handleSearch('RESQ-2026-3102');
              }}
              className="text-blue-400 hover:underline font-mono"
            >
              RESQ-2026-3102 (Accident)
            </button>
          </div>

          {/* Result Card if found */}
          {incident && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Incident Header Card */}
              <div className="bg-[#090A0F] border border-white/[0.08] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                      {React.createElement(CATEGORY_ICONS[incident.category] || HelpCircle, {
                        className: 'w-5 h-5',
                      })}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{incident.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {incident.trackingCode}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {incident.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>{incident.location.address || 'Ahmedabad, Gujarat'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reported {new Date(incident.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Unit & ETA Card */}
              {incident.assignedTeam && (
                <div className="bg-gradient-to-r from-blue-950/40 via-[#181B2A] to-[#12141F] border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                        Assigned Unit
                      </span>
                      <p className="text-sm font-bold text-white">{incident.assignedTeam.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        Hotline: {incident.assignedTeam.phone || '112'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Estimated Arrival
                    </span>
                    <p className="text-xl font-mono font-black text-amber-400">
                      ~{incident.assignedTeam.etaMinutes} mins
                    </p>
                  </div>
                </div>
              )}

              {/* Operational Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dispatch Lifecycle
                </h5>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
                  {incident.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-[#12141F]" />
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white">{step.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(step.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {searched && !incident && !loading && (
            <div className="text-center py-8 space-y-2 bg-[#090A0F] rounded-xl border border-white/[0.06]">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">No active incident found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Check that your code matches the format RESQ-2026-XXXX or check recent reports
                above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

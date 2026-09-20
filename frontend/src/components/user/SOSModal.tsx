'use client';

import { useState, useEffect } from 'react';
import { AlertOctagon, PhoneCall, MapPin, CheckCircle, X, ShieldAlert, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import type { Incident } from '@/types';

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (incidentId: string) => void;
}

export function SOSModal({ open, onClose, onSuccess }: SOSModalProps) {
  const { addIncident, addNotification } = useApp();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('Detecting location...');
  const [triggered, setTriggered] = useState(false);
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      setTriggered(false);
      setCreatedIncidentId(null);
      setCountdown(null);
      setLocating(true);

      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCoords(c);
            setAddress(`Lat: ${c.lat.toFixed(4)}, Lng: ${c.lng.toFixed(4)} (Current GPS)`);
            setLocating(false);
          },
          () => {
            // Default fallback: Ahmedabad SG Highway
            const fallback = { lat: 23.0225, lng: 72.5714 };
            setCoords(fallback);
            setAddress('SG Highway, Bodakdev, Ahmedabad');
            setLocating(false);
          },
          { timeout: 3500 }
        );
      } else {
        const fallback = { lat: 23.0225, lng: 72.5714 };
        setCoords(fallback);
        setAddress('SG Highway, Bodakdev, Ahmedabad');
        setLocating(false);
      }
    }
  }, [open]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      executeSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const executeSOS = () => {
    const now = new Date().toISOString();
    const id = `SOS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const locationCoords = coords || { lat: 23.0225, lng: 72.5714 };

    const incident: Incident = {
      id,
      type: 'medical',
      title: '🚨 CRITICAL SOS CITIZEN ALERT',
      location: address || 'Emergency Location',
      coordinates: locationCoords,
      severity: 'critical',
      score: 99,
      confidence: 100,
      source: 'citizen',
      peopleAffected: 1,
      status: 'reported',
      assignedTeamss: [],
      recommendedResources: [],
      createdAt: now,
      updatedAt: now,
      description: 'One-touch SOS emergency triggered by citizen. Immediate police, medical, and rescue assistance requested.',
      timeline: [
        {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          event: 'One-Touch SOS Broadcast Initiated',
          icon: '🚨',
        },
        {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          event: 'High-Priority Alert routed to Command Center',
          icon: '📡',
        },
      ],
      duplicateReports: 1,
      riskFactors: ['Citizen SOS Trigger', 'Life Safety Risk', 'Urgent Dispatch Needed'],
      escalationLevel: 3,
      trackingCode: id,
    };

    addIncident(incident);
    setCreatedIncidentId(id);
    setTriggered(true);
    setCountdown(null);

    addNotification({
      type: 'critical',
      title: '🚨 CRITICAL SOS ALERT RECEIVED',
      message: `Emergency SOS triggered at ${incident.location}. Command team notified.`,
      incidentId: id,
    });

    if (onSuccess) {
      onSuccess(id);
    }
  };

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  const handleCancelCountdown = () => {
    setCountdown(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emergency SOS Broadcast"
      subtitle="One-Touch Citizen Emergency Dispatch"
      icon={<ShieldAlert size={20} className="text-emergency" />}
      maxWidth="max-w-md"
    >
      {!triggered ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emergency/20 border-2 border-emergency animate-pulse">
            <AlertOctagon size={40} className="text-emergency" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Emergency SOS Dispatch</h3>
            <p className="mt-1 text-xs text-secondary">
              This will broadcast an immediate critical distress alert to the Res-Q Emergency Command Center with your coordinates.
            </p>
          </div>

          <div className="rounded-xl border border-navy-border bg-navy-secondary/60 p-3 text-left">
            <div className="flex items-center gap-2 text-xs text-muted mb-1">
              <MapPin size={13} className="text-royal" />
              <span className="font-semibold uppercase text-white/80">Broadcast Location</span>
            </div>
            <p className="text-sm font-medium text-white flex items-center gap-2">
              {locating ? (
                <>
                  <Loader2 size={13} className="animate-spin text-royal" />
                  <span>Acquiring GPS coordinates...</span>
                </>
              ) : (
                address
              )}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-navy-card p-3 text-left space-y-1.5 text-xs text-secondary">
            <p className="font-semibold text-white/90">Immediate Actions Triggered:</p>
            <p>• High-priority notification to nearest emergency response teams</p>
            <p>• Police & Ambulance dispatch queues alerted</p>
            <p>• Real-time map beacon marked for field responders</p>
          </div>

          {countdown !== null ? (
            <div className="space-y-3 pt-2">
              <div className="text-4xl font-extrabold text-emergency animate-bounce">
                {countdown}
              </div>
              <p className="text-xs font-semibold text-emergency">Broadcasting SOS in {countdown} seconds...</p>
              <Button
                variant="outline"
                className="w-full border-secondary text-white hover:bg-white/10"
                onClick={handleCancelCountdown}
              >
                Cancel SOS
              </Button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={handleStartCountdown}
                className="w-full rounded-xl bg-emergency hover:bg-emergency-critical py-3.5 text-base font-extrabold text-white shadow-xl shadow-emergency/30 transition-all active:scale-98"
              >
                BROADCAST SOS NOW
              </button>
              <Button variant="ghost" className="w-full text-xs text-secondary hover:text-white" onClick={onClose}>
                Close
              </Button>
            </div>
          )}

          <div className="border-t border-navy-border pt-3">
            <p className="text-[11px] text-muted">Or call official emergency services directly:</p>
            <div className="mt-2 flex justify-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1 rounded-lg border border-emergency/30 bg-emergency/10 px-3 py-1 text-xs font-bold text-emergency hover:bg-emergency/20"
              >
                <PhoneCall size={12} /> 112 (All Emergencies)
              </a>
              <a
                href="tel:108"
                className="flex items-center gap-1 rounded-lg border border-royal/30 bg-royal/10 px-3 py-1 text-xs font-bold text-royal hover:bg-royal/20"
              >
                <PhoneCall size={12} /> 108 (Ambulance)
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-response/20 text-response border border-response/40">
            <CheckCircle size={36} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">SOS Broadcast Active</h3>
            <p className="mt-1 text-xs text-secondary">
              Your distress signal has been received by the Emergency Operations Center.
            </p>
          </div>

          <div className="rounded-xl border border-emergency/40 bg-emergency/10 p-3 text-left space-y-1">
            <p className="text-[10px] uppercase font-bold text-emergency">Incident ID / Tracking Code</p>
            <p className="text-lg font-mono font-extrabold text-white">{createdIncidentId}</p>
            <p className="text-xs text-secondary">Keep your line open. Emergency services are coordinating response.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-royal hover:bg-royal-dark text-white" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

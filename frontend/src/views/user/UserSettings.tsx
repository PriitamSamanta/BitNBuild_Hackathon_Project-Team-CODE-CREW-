'use client';

import { useState } from 'react';
import { Shield, RotateCcw, Smartphone } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

export function UserSettings() {
  const { userRole, setUserRole, resetState } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Citizen Account &amp; Settings</h2>
        <p className="text-sm text-secondary mt-0.5">
          Manage citizen preferences, location privacy, and application mode.
        </p>
      </div>

      {/* Role Selection / Demo Switcher */}
      <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-royal/20 text-royal">
            <Shield size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Application Mode</h3>
            <p className="text-xs text-secondary">Switch between Citizen and Admin Command Center</p>
          </div>
        </div>

        <div className="rounded-xl bg-navy-secondary/50 p-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted uppercase font-bold">Current Active Mode</span>
            <p className="text-sm font-bold text-white capitalize">{userRole} Experience</p>
          </div>

          <button
            onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
            className="rounded-xl bg-royal hover:bg-royal-dark px-4 py-2 text-xs font-bold text-white transition-all shadow-md"
          >
            Switch to Admin Command Center
          </button>
        </div>
      </div>

      {/* Emergency Preferences */}
      <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-response/20 text-response">
            <Smartphone size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Emergency Dispatch Settings</h3>
            <p className="text-xs text-secondary">Device sensors and location permissions</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-xl bg-navy-secondary/40 px-3.5 py-2.5">
            <span className="text-secondary">High Accuracy GPS Geolocation</span>
            <span className="font-semibold text-response">Enabled</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-navy-secondary/40 px-3.5 py-2.5">
            <span className="text-secondary">One-Touch SOS Countdown</span>
            <span className="font-semibold text-white">3 Seconds</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-navy-secondary/40 px-3.5 py-2.5">
            <span className="text-secondary">Local Emergency Dispatch Hub</span>
            <span className="font-semibold text-white">Ahmedabad Municipal Control</span>
          </div>
        </div>
      </div>

      {/* Reset State */}
      <div className="rounded-2xl border border-emergency/30 bg-navy-card p-5 space-y-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emergency/15 text-emergency">
            <RotateCcw size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Clear Demo Data</h3>
            <p className="text-xs text-secondary">Reset locally stored reports and state</p>
          </div>
        </div>

        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 rounded-xl border border-emergency/40 bg-emergency/10 px-3.5 py-2 text-xs font-semibold text-emergency hover:bg-emergency/20 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Demo Records</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                resetState();
                setConfirmReset(false);
              }}
              className="bg-emergency hover:bg-emergency-critical text-white text-xs font-bold"
            >
              Yes, Clear All Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmReset(false)}
              className="border-navy-border text-secondary hover:text-white text-xs"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Bell, MapPin, Menu, AlertOctagon, Shield, PhoneCall } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Logo } from '@/components/Logo';

export type UserPageId =
  | 'dashboard'
  | 'report'
  | 'tracking'
  | 'map'
  | 'hospitals'
  | 'contacts'
  | 'notifications'
  | 'settings';

interface UserHeaderProps {
  current: UserPageId;
  onNavigate: (page: UserPageId) => void;
  onOpenSOS: () => void;
  onOpenSidebar: () => void;
}

export function UserHeader({
  current,
  onNavigate,
  onOpenSOS,
  onOpenSidebar,
}: UserHeaderProps) {
  const { notifications, setUserRole } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="flex items-center gap-3 border-b border-navy-border bg-navy-secondary px-4 py-3 lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-card text-secondary hover:text-white lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="cursor-pointer flex items-center gap-2.5" onClick={() => onNavigate('dashboard')}>
          <Logo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white leading-tight tracking-tight">
                RES-Q
              </h2>
              <span className="rounded bg-royal/20 border border-royal/30 px-1.5 py-0.5 text-[10px] font-bold text-royal uppercase tracking-wider">
                Citizen
              </span>
            </div>
            <p className="hidden text-xs text-secondary sm:block">
              Emergency Assistance &amp; Reporting
            </p>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-lg bg-navy-card/60 px-3 py-1.5 md:flex">
        <MapPin size={14} className="text-royal" />
        <span className="text-sm font-medium text-white">Ahmedabad, Gujarat</span>
      </div>

      <a
        href="tel:112"
        className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-navy-card/80 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-border sm:flex"
      >
        <PhoneCall size={13} className="text-emergency" />
        <span>112 Helpline</span>
      </a>

      {/* SOS Button in Header */}
      <button
        onClick={onOpenSOS}
        className="flex items-center gap-1.5 rounded-lg bg-emergency px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg shadow-emergency/25 transition-all hover:bg-emergency-critical hover:shadow-emergency/40 active:scale-95 animate-pulse"
      >
        <AlertOctagon size={14} strokeWidth={2.5} />
        <span>SOS</span>
      </button>

      {/* Notifications Button */}
      <button
        onClick={() => onNavigate('notifications')}
        className={`relative flex h-9 w-9 items-center justify-center rounded-lg bg-navy-card text-secondary transition-colors hover:text-white ${
          current === 'notifications' ? 'text-white border border-royal/40' : ''
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emergency px-1 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Switch to Admin Mode Button */}
      <button
        onClick={() => setUserRole('admin')}
        className="flex items-center gap-1.5 rounded-lg border border-royal/40 bg-royal/15 px-2.5 py-1.5 text-xs font-semibold text-royal transition-all hover:bg-royal hover:text-white"
        title="Switch to Emergency Command Center Admin Panel"
      >
        <Shield size={14} />
        <span className="hidden sm:inline">Admin Mode</span>
      </button>
    </header>
  );
}

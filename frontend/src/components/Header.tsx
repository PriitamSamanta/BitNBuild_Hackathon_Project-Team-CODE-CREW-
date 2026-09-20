import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, Plus, MapPin, Menu, Search, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from './Sidebar';

interface HeaderProps {
  onNavigate: (page: PageId) => void;
  onCreateIncident: () => void;
  onOpenNotifications: () => void;
  onOpenSidebar: () => void;
}

export function Header({
  onNavigate,
  onCreateIncident,
  onOpenNotifications,
  onOpenSidebar,
}: HeaderProps) {
  const { notifications, setUserRole } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="flex items-center gap-3 border-b border-navy-border bg-navy-secondary px-4 py-3 lg:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-card text-secondary hover:text-white lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-white leading-tight truncate">
          Emergency Command Center
        </h2>
        <p className="hidden text-xs text-secondary sm:block">
          Real-time emergency monitoring &amp; coordination
        </p>
      </div>

      <div className="hidden items-center gap-2 rounded-lg bg-navy-card/60 px-3 py-1.5 md:flex">
        <MapPin size={14} className="text-royal" />
        <span className="text-sm font-medium text-white">Ahmedabad, Gujarat</span>
      </div>

      <div className="hidden items-center gap-1.5 rounded-lg bg-response/10 px-2.5 py-1.5 sm:flex">
        <span className="h-2 w-2 rounded-full bg-response animate-pulse" />
        <span className="text-xs font-bold text-response">LIVE</span>
      </div>

      <button
        onClick={onOpenNotifications}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-navy-card text-secondary transition-colors hover:text-white"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emergency px-1 text-[9px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      <button
        onClick={() => setUserRole('user')}
        className="hidden sm:flex items-center gap-1.5 rounded-lg border border-emergency/40 bg-emergency/10 px-2.5 py-1.5 text-xs font-semibold text-emergency transition-all hover:bg-emergency hover:text-white"
        title="Switch to Citizen Portal"
      >
        <User size={13} />
        <span>Citizen Mode</span>
      </button>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg bg-navy-card px-2.5 py-1.5 transition-colors hover:bg-navy-border"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-royal/20 text-royal text-xs font-bold">
            AD
          </div>
          <span className="hidden text-sm font-medium text-white sm:block">Admin</span>
          <ChevronDown size={14} className="text-secondary" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-12 z-[9990] w-48 rounded-xl border border-navy-border bg-navy-card p-1.5 shadow-2xl animate-fade-in">
            <div className="px-3 py-2 border-b border-navy-border mb-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-muted">Emergency Operations Center</p>
            </div>
            <button
              onClick={() => {
                setUserRole('user');
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emergency hover:bg-navy-secondary font-medium"
            >
              <User size={14} />
              Switch to Citizen Mode
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                setDropdownOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-secondary hover:bg-navy-secondary hover:text-white"
            >
              <Search size={14} />
              Settings
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onCreateIncident}
        className="flex items-center gap-1.5 rounded-lg bg-emergency px-3 py-2 text-sm font-bold text-white shadow-lg shadow-emergency/20 transition-all hover:bg-emergency-critical hover:shadow-emergency/30 active:scale-95"
      >
        <Plus size={16} strokeWidth={2.5} />
        <span className="hidden sm:inline">Create Incident</span>
      </button>
    </header>
  );
}

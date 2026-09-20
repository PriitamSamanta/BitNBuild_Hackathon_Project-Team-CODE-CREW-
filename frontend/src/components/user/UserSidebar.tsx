'use client';

import {
  LayoutDashboard,
  Map,
  FilePlus,
  AlertOctagon,
  ClipboardList,
  Bell,
  Hospital,
  PhoneCall,
  Settings,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useApp } from '@/context/AppContext';
import type { UserPageId } from './UserHeader';

interface NavItem {
  id: UserPageId | 'sos';
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  highlight?: boolean;
}

interface UserSidebarProps {
  current: UserPageId;
  onNavigate: (page: UserPageId) => void;
  onOpenSOS: () => void;
  open: boolean;
  onClose: () => void;
}

export function UserSidebar({
  current,
  onNavigate,
  onOpenSOS,
  open,
  onClose,
}: UserSidebarProps) {
  const { notifications, setUserRole } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const HOME_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Emergency Map', icon: Map },
  ];

  const EMERGENCY_ITEMS: NavItem[] = [
    { id: 'report', label: 'Report Incident', icon: FilePlus, highlight: true },
    { id: 'sos', label: 'SOS Alert', icon: AlertOctagon, highlight: true },
  ];

  const ACTIVITY_ITEMS: NavItem[] = [
    { id: 'tracking', label: 'My Reports', icon: ClipboardList },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const SERVICES_ITEMS: NavItem[] = [
    { id: 'hospitals', label: 'Nearby Hospitals', icon: Hospital },
    { id: 'contacts', label: 'Emergency Contacts', icon: PhoneCall },
  ];

  const ACCOUNT_ITEMS: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (id: UserPageId | 'sos') => {
    if (id === 'sos') {
      onOpenSOS();
    } else {
      onNavigate(id);
    }
    onClose();
  };

  const renderGroup = (label: string, items: NavItem[]) => (
    <div className="mb-4">
      <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const active = current === item.id;
          const Icon = item.icon;
          const isSos = item.id === 'sos';

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-white font-semibold'
                  : isSos
                    ? 'text-emergency hover:bg-emergency/10'
                    : 'text-secondary hover:text-white hover:bg-navy-card/50'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-1 bg-emergency rounded-r-full shadow-[0_0_8px_rgba(230,57,70,0.6)]" />
              )}
              <span
                className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-emergency/10 shadow-[0_0_12px_rgba(230,57,70,0.15)]'
                    : 'group-hover:bg-navy-card/50'
                }`}
              />
              <Icon
                size={18}
                className={`relative z-10 shrink-0 ${
                  active || isSos ? 'text-emergency' : ''
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="relative z-10">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emergency px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-navy-border bg-navy-secondary transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-navy-border">
          <Logo size="md" />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">
              RES-Q
            </h1>
            <p className="text-[10px] text-secondary mt-0.5 leading-none">
              Citizen Emergency Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {renderGroup('Home', HOME_ITEMS)}
          {renderGroup('Emergency', EMERGENCY_ITEMS)}
          {renderGroup('My Activity', ACTIVITY_ITEMS)}
          {renderGroup('Services', SERVICES_ITEMS)}
          {renderGroup('Account', ACCOUNT_ITEMS)}
        </nav>

        <div className="border-t border-navy-border px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-response animate-pulse" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">Emergency Services Online</p>
              <p className="text-[10px] text-muted">24/7 Rapid Response</p>
            </div>
            <ShieldCheck size={16} className="text-response" />
          </div>

          <div className="rounded-xl border border-royal/30 bg-navy-card/60 p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase text-royal">Role Switcher</span>
              <Shield size={12} className="text-royal" />
            </div>
            <p className="text-[11px] text-secondary mb-2">Switch view for demonstration or dispatch command.</p>
            <button
              onClick={() => setUserRole('admin')}
              className="w-full rounded-lg bg-royal hover:bg-royal-dark py-1.5 text-xs font-bold text-white transition-all shadow-sm"
            >
              Open Admin Command
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

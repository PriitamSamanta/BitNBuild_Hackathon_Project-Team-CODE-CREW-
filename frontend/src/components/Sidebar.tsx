import {
  LayoutDashboard,
  Siren,
  Map,
  Truck,
  Users,
  Hospital,
  Bot,
  BarChart3,
  Flame,
  Megaphone,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '@/src/context/AppContext';

export type PageId =
  | 'dashboard'
  | 'incidents'
  | 'map'
  | 'resources'
  | 'teams'
  | 'hospitals'
  | 'ai'
  | 'analytics'
  | 'heatmap'
  | 'alerts'
  | 'notifications'
  | 'settings';

interface NavItem {
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
}

const MAIN: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'incidents', label: 'Incidents', icon: Siren },
  { id: 'map', label: 'Live Map', icon: Map },
];

const OPERATIONS: NavItem[] = [
  { id: 'resources', label: 'Resources', icon: Truck },
  { id: 'teams', label: 'Response Teams', icon: Users },
  { id: 'hospitals', label: 'Hospitals', icon: Hospital },
];

const INTELLIGENCE: NavItem[] = [
  { id: 'ai', label: 'AI Assistant', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'heatmap', label: 'Risk Heatmap', icon: Flame },
];

const COMMUNICATION: NavItem[] = [
  { id: 'alerts', label: 'Alerts & Broadcast', icon: Megaphone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const SYSTEM: NavItem[] = [{ id: 'settings', label: 'Settings', icon: Settings }];

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  const { notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderGroup = (label: string, items: NavItem[]) => (
    <div className="mb-4">
      <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
        {label}
      </p>
      {items.map((item) => {
        const active = current === item.id;
        const Icon = item.icon;
        const showBadge = item.id === 'notifications' && unreadCount > 0;
        return (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              onClose();
            }}
            className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              active
                ? 'text-white'
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
              className={`relative z-10 shrink-0 ${active ? 'text-emergency' : ''}`}
              strokeWidth={active ? 2.5 : 2}
            />
            <span className="relative z-10">{item.label}</span>
            {showBadge && (
              <span className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-emergency px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
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
              Emergency Command Center
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {renderGroup('Main', MAIN)}
          {renderGroup('Operations', OPERATIONS)}
          {renderGroup('Intelligence', INTELLIGENCE)}
          {renderGroup('Communication', COMMUNICATION)}
          {renderGroup('System', SYSTEM)}
        </nav>

        <div className="border-t border-navy-border px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-response animate-pulse" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">All Systems Operational</p>
              <p className="text-[10px] text-muted">System Status</p>
            </div>
            <ShieldCheck size={16} className="text-response" />
          </div>
          <div className="flex items-center gap-2.5 rounded-lg bg-navy-card/50 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-royal/20 text-royal text-xs font-bold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin User</p>
              <p className="text-[10px] text-muted truncate">Emergency Operations Center</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

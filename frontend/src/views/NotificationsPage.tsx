import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from '@/components/Sidebar';

const TYPE_META: Record<string, { color: string; dot: string; bg: string }> = {
  critical: { color: '#EF233C', dot: '🔴', bg: 'rgba(239,35,60,0.1)' },
  warning: { color: '#F59E0B', dot: '🟠', bg: 'rgba(245,158,11,0.1)' },
  info: { color: '#1565D8', dot: '🔵', bg: 'rgba(21,101,216,0.1)' },
  success: { color: '#10B981', dot: '🟢', bg: 'rgba(16,185,129,0.1)' },
  ai: { color: '#7C3AED', dot: '🟣', bg: 'rgba(124,58,237,0.1)' },
};

interface NotificationsPageProps {
  onNavigate: (page: PageId) => void;
  onOpenIncident: (id: string) => void;
}

export function NotificationsPage({ onNavigate, onOpenIncident }: NotificationsPageProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          <p className="text-sm text-secondary mt-0.5">{notifications.filter((n) => !n.read).length} unread of {notifications.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 rounded-lg border border-navy-border bg-navy-card px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:text-white"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
          <button
            onClick={clearNotifications}
            className="flex items-center gap-1.5 rounded-lg border border-navy-border bg-navy-card px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:text-white"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-xl border border-navy-border bg-navy-card py-12 text-center">
            <Bell size={32} className="text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = TYPE_META[n.type];
            return (
              <button
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.incidentId) onOpenIncident(n.incidentId);
                  else onNavigate('incidents');
                }}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-lg ${
                  !n.read ? 'border-navy-border bg-navy-card' : 'border-navy-border/50 bg-navy-card/50'
                }`}
                style={{ borderLeftColor: meta.color, borderLeftWidth: '3px' }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 text-base" style={{ backgroundColor: meta.bg }}>
                  {meta.dot}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${n.read ? 'text-secondary' : 'text-white font-semibold'}`}>{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-emergency shrink-0" />}
                  </div>
                  <p className="text-xs text-secondary mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                </div>
                {n.incidentId && (
                  <ExternalLink size={14} className="text-muted shrink-0 mt-1" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

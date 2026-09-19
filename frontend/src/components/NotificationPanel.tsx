import { useApp } from '@/src/context/AppContext';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import type { PageId } from './Sidebar';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  onOpenIncident: (id: string) => void;
}

const TYPE_META: Record<string, { color: string; dot: string }> = {
  critical: { color: '#EF233C', dot: '🔴' },
  warning: { color: '#F59E0B', dot: '🟠' },
  info: { color: '#1565D8', dot: '🔵' },
  success: { color: '#10B981', dot: '🟢' },
  ai: { color: '#7C3AED', dot: '🟣' },
};

export function NotificationPanel({
  open,
  onClose,
  onNavigate,
  onOpenIncident,
}: NotificationPanelProps) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <div className="absolute right-4 top-16 z-[95] w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-navy-border bg-navy-card shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-navy-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-emergency" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emergency px-1.5 text-[10px] font-bold text-white">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-secondary hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 border-b border-navy-border px-3 py-2">
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-secondary hover:bg-navy-secondary hover:text-white"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
          <button
            onClick={clearNotifications}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-secondary hover:bg-navy-secondary hover:text-white"
          >
            <Trash2 size={13} />
            Clear all
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No notifications
            </div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_META[n.type];
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.incidentId) {
                      onOpenIncident(n.incidentId);
                      onClose();
                    } else {
                      onNavigate('notifications');
                      onClose();
                    }
                  }}
                  className={`flex w-full items-start gap-2.5 border-b border-navy-border/50 px-4 py-3 text-left transition-colors hover:bg-navy-secondary/50 ${
                    !n.read ? 'bg-navy-secondary/30' : ''
                  }`}
                >
                  <span className="text-base shrink-0">{meta.dot}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${n.read ? 'text-secondary' : 'text-white font-semibold'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted mt-1">{timeSince(n.timestamp)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-emergency shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

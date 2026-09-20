'use client';

import { Bell, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { UserPageId } from '@/components/user/UserHeader';

const NOTIF_TYPE_META: Record<string, { color: string; bg: string; icon: string }> = {
  critical: { color: '#EF233C', bg: 'rgba(239,35,60,0.15)', icon: '🚨' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: '⚠️' },
  info: { color: '#1565D8', bg: 'rgba(21,101,216,0.15)', icon: 'ℹ️' },
  success: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', icon: '✅' },
  ai: { color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', icon: '🤖' },
};

interface UserNotificationsProps {
  onNavigate: (page: UserPageId) => void;
  onOpenReport?: (id: string) => void;
}

export function UserNotifications({ onNavigate, onOpenReport }: UserNotificationsProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useApp();

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Notifications &amp; Alerts</h2>
          <p className="text-sm text-secondary mt-0.5">
            {unread} unread updates regarding your emergency reports and public advisories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllNotificationsRead}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-navy-border bg-navy-card px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:text-white"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-navy-border bg-navy-card px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:text-white"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-navy-border bg-navy-card py-16 text-center space-y-2">
            <Bell size={36} className="text-muted mx-auto" />
            <p className="text-sm font-semibold text-white">No New Notifications</p>
            <p className="text-xs text-secondary">
              Updates regarding emergency reports and dispatched teams will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = NOTIF_TYPE_META[n.type] || NOTIF_TYPE_META.info;

            return (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.incidentId) {
                    if (onOpenReport) onOpenReport(n.incidentId);
                    onNavigate('tracking');
                  }
                }}
                className={`flex items-start gap-3.5 rounded-xl border p-4 cursor-pointer transition-all ${
                  !n.read
                    ? 'border-royal/50 bg-royal/5'
                    : 'border-navy-border bg-navy-card hover:bg-navy-secondary/50'
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{ backgroundColor: meta.bg }}
                >
                  {meta.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white truncate">{n.title}</p>
                    <span className="text-[10px] text-muted whitespace-nowrap">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5 leading-relaxed">{n.message}</p>

                  {n.incidentId && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-royal hover:underline">
                      <span>View Report #{n.incidentId}</span>
                      <ExternalLink size={10} />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

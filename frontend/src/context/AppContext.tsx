'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Incident, Resource, Team, Hospital, Notification, Alert, ChatMessage } from '@/types';

type AppState = {
  incidents: Incident[];
  resources: Resource[];
  teams: Team[];
  hospitals: Hospital[];
  notifications: Notification[];
  alerts: Alert[];
  chatHistory: ChatMessage[];
};

const STORAGE_KEY = 'resq_frontend_state_v2';
const QUERY_KEY = ['resq', 'state'];

const EMPTY_STATE: AppState = {
  incidents: [],
  resources: [],
  teams: [],
  hospitals: [],
  notifications: [],
  alerts: [],
  chatHistory: [],
};

function readState(): AppState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    return { ...EMPTY_STATE, ...JSON.parse(raw) } as AppState;
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: AppState) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface AppContextValue extends AppState {
  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  resolveIncident: (id: string) => void;
  dispatchTeam: (teamId: string, incidentId: string) => void;
  updateTeamStatus: (teamId: string, status: Team['status']) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  reallocateResource: (resourceId: string, fromIncident: string, toIncident: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  sendAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'notified' | 'acknowledged' | 'status'>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  resetState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: state = EMPTY_STATE } = useQuery<AppState>({
    queryKey: QUERY_KEY,
    queryFn: readState,
    initialData: EMPTY_STATE,
    initialDataUpdatedAt: 0,
  });

  const updateState = useCallback((updater: (current: AppState) => AppState) => {
    queryClient.setQueryData<AppState>(QUERY_KEY, (current = EMPTY_STATE) => {
      const next = updater(current);
      writeState(next);
      return next;
    });
  }, [queryClient]);

  const addIncident = useCallback((incident: Incident) => updateState((s) => ({ ...s, incidents: [incident, ...s.incidents] })), [updateState]);
  const updateIncident = useCallback((id: string, updates: Partial<Incident>) => updateState((s) => ({ ...s, incidents: s.incidents.map((i) => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i) })), [updateState]);
  const resolveIncident = useCallback((id: string) => updateState((s) => ({
    ...s,
    incidents: s.incidents.map((i) => i.id === id ? { ...i, status: 'resolved', resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : i),
    teams: s.teams.map((t) => t.assignedIncident === id ? { ...t, status: 'available', assignedIncident: undefined, destination: undefined, eta: undefined } : t),
    resources: s.resources.map((r) => r.assignedIncident === id ? { ...r, status: 'available', assignedIncident: undefined, eta: undefined } : r),
  })), [updateState]);
  const dispatchTeam = useCallback((teamId: string, incidentId: string) => updateState((s) => ({
    ...s,
    teams: s.teams.map((t) => t.id === teamId ? { ...t, status: 'en-route', assignedIncident: incidentId, destination: s.incidents.find((i) => i.id === incidentId)?.location } : t),
    incidents: s.incidents.map((i) => i.id === incidentId && !i.assignedTeamss.includes(teamId) ? { ...i, assignedTeamss: [...i.assignedTeamss, teamId], status: 'responding', updatedAt: new Date().toISOString() } : i),
  })), [updateState]);
  const updateTeamStatus = useCallback((teamId: string, status: Team['status']) => updateState((s) => ({ ...s, teams: s.teams.map((t) => t.id === teamId ? { ...t, status } : t) })), [updateState]);
  const updateResource = useCallback((id: string, updates: Partial<Resource>) => updateState((s) => ({ ...s, resources: s.resources.map((r) => r.id === id ? { ...r, ...updates } : r) })), [updateState]);
  const reallocateResource = useCallback((resourceId: string, fromIncident: string, toIncident: string) => updateState((s) => ({
    ...s,
    resources: s.resources.map((r) => r.id === resourceId ? { ...r, assignedIncident: toIncident, status: 'dispatched' } : r),
    notifications: [{ id: `N-${crypto.randomUUID()}`, type: 'ai', title: 'Resource reallocated', message: `${resourceId} reassigned from #${fromIncident} to #${toIncident}`, incidentId: toIncident, read: false, timestamp: new Date().toISOString() }, ...s.notifications],
  })), [updateState]);
  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => updateState((s) => ({ ...s, notifications: [{ ...n, id: `N-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), read: false }, ...s.notifications] })), [updateState]);
  const markNotificationRead = useCallback((id: string) => updateState((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })), [updateState]);
  const markAllNotificationsRead = useCallback(() => updateState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })), [updateState]);
  const clearNotifications = useCallback(() => updateState((s) => ({ ...s, notifications: [] })), [updateState]);
  const sendAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'notified' | 'acknowledged' | 'status'>) => updateState((s) => ({ ...s, alerts: [{ ...alert, id: `A-${crypto.randomUUID()}`, timestamp: new Date().toISOString(), notified: 0, acknowledged: 0, status: 'pending' }, ...s.alerts] })), [updateState]);
  const addChatMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => updateState((s) => ({ ...s, chatHistory: [...s.chatHistory, { ...msg, id: `C-${crypto.randomUUID()}`, timestamp: new Date().toISOString() }] })), [updateState]);
  const resetState = useCallback(() => { if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY); queryClient.setQueryData(QUERY_KEY, EMPTY_STATE); }, [queryClient]);

  return <AppContext.Provider value={{ ...state, addIncident, updateIncident, resolveIncident, dispatchTeam, updateTeamStatus, updateResource, reallocateResource, addNotification, markNotificationRead, markAllNotificationsRead, clearNotifications, sendAlert, addChatMessage, resetState }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  Incident,
  Resource,
  Team,
  TeamStatus,
  Hospital,
  Notification,
  Alert,
  ChatMessage,
  IncidentType,
  IncidentSource,
  IncidentStatus,
  UserRole,
} from '@/types';

import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { getIncidents } from '@/services/incidentService';
import {
  getTeams,
  updateTeamStatus as updateTeamStatusApi,
} from '@/services/teamService';
import { dispatchTeams } from '@/services/dispatchService';
import type {
  ApiIncident,
  ApiIncidentType,
  ApiIncidentSource,
  ApiIncidentStatus,
  ApiTeam,
  ApiTeamStatus,
} from '@/types/api';



type AppState = {
  userRole: UserRole;
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
const INCIDENTS_QUERY_KEY = ['resq', 'incidents'];
const TEAMS_QUERY_KEY = ['resq', 'teams'];

export const DEFAULT_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Ahmedabad Civil Hospital',
    location: 'Asarwa, Ahmedabad',
    coordinates: { lat: 23.0525, lng: 72.6026 },
    emergencyBeds: 120,
    icuBeds: 35,
    ambulance: 8,
    distance: 4.2,
    status: 'available',
  },
  {
    id: 'HOSP-02',
    name: 'Sterling Hospital',
    location: 'Memnagar, Ahmedabad',
    coordinates: { lat: 23.0504, lng: 72.5325 },
    emergencyBeds: 65,
    icuBeds: 20,
    ambulance: 5,
    distance: 2.8,
    status: 'available',
  },
  {
    id: 'HOSP-03',
    name: 'SSG Hospital',
    location: 'Karelibaug, Vadodara',
    coordinates: { lat: 22.3072, lng: 73.1812 },
    emergencyBeds: 95,
    icuBeds: 28,
    ambulance: 6,
    distance: 6.5,
    status: 'available',
  },
  {
    id: 'HOSP-04',
    name: 'Apollo Hospitals',
    location: 'Plot 1A, Bhat, Gandhinagar',
    coordinates: { lat: 23.1118, lng: 72.6102 },
    emergencyBeds: 80,
    icuBeds: 24,
    ambulance: 6,
    distance: 8.1,
    status: 'available',
  },
  {
    id: 'HOSP-05',
    name: 'Zydus Hospital',
    location: 'Thaltej, SG Highway, Ahmedabad',
    coordinates: { lat: 23.0645, lng: 72.5186 },
    emergencyBeds: 55,
    icuBeds: 18,
    ambulance: 4,
    distance: 3.4,
    status: 'available',
  },
  {
    id: 'HOSP-06',
    name: 'Shalby Multi-Specialty Hospital',
    location: 'SG Highway, Bodakdev, Ahmedabad',
    coordinates: { lat: 23.0135, lng: 72.5028 },
    emergencyBeds: 45,
    icuBeds: 15,
    ambulance: 3,
    distance: 1.9,
    status: 'busy',
  },
];

export const DEFAULT_RESOURCES: Resource[] = [
  {
    id: 'RES-AMB-01',
    type: 'ambulance',
    status: 'available',
    location: 'Central Trauma Base - Ahmedabad',
    coordinates: { lat: 23.0525, lng: 72.6026 },
    eta: 8,
  },
  {
    id: 'RES-FT-01',
    type: 'fire-tender',
    status: 'available',
    location: 'SG Highway Fire Station',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    eta: 6,
  },
  {
    id: 'RES-DRN-01',
    type: 'drone',
    status: 'available',
    location: 'Disaster Cell Drone Unit',
    coordinates: { lat: 23.0400, lng: 72.5400 },
    eta: 4,
  },
  {
    id: 'RES-BOAT-01',
    type: 'rescue-boat',
    status: 'available',
    location: 'Sabarmati Riverfront Rescue Station',
    coordinates: { lat: 23.0300, lng: 72.5800 },
    eta: 12,
  },
  {
    id: 'RES-MED-01',
    type: 'medical-kit',
    status: 'available',
    location: 'District Rapid Response Hub',
    coordinates: { lat: 23.0450, lng: 72.5500 },
    eta: 5,
  },
];

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'TEAM-MED-01',
    name: '108 EMRI Medical Unit 1',
    type: 'medical',
    status: 'available',
    vehicle: 'Advanced Life Ambulance',
    coordinates: { lat: 23.0338, lng: 72.5126 },
    eta: 7,
  },
  {
    id: 'TEAM-FIRE-01',
    name: 'Bodakdev Fire Tender 01',
    type: 'fire',
    status: 'available',
    vehicle: 'Fire Engine Unit 4',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    eta: 5,
  },
  {
    id: 'TEAM-RESCUE-01',
    name: 'SDRF Rapid Rescue Unit 2',
    type: 'rescue',
    status: 'available',
    vehicle: 'Heavy Rescue Vehicle',
    coordinates: { lat: 23.0450, lng: 72.5500 },
    eta: 9,
  },
  {
    id: 'TEAM-POLICE-01',
    name: 'Traffic Control PCR 05',
    type: 'police',
    status: 'available',
    vehicle: 'Police Cruiser',
    coordinates: { lat: 23.0200, lng: 72.5600 },
    eta: 4,
  },
];

const EMPTY_STATE: AppState = {
  userRole: 'admin',
  incidents: [],
  resources: DEFAULT_RESOURCES,
  teams: DEFAULT_TEAMS,
  hospitals: DEFAULT_HOSPITALS,
  notifications: [],
  alerts: [],
  chatHistory: [],
};

/* =========================================================
   Backend → Frontend type adapters
   ========================================================= */

function mapIncidentType(type: ApiIncidentType): IncidentType {
  switch (type) {
    case 'fire':
      return 'fire';

    case 'flood':
      return 'flood';

    case 'accident':
      return 'accident';

    case 'medical':
      return 'medical';

    case 'chemical':
      return 'chemical';

    case 'structural':
      return 'infrastructure';

    case 'road':
      return 'accident';

    case 'other':
    default:
      return 'infrastructure';
  }
}

function mapIncidentSource(source: ApiIncidentSource): IncidentSource {
  switch (source) {
    case 'citizen':
      return 'citizen';

    case 'field_team':
      return 'field';

    case 'sensor':
      return 'iot';

    case 'admin':
      return 'government';

    case 'system':
      return 'government';

    default:
      return 'citizen';
  }
}

function mapIncidentStatus(status: ApiIncidentStatus): IncidentStatus {
  switch (status) {
    case 'reported':
      return 'reported';

    case 'verified':
      return 'verified';

    case 'assigned':
      return 'assigned';

    case 'en_route':
      return 'en-route';

    case 'on_scene':
      return 'on-scene';

    case 'rescue_in_progress':
      return 'rescue-in-progress';

    case 'resolved':
      return 'resolved';

    case 'closed':
      return 'closed';

    default:
      return 'reported';
  }
}

function mapApiIncident(apiIncident: ApiIncident): Incident {
  return {
    id: apiIncident.incidentId,

    type: mapIncidentType(apiIncident.type),

    title: apiIncident.title,

    location:
      apiIncident.location.address ||
      `${apiIncident.location.latitude.toFixed(5)}, ${apiIncident.location.longitude.toFixed(5)}`,

    coordinates: {
      lat: apiIncident.location.latitude,
      lng: apiIncident.location.longitude,
    },

    severity: apiIncident.severity,

    /*
     * The backend currently provides priority rather than
     * the frontend's 0-100 score.
     *
     * Convert priority 1-5 → approximate 0-100.
     */
    score: Math.min(100, Math.max(0, apiIncident.priority * 20)),

    /*
     * Backend does not currently expose AI confidence.
     * Keep a safe frontend value until the API provides it.
     */
    confidence: 100,

    source: mapIncidentSource(apiIncident.source),

    peopleAffected: apiIncident.peopleAffected,

    status: mapIncidentStatus(apiIncident.status),

    assignedTeamss: apiIncident.assignedTeams.map(
      (team) =>
        typeof team === 'string'
          ? team
          : team.teamId,
    ),

    recommendedResources: [],

    createdAt: apiIncident.createdAt,

    updatedAt: apiIncident.updatedAt,

    description: apiIncident.description,

    timeline: [],

    /*
     * Duplicate reports are not currently returned by the
     * incident API, so the UI starts at 1.
     */
    duplicateReports: 1,

    riskFactors: [],

    escalationLevel: apiIncident.severity === 'critical'
      ? 3
      : apiIncident.severity === 'high'
        ? 2
        : apiIncident.severity === 'medium'
          ? 1
          : 0,

    expectedArrival: undefined,
  };
}

function mapTeamStatus(status: ApiTeamStatus): Team['status'] {
  switch (status) {
    case 'available':
      return 'available';

    case 'busy':
      return 'busy';

    case 'en_route':
      return 'en-route';

    case 'on_scene':
      return 'on-scene';

    case 'offline':
      return 'offline';

    default:
      return 'available';
  }
}

function getTeamVehicle(type: ApiTeam['type']): string {
  switch (type) {
    case 'fire':
      return 'Fire Tender';

    case 'medical':
      return 'Ambulance';

    case 'rescue':
      return 'Rescue Vehicle';

    case 'police':
      return 'Police Vehicle';

    case 'disaster_response':
      return 'Disaster Response Vehicle';

    default:
      return 'Emergency Response Vehicle';
  }
}

function mapApiTeam(apiTeam: ApiTeam): Team {
  const currentIncident = apiTeam.currentIncident;

  return {
    id: apiTeam.teamId,

    name: apiTeam.name,

    type: apiTeam.type,

    status: mapTeamStatus(apiTeam.status),

    vehicle: getTeamVehicle(apiTeam.type),

    coordinates: {
      lat: apiTeam.location.latitude,
      lng: apiTeam.location.longitude,
    },

    assignedIncident: apiTeam.currentIncident
      ? apiTeam.currentIncident.incidentId
      : undefined,

    destination:
      currentIncident?.location.address ||
      undefined,

    eta: undefined,
  };
}

/* =========================================================
   Local storage helpers
   ========================================================= */

function readState(): AppState {
  if (typeof window === 'undefined') {
    return EMPTY_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return EMPTY_STATE;
    }

    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...parsed,
      hospitals:
        parsed.hospitals && parsed.hospitals.length > 0
          ? parsed.hospitals
          : DEFAULT_HOSPITALS,
      resources:
        parsed.resources && parsed.resources.length > 0
          ? parsed.resources
          : DEFAULT_RESOURCES,
      teams:
        parsed.teams && parsed.teams.length > 0
          ? parsed.teams
          : DEFAULT_TEAMS,
    } as AppState;
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: AppState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  }
}

/* =========================================================
   Context
   ========================================================= */

interface AppContextValue extends AppState {
  setUserRole: (role: UserRole) => void;

  addIncident: (incident: Incident) => void;

  updateIncident: (
    id: string,
    updates: Partial<Incident>,
  ) => void;

  resolveIncident: (id: string) => void;

  dispatchTeam: (
    teamId: string,
    incidentId: string,
  ) => void;

  updateTeamStatus: (
    teamId: string,
    status: Team['status'],
  ) => void;

  updateResource: (
    id: string,
    updates: Partial<Resource>,
  ) => void;

  reallocateResource: (
    resourceId: string,
    fromIncident: string,
    toIncident: string,
  ) => void;

  addNotification: (
    n: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  ) => void;

  markNotificationRead: (id: string) => void;

  markAllNotificationsRead: () => void;

  clearNotifications: () => void;

  sendAlert: (
    alert: Omit<
      Alert,
      'id' | 'timestamp' | 'notified' | 'acknowledged' | 'status'
    >,
  ) => void;

  addChatMessage: (
    msg: Omit<ChatMessage, 'id' | 'timestamp'>,
  ) => void;

  resetState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const [userRole, setUserRoleState] = useState<UserRole>('admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = window.localStorage.getItem('resq_user_role') as UserRole | null;
      if (savedRole === 'admin' || savedRole === 'user') {
        setUserRoleState(savedRole);
      }
    }
  }, []);

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('resq_user_role', role);
    }
  }, []);

  /*
   * Keep the existing local state for the other UI modules.
   */
  const { data: localState = EMPTY_STATE } =
    useQuery<AppState>({
      queryKey: QUERY_KEY,
      queryFn: readState,
      initialData: EMPTY_STATE,
      initialDataUpdatedAt: 0,
    });


  const {
    data: backendIncidents = [],
    isLoading: incidentsLoading,
    isError: incidentsError,
  } = useQuery<ApiIncident[]>({
    queryKey: INCIDENTS_QUERY_KEY,
    queryFn: async (): Promise<ApiIncident[]> => {
      return await getIncidents();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const {
    data: backendTeams = [],
    isLoading: teamsLoading,
    isError: teamsError,
  } = useQuery<ApiTeam[]>({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: async (): Promise<ApiTeam[]> => {
      return await getTeams();
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const updateState = useCallback(
    (
      updater: (current: AppState) => AppState,
    ) => {
      queryClient.setQueryData<AppState>(
        QUERY_KEY,
        (current = EMPTY_STATE) => {
          const next = updater(current);

          writeState(next);

          return next;
        },
      );
    },
    [queryClient],
  );

  /* =======================================================
     Existing UI actions
     ======================================================= */

  const addIncident = useCallback(
    async (incident: Incident) => {
      updateState((s) => ({
        ...s,
        incidents: [
          incident,
          ...s.incidents.filter((i) => i.id !== incident.id),
        ],
      }));

      try {
        await api.post('/api/incidents', {
          type: incident.type,
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          source: incident.source,
          location: {
            address: incident.location,
            latitude: incident.coordinates?.lat ?? 23.0225,
            longitude: incident.coordinates?.lng ?? 72.5714,
          },
          peopleAffected: incident.peopleAffected,
          priority:
            incident.severity === 'critical'
              ? 5
              : incident.severity === 'high'
                ? 4
                : incident.severity === 'medium'
                  ? 3
                  : 2,
        });

        await queryClient.invalidateQueries({
          queryKey: INCIDENTS_QUERY_KEY,
        });
      } catch (err) {
        console.warn('Backend sync skipped or offline (local state active):', err);
      }
    },
    [updateState, queryClient],
  );

  const updateIncident = useCallback(
    (
      id: string,
      updates: Partial<Incident>,
    ) => {
      updateState((s) => ({
        ...s,

        incidents: s.incidents.map((incident) =>
          incident.id === id
            ? {
              ...incident,
              ...updates,
              updatedAt:
                new Date().toISOString(),
            }
            : incident,
        ),
      }));
    },
    [updateState],
  );

  const resolveIncident = useCallback(
    (id: string) => {
      updateState((s) => ({
        ...s,

        incidents: s.incidents.map((incident) =>
          incident.id === id
            ? {
              ...incident,
              status: 'resolved',
              resolvedAt:
                new Date().toISOString(),
              updatedAt:
                new Date().toISOString(),
            }
            : incident,
        ),

        teams: s.teams.map((team) =>
          team.assignedIncident === id
            ? {
              ...team,
              status: 'available',
              assignedIncident: undefined,
              destination: undefined,
              eta: undefined,
            }
            : team,
        ),

        resources: s.resources.map((resource) =>
          resource.assignedIncident === id
            ? {
              ...resource,
              status: 'available',
              assignedIncident: undefined,
              eta: undefined,
            }
            : resource,
        ),
      }));
    },
    [updateState],
  );





  const updateResource = useCallback(
    (
      id: string,
      updates: Partial<Resource>,
    ) => {
      updateState((s) => ({
        ...s,

        resources: s.resources.map((resource) =>
          resource.id === id
            ? {
              ...resource,
              ...updates,
            }
            : resource,
        ),
      }));
    },
    [updateState],
  );

  const reallocateResource = useCallback(
    (
      resourceId: string,
      fromIncident: string,
      toIncident: string,
    ) => {
      updateState((s) => ({
        ...s,

        resources: s.resources.map((resource) =>
          resource.id === resourceId
            ? {
              ...resource,
              assignedIncident: toIncident,
              status: 'dispatched',
            }
            : resource,
        ),

        notifications: [
          {
            id: `N-${crypto.randomUUID()}`,
            type: 'ai',
            title: 'Resource reallocated',
            message: `${resourceId} reassigned from #${fromIncident} to #${toIncident}`,
            incidentId: toIncident,
            read: false,
            timestamp:
              new Date().toISOString(),
          },
          ...s.notifications,
        ],
      }));
    },
    [updateState],
  );

  const addNotification = useCallback(
    (
      n: Omit<
        Notification,
        'id' | 'timestamp' | 'read'
      >,
    ) => {
      updateState((s) => ({
        ...s,

        notifications: [
          {
            ...n,
            id: `N-${crypto.randomUUID()}`,
            timestamp:
              new Date().toISOString(),
            read: false,
          },
          ...s.notifications,
        ],
      }));
    },
    [updateState],
  );

  useSocket((notification) => {
    addNotification(notification);
  });

  const dispatchTeam = useCallback(
    async (
      teamId: string,
      incidentId: string,
    ) => {
      // 1. Immediately update local state so UI reflects it right away
      updateState((s) => ({
        ...s,
        teams: s.teams.map((t) =>
          t.id === teamId
            ? {
              ...t,
              status: 'en-route' as const,
              assignedIncident: incidentId,
              destination: s.incidents.find((i) => i.id === incidentId)?.location,
              eta: t.eta ?? 6,
            }
            : t,
        ),
        incidents: s.incidents.map((i) =>
          i.id === incidentId
            ? {
              ...i,
              assignedTeamss: i.assignedTeamss.includes(teamId)
                ? i.assignedTeamss
                : [...i.assignedTeamss, teamId],
              status: 'responding' as const,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...i.timeline,
                {
                  time: new Date().toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  event: `Team ${teamId} dispatched (En Route)`,
                  icon: '🚒',
                },
              ],
            }
            : i,
        ),
      }));

      addNotification({
        type: 'success',
        title: 'Team Dispatched',
        message: `${teamId} dispatched to ${incidentId}.`,
        incidentId,
      });

      // 2. Also try backend dispatch if backend incident exists
      try {
        const backendIncident = backendIncidents.find(
          (incident) => incident.incidentId === incidentId || incident._id === incidentId,
        );

        if (backendIncident) {
          await dispatchTeams(
            backendIncident._id,
            [teamId],
          );

          await queryClient.invalidateQueries({
            queryKey: INCIDENTS_QUERY_KEY,
          });

          await queryClient.invalidateQueries({
            queryKey: TEAMS_QUERY_KEY,
          });
        }
      } catch (error) {
        console.warn('Backend team dispatch sync error (local state active):', error);
      }
    },
    [
      backendIncidents,
      queryClient,
      addNotification,
      updateState,
    ],
  );

  const updateTeamStatus = useCallback(
    async (teamId: string, status: TeamStatus) => {
      updateState((s) => ({
        ...s,
        teams: s.teams.map((t) => (t.id === teamId ? { ...t, status } : t)),
      }));

      try {
        await updateTeamStatusApi(
          teamId,
          status === 'en-route'
            ? 'en_route'
            : status === 'on-scene'
              ? 'on_scene'
              : status,
        );

        await queryClient.invalidateQueries({
          queryKey: TEAMS_QUERY_KEY,
        });

        addNotification({
          type: 'success',
          title: 'Team Status Updated',
          message: `${teamId} status changed to ${status.replace('-', ' ')}`,
        });
      } catch (error) {
        console.warn('Backend team status update error:', error);
      }
    },
    [addNotification, queryClient, updateState],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      updateState((s) => ({
        ...s,

        notifications:
          s.notifications.map(
            (notification) =>
              notification.id === id
                ? {
                  ...notification,
                  read: true,
                }
                : notification,
          ),
      }));
    },
    [updateState],
  );

  const markAllNotificationsRead =
    useCallback(() => {
      updateState((s) => ({
        ...s,

        notifications:
          s.notifications.map(
            (notification) => ({
              ...notification,
              read: true,
            }),
          ),
      }));
    }, [updateState]);

  const clearNotifications =
    useCallback(() => {
      updateState((s) => ({
        ...s,
        notifications: [],
      }));
    }, [updateState]);

  const sendAlert = useCallback(
    (
      alert: Omit<
        Alert,
        | 'id'
        | 'timestamp'
        | 'notified'
        | 'acknowledged'
        | 'status'
      >,
    ) => {
      updateState((s) => ({
        ...s,

        alerts: [
          {
            ...alert,
            id: `A-${crypto.randomUUID()}`,
            timestamp:
              new Date().toISOString(),
            notified: 0,
            acknowledged: 0,
            status: 'pending',
          },
          ...s.alerts,
        ],
      }));
    },
    [updateState],
  );

  const addChatMessage = useCallback(
    (
      msg: Omit<
        ChatMessage,
        'id' | 'timestamp'
      >,
    ) => {
      updateState((s) => ({
        ...s,

        chatHistory: [
          ...s.chatHistory,
          {
            ...msg,
            id: `C-${crypto.randomUUID()}`,
            timestamp:
              new Date().toISOString(),
          },
        ],
      }));
    },
    [updateState],
  );

  const resetState = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(
        STORAGE_KEY,
      );
    }

    queryClient.setQueryData(
      QUERY_KEY,
      EMPTY_STATE,
    );

    queryClient.invalidateQueries({
      queryKey: INCIDENTS_QUERY_KEY,
    });
  }, [queryClient]);

  /*
   * Merge backend data with local additions/mutations.
   * Ensures shared reactivity across both Admin and Citizen panels.
   */
  const backendIncidentList = backendIncidents.map(mapApiIncident);
  const localIncidents = (localState.incidents || []).filter(
    (li) => !backendIncidentList.some((bi) => bi.id === li.id),
  );
  const incidents: Incident[] = [...localIncidents, ...backendIncidentList].map((inc) => {
    const localMatch = (localState.incidents || []).find((l) => l.id === inc.id);
    return localMatch ? { ...inc, ...localMatch } : inc;
  });

  const backendTeamList = backendTeams.map(mapApiTeam);
  const baseTeams = backendTeamList.length > 0 ? backendTeamList : DEFAULT_TEAMS;
  const teams: Team[] = baseTeams.map((t) => {
    const localMatch = (localState.teams || []).find((lt) => lt.id === t.id);
    return localMatch ? { ...t, ...localMatch } : t;
  });

  const hospitals: Hospital[] =
    localState.hospitals && localState.hospitals.length > 0
      ? localState.hospitals
      : DEFAULT_HOSPITALS;

  const resources: Resource[] =
    localState.resources && localState.resources.length > 0
      ? localState.resources
      : DEFAULT_RESOURCES;

  void incidentsLoading;
  void incidentsError;
  void teamsLoading;
  void teamsError;

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        incidents,
        resources,
        teams,
        hospitals,
        notifications: localState.notifications,
        alerts: localState.alerts,
        chatHistory: localState.chatHistory,

        addIncident,
        updateIncident,
        resolveIncident,
        dispatchTeam,
        updateTeamStatus,
        updateResource,
        reallocateResource,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        sendAlert,
        addChatMessage,
        resetState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within AppProvider',
    );
  }

  return context;
}
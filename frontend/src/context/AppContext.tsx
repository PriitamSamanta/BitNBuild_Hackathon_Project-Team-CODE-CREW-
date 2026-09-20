'use client';

import {
  createContext,
  useCallback,
  useContext,
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
} from '@/types';

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

const EMPTY_STATE: AppState = {
  incidents: [],
  resources: [],
  teams: [],
  hospitals: [],
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

    return {
      ...EMPTY_STATE,
      ...JSON.parse(raw),
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

  const incidents: Incident[] =
    backendIncidents.map(mapApiIncident);

  const teams: Team[] =
    backendTeams.map(mapApiTeam);

  /*
   * Real incidents from the ResQAI backend.
   */


  /*
   * Convert backend incidents into the existing UI model.
   */

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
    (incident: Incident) => {
      updateState((s) => ({
        ...s,
        incidents: [
          incident,
          ...s.incidents,
        ],
      }));
    },
    [updateState],
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

  const dispatchTeam = useCallback(
    async (
      teamId: string,
      incidentId: string,
    ) => {
      try {
        // Find the backend incident so we can use its MongoDB _id.
        const backendIncident = backendIncidents.find(
          (incident) => incident.incidentId === incidentId,
        );

        if (!backendIncident) {
          throw new Error(
            `Backend incident not found: ${incidentId}`,
          );
        }

        await dispatchTeams(
          backendIncident._id,
          [teamId],
        );

        // Refresh backend data after dispatch.
        await queryClient.invalidateQueries({
          queryKey: INCIDENTS_QUERY_KEY,
        });

        await queryClient.invalidateQueries({
          queryKey: TEAMS_QUERY_KEY,
        });

        addNotification({
          type: 'success',
          title: 'Team Dispatched',
          message: `${teamId} dispatched to ${incidentId}.`,
          incidentId,
        });
      } catch (error) {
        console.error(
          'Failed to dispatch team:',
          error,
        );

        addNotification({
          type: 'warning',
          title: 'Dispatch Failed',
          message:
            error instanceof Error
              ? error.message
              : `Could not dispatch ${teamId}.`,
          incidentId,
        });
      }
    },
    [
      backendIncidents,
      queryClient,
      addNotification,
    ],
  );

  const updateTeamStatus = useCallback(
    async (teamId: string, status: TeamStatus) => {
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
        console.error(
          'Failed to update team status:',
          error,
        );

        addNotification({
          type: 'warning',
          title: 'Status Update Failed',
          message: `Could not update ${teamId} status.`,
        });
      }
    },
    [addNotification, queryClient],
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
   * Prevent unused-variable warnings while we
   * gradually migrate the remaining UI modules.
   */
  void incidentsLoading;

  return (
    <AppContext.Provider
      value={{
        /*
         * IMPORTANT:
         * incidents now come from MongoDB/backend.
         */
        incidents,

        /*
         * These remain local for the moment.
         * We'll connect them to the backend next.
         */
        resources: localState.resources,
        teams,
        hospitals: localState.hospitals,
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
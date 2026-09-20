import api from '@/lib/api';
import type { ApiIncident, ApiResponse, ApiTeam } from '@/types/api';

interface DispatchResult {
  incident: ApiIncident;
  teams: ApiTeam[];
}

export const dispatchTeams = async (
  incidentId: string,
  teamIds: string[],
): Promise<DispatchResult> => {
  const response = await api.post<ApiResponse<DispatchResult>>(
    `/api/incidents/${incidentId}/dispatch`,
    {
      teamIds,
    },
  );

  return response.data.data;
};
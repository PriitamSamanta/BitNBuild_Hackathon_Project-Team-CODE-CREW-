import api from '@/lib/api';
import type { ApiResponse, ApiTeam, ApiTeamStatus } from '@/types/api';

export const getTeams = async (): Promise<ApiTeam[]> => {
  const response = await api.get<ApiResponse<ApiTeam[]>>(
    '/api/teams',
  );

  return response.data.data;
};

export const getTeam = async (
  id: string,
): Promise<ApiTeam> => {
  const response = await api.get<ApiResponse<ApiTeam>>(
    `/api/teams/${id}`,
  );

  return response.data.data;
};

export const updateTeamStatus = async (
  id: string,
  status: ApiTeamStatus,
): Promise<ApiTeam> => {
  const response = await api.patch<ApiResponse<ApiTeam>>(
    `/api/teams/${id}/status`,
    { status },
  );

  return response.data.data;
};
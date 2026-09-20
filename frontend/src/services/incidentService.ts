import api from '@/lib/api';
import type { ApiIncident, ApiResponse } from '@/types/api';

export const getIncidents = async (): Promise<ApiIncident[]> => {
  const response = await api.get<ApiResponse<ApiIncident[]>>(
    '/api/incidents',
  );

  return response.data.data;
};

export const getIncident = async (
  id: string,
): Promise<ApiIncident> => {
  const response = await api.get<ApiResponse<ApiIncident>>(
    `/api/incidents/${id}`,
  );

  return response.data.data;
};
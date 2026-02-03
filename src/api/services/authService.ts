import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

export const getLeadTracking = async () => {
  const response = await apiClient.get(ENDPOINTS.CAMPAIGNS.STATS); // cite: 60
  return response.data;
};
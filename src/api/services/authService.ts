import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface RoleData {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

export const loginUser = async (credentials: any) => {
  const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

export const getLeadTracking = async () => {
  const response = await apiClient.get(ENDPOINTS.CAMPAIGNS.STATS); // cite: 60
  return response.data;
};

export const getRoles = async () => {
  const response = await apiClient.get(ENDPOINTS.ROLES.BASE);
  return response.data;
};

export const createRole = async (data: RoleData) => {
  const response = await apiClient.post(ENDPOINTS.ROLES.BASE, data);
  return response.data;
};

export const updateRole = async (id: number, data: RoleData) => {
  const response = await apiClient.put(ENDPOINTS.ROLES.DETAIL(id), data);
  return response.data;
};

export const deleteRole = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.ROLES.DETAIL(id));
  return response.data;
};
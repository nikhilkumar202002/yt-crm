import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface RoleData {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  department_id: number;
  designation_id: number;
  mobile_number: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  role_name: string;
  department_name: string | null;
  designation_name: string | null;
  is_active: number; // API returns 1 or 0
  created_at: string;
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

export const registerEmployee = async (data: RegistrationData) => {
  // Post method to create an employee
  const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

export const getEmployees = async () => {
  const response = await apiClient.get(ENDPOINTS.AUTH.EMPLOYEES); // Use the correct endpoint path
  return response.data;
};
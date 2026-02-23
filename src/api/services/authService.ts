import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface RoleData {
  id?: number;
  name: string;
  description: string;
  status: boolean | number | string;
}

export interface PermissionData {
  id?: number;
  module_name: string;
  permission: string;
  code: string;
}

export interface AssignPermissionsData {
  permission_ids: number[];
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  created_at: string;
  updated_at: string;
  role?: RoleData;
  permission?: PermissionData;
}

export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  group_id?: number;
  department_id: number;
  position_id?: number;
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

// Update the loginUser function to ensure it returns the data required for the slice
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
  try {
    const response = await apiClient.get(ENDPOINTS.AUTH.EMPLOYEES);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.warn("Permission Error: Your account role does not have 'Admin' privileges on the server.");
    }
    throw error;
  }
};

export const getUsersList = async () => {
  const response = await apiClient.get(ENDPOINTS.USERS.LIST);
  return response.data;
};

// Attendance Service Functions
export interface PunchInData {
  latitude: number;
  longitude: number;
}

export const punchIn = async (data: PunchInData) => {
  const response = await apiClient.post(ENDPOINTS.ATTENDANCE.PUNCH_IN, data);
  return response.data;
};

export const punchOut = async () => {
  const response = await apiClient.post(ENDPOINTS.ATTENDANCE.PUNCH_OUT);
  return response.data;
};

export const getAttendanceStatus = async () => {
  const response = await apiClient.get(ENDPOINTS.ATTENDANCE.STATUS);
  return response.data;
};

// Permission Service Functions
export const getPermissions = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.PERMISSIONS.BASE}?page=${page}`);
  return response.data;
};

export const getPermission = async (id: number) => {
  const response = await apiClient.get(ENDPOINTS.PERMISSIONS.DETAIL(id));
  return response.data;
};

export const createPermission = async (data: PermissionData) => {
  const response = await apiClient.post(ENDPOINTS.PERMISSIONS.BASE, data);
  return response.data;
};

export const updatePermission = async (id: number, data: PermissionData) => {
  const response = await apiClient.put(ENDPOINTS.PERMISSIONS.DETAIL(id), data);
  return response.data;
};

export const deletePermission = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.PERMISSIONS.DETAIL(id));
  return response.data;
};

// Role Permission Service Functions
export const getRolePermissions = async (roleId: number) => {
  const response = await apiClient.get(ENDPOINTS.ROLES.PERMISSIONS(roleId));
  return response.data;
};

export const assignPermissionsToRole = async (roleId: number, data: AssignPermissionsData) => {
  const response = await apiClient.post(ENDPOINTS.ROLES.PERMISSIONS_ASSIGN(roleId), data);
  return response.data;
};

export const removePermissionsFromRole = async (roleId: number, data: AssignPermissionsData) => {
  const response = await apiClient.post(ENDPOINTS.ROLES.PERMISSIONS_REMOVE(roleId), data);
  return response.data;
};

export const syncRolePermissions = async (roleId: number, data: AssignPermissionsData) => {
  const response = await apiClient.put(ENDPOINTS.ROLES.PERMISSIONS_SYNC(roleId), data);
  return response.data;
};

export const getPermissionRoles = async (permissionId: number) => {
  const response = await apiClient.get(ENDPOINTS.PERMISSIONS.ROLES(permissionId));
  return response.data;
};

export const getAllRolePermissions = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.ROLE_PERMISSIONS.BASE}?page=${page}`);
  return response.data;
};
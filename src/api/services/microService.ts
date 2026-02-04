import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface OrgUnit {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

// Departments CRUD
export const getDepartments = async () => {
  const response = await apiClient.get(ENDPOINTS.DEPARTMENTS.BASE);
  return response.data;
};

export const createDepartment = async (data: OrgUnit) => {
  const response = await apiClient.post(ENDPOINTS.DEPARTMENTS.BASE, data);
  return response.data;
};

export const updateDepartment = async (id: number, data: OrgUnit) => {
  const response = await apiClient.put(ENDPOINTS.DEPARTMENTS.DETAIL(id), data);
  return response.data;
};

export const deleteDepartment = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.DEPARTMENTS.DETAIL(id));
  return response.data;
};

// Designations CRUD
export const getDesignations = async () => {
  const response = await apiClient.get(ENDPOINTS.DESIGNATIONS.BASE);
  return response.data;
};

export const createDesignation = async (data: OrgUnit) => {
  const response = await apiClient.post(ENDPOINTS.DESIGNATIONS.BASE, data);
  return response.data;
};

export const updateDesignation = async (id: number, data: OrgUnit) => {
  const response = await apiClient.put(ENDPOINTS.DESIGNATIONS.DETAIL(id), data);
  return response.data;
};

export const deleteDesignation = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.DESIGNATIONS.DETAIL(id));
  return response.data;
};

// Leads Management
export const getLeads = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.LEADS.BASE}?page=${page}`);
  return response.data;
};

export const getLeadDetail = async (id: number) => {
  const response = await apiClient.get(ENDPOINTS.LEADS.DETAIL(id));
  return response.data;
};

export const deleteLead = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.LEADS.DETAIL(id));
  return response.data;
};

export const uploadLeads = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(ENDPOINTS.LEADS.UPLOAD, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const assignLeads = async (data: { lead_ids: number[], user_id: number, status: string }) => {
  const response = await apiClient.post('/lead-assigns', data); //
  return response.data;
};

export const getAssignedLeads = async (page: number = 1) => {
  const response = await apiClient.get(`/lead-assigns?page=${page}`);
  return response.data;
};

/**
 * Update the status of an assigned lead.
 * Endpoint: PUT /lead-assigns/{id}/status
 */
export const updateLeadStatus = async (id: number, status: string) => {
  const response = await apiClient.put(`/lead-assigns/${id}/status`, { 
    user_status: status.toLowerCase() //
  });
  return response.data;
};

/**
 * Update the comment/description.
 * Payload format: { "user_comment": "text here" }
 */
export const updateLeadComment = async (id: number, comment: string) => {
  const response = await apiClient.put(`/lead-assigns/${id}/comment`, { 
    user_comment: comment //
  });
  return response.data;
};

export const updateLeadRequirements = async (id: number, requirements: string[]) => {
  const response = await apiClient.put(`/lead-assigns/${id}/requirements`, { 
    lead_requirements: requirements 
  }); 
  return response.data;
};
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

export const getAssignedLeads = async (page: number, requirement: string = '') => {
  // Ensure the parameter name matches what your backend expects (e.g., 'requirement')
  const requirementParam = requirement ? `&requirement=${encodeURIComponent(requirement)}` : '';
  const response = await apiClient.get(`/lead-assigns?page=${page}${requirementParam}`);
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

export const updateLeadServices = async (id: number, service_ids: number[], other_service: string = "") => {
  const response = await apiClient.put(`/lead-assigns/${id}/services`, { 
    service_ids, // Matches the backend error key "service_ids"
    other_service
  });
  return response.data;
};
/**
 * GET All services with pagination
 */
export const getServices = async (page: number = 1) => {
  const response = await apiClient.get(`/services?page=${page}`);
  return response.data;
};

/**
 * POST Create a new service
 */
export const createService = async (data: { name: string; description: string; status: boolean }) => {
  const response = await apiClient.post('/services', data);
  return response.data;
};

/**
 * PUT Update an existing service
 */
export const updateService = async (id: number, data: { name: string; description: string; status: boolean }) => {
  const response = await apiClient.put(`/services/${id}`, data);
  return response.data;
};

/**
 * DELETE a service
 */
export const deleteService = async (id: number) => {
  const response = await apiClient.delete(`/services/${id}`);
  return response.data;
};

// Campaigns
export const getProposals = async (page: number = 1) => {
  const response = await apiClient.get(`/proposals?page=${page}`);
  return response.data;
};

export const createProposal = async (leadAssignId: number, file: File) => {
  const formData = new FormData();
  formData.append('lead_assign_id', leadAssignId.toString());
  formData.append('file', file);
  
  const response = await apiClient.post('/proposals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProposalFile = async (proposalId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/proposals/${proposalId}`, formData, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    },
    params: {
      _method: 'PUT' 
    }
  });
  return response.data;
};

export const acceptProposal = async (proposalId: number) => {
  const response = await apiClient.patch(`/proposals/${proposalId}/accept`);
  return response.data;
};

/**
 * List all clients.
 * GET /clients
 */
export const getClients = async (page: number = 1) => {
  const response = await apiClient.get('/clients', {
    params: { page }
  });
  return response.data;
};

/**
 * View a single client's details.
 * GET /clients/{id}
 */
export const getClientById = async (clientId: number) => {
  const response = await apiClient.get(`/clients/${clientId}`);
  return response.data;
};

/**
 * Edit an existing client.
 * PUT /clients/{id}
 */

export const createClient = async (clientData: {
  name: string;
  email: string;
  company_name: string;
  contact_number_1: string;
  contact_number_2?: string;
  status: boolean;
}) => {
  const response = await apiClient.post('/clients', clientData);
  return response.data;
};

export const updateClient = async (clientId: number, clientData: Partial<{
  name: string;
  email: string;
  company_name: string;
  contact_number_1: string;
  contact_number_2: string;
  status: boolean;
}>) => {
  const response = await apiClient.put(`/clients/${clientId}`, clientData);
  return response.data;
};

/**
 * Delete a client.
 * DELETE /clients/{id}
 */
export const deleteClient = async (clientId: number) => {
  const response = await apiClient.delete(`/clients/${clientId}`);
  return response.data;
};
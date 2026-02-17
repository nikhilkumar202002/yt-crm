import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { getUsersList } from './authService';

export interface OrgUnit {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

export interface GroupData {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

export interface PositionData {
  id?: number;
  name: string;
  description: string;
  status: boolean | number;
}

export interface ProposalDetailsPayload {
  creatives_nos: number;
  videos_nos: number;
  description: string;
  amount: number;
  gst_percentage: number;
}

export interface SubServicePayload {
  name: string;
  description: string;
  status: boolean;
  service_id: number; // Assuming sub-services are linked to a parent service
}

export interface CalendarWorkPayload {
  date: string;
  client_id: number;
  description: string;
  content_description: string;
  notes: string;
  content_file?: File;
  is_special_day?: boolean;
}

export interface CalendarWorkCreativePayload {
  name: string;
  description: string;
  status: boolean;
}

export interface CalendarWorksCreatePayload {
  calender_works_creative_ids: string; // comma-separated IDs like "1,2,3"
  creative_nos: string; // comma-separated numbers like "10,12,5"
}

export interface AssignCalendarWorkPayload {
  assigned_to: string; // e.g., "[1]" or "[1,2,3]"
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

// Groups CRUD
export const getGroups = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.GROUPS.BASE}?page=${page}`);
  return response.data;
};

export const createGroup = async (data: GroupData) => {
  const response = await apiClient.post(ENDPOINTS.GROUPS.BASE, data);
  return response.data;
};

export const updateGroup = async (id: number, data: GroupData) => {
  const response = await apiClient.put(ENDPOINTS.GROUPS.DETAIL(id), data);
  return response.data;
};

export const deleteGroup = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.GROUPS.DETAIL(id));
  return response.data;
};

export const getGroupDetail = async (id: number) => {
  const response = await apiClient.get(ENDPOINTS.GROUPS.DETAIL(id));
  return response.data;
};

// Positions CRUD
export const getPositions = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.POSITIONS.BASE}?page=${page}`);
  return response.data;
};

export const createPosition = async (data: PositionData) => {
  const response = await apiClient.post(ENDPOINTS.POSITIONS.BASE, data);
  return response.data;
};

export const updatePosition = async (id: number, data: PositionData) => {
  const response = await apiClient.put(ENDPOINTS.POSITIONS.DETAIL(id), data);
  return response.data;
};

export const deletePosition = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.POSITIONS.DETAIL(id));
  return response.data;
};

export const getPositionDetail = async (id: number) => {
  const response = await apiClient.get(ENDPOINTS.POSITIONS.DETAIL(id));
  return response.data;
};

// Employee Management
export interface Employee {
  id: number;
  name: string;
  email: string;
  role_name: string;
  designation_name: string;
  status: boolean;
  position_name?: string;
  department_name?: string;
}

/**
 * GET All employees (staff)
 */
export const getEmployees = async () => {
  const response = await apiClient.get(ENDPOINTS.AUTH.EMPLOYEES);
  return response.data;
};

/**
 * GET Employees excluding heads (for assignment purposes)
 */
export const getEmployeesForAssignment = async () => {
  const response = await getUsersList();
  let employees: Employee[] = [];

  if (Array.isArray(response)) {
    employees = response;
  } else if (response?.data && Array.isArray(response.data)) {
    employees = response.data;
  } else if (response?.data?.data && Array.isArray(response.data.data)) {
    employees = response.data.data;
  }

  return { ...response, data: employees };
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

/**
 * PUT Upload designer files (poster images) to a calendar work
 * Endpoint: PUT /calendar-works/{id}/designer-files
 */
export const uploadDesignerFiles = async (id: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('designer_files[]', file);
  });

  // Using POST with _method: 'PUT' for multipart compatibility with certain backends
  const response = await apiClient.post(`/calendar-works/${id}/designer-files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { _method: 'PUT' },
    timeout: 60000 // Increase timeout to 60 seconds for file uploads
  });
  return response.data;
};

export const assignLeads = async (data: { lead_ids: number[], user_id: number, status: string }) => {
  const response = await apiClient.post('/lead-assigns', data); //
  return response.data;
};

export const getAssignedLeads = async (page: number, requirement: string = '', userId?: number) => {
  // Ensure the parameter name matches what your backend expects (e.g., 'requirement')
  const requirementParam = requirement ? `&requirement=${encodeURIComponent(requirement)}` : '';
  const userParam = userId ? `&user_id=${userId}` : '';
  const response = await apiClient.get(`/lead-assigns?page=${page}${requirementParam}${userParam}`);
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

export const updateLeadServices = async (
  id: number, 
  service_ids: number[], 
  subservice_ids: number[], // Added sub-services array
  other_service: string = ""
) => {
  const response = await apiClient.put(`/lead-assigns/${id}/services`, { 
    service_ids, 
    subservice_ids, // New key for sub-services
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

export const createService = async (data: { name: string; description: string; status: boolean }) => {
  const response = await apiClient.post('/services', data);
  return response.data;
};

export const updateService = async (id: number, data: { name: string; description: string; status: boolean }) => {
  const response = await apiClient.put(`/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id: number) => {
  const response = await apiClient.delete(`/services/${id}`);
  return response.data;
};

/**
 * GET All sub-services with optional pagination
 */
export const getSubServices = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.SUB_SERVICES.BASE}?page=${page}`);
  return response.data;
};

/**
 * GET a single sub-service by ID
 */
export const getSubServiceById = async (id: number) => {
  const response = await apiClient.get(ENDPOINTS.SUB_SERVICES.DETAIL(id));
  return response.data;
};

/**
 * POST Create a new sub-service
 */
export const createSubService = async (data: SubServicePayload) => {
  const response = await apiClient.post(ENDPOINTS.SUB_SERVICES.BASE, data);
  return response.data;
};

/**
 * PATCH Update an existing sub-service
 */
export const updateSubService = async (id: number, data: Partial<SubServicePayload>) => {
  const response = await apiClient.patch(ENDPOINTS.SUB_SERVICES.DETAIL(id), data);
  return response.data;
};

/**
 * DELETE a sub-service
 */
export const deleteSubService = async (id: number) => {
  const response = await apiClient.delete(ENDPOINTS.SUB_SERVICES.DETAIL(id));
  return response.data;
};

// Campaigns / Proposals
export const getProposals = async (page: number = 1) => {
  const response = await apiClient.get(`${ENDPOINTS.PROPOSALS.BASE}?page=${page}`); // cite: 13
  return response.data;
};

export const createProposal = async (leadAssignId: number, file: File) => {
  const formData = new FormData();
  formData.append('lead_assign_id', leadAssignId.toString());
  formData.append('file', file);
  
  const response = await apiClient.post(ENDPOINTS.PROPOSALS.BASE, formData, { // cite: 13, 14
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateProposalFile = async (proposalId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Using POST with _method: 'PUT' for compatibility with multipart form data on some backends
  const response = await apiClient.post(ENDPOINTS.PROPOSALS.DETAIL(proposalId), formData, { // cite: 13, 14
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
  const response = await apiClient.patch(ENDPOINTS.PROPOSALS.ACCEPT(proposalId)); // cite: 13, 14
  return response.data;
};

/*
 * Update detailed metrics and pricing for a proposal.
 * PATCH /proposals/{id}/details
 */
export const updateProposalDetails = async (proposalId: number, details: ProposalDetailsPayload) => {
  const response = await apiClient.patch(
    ENDPOINTS.PROPOSALS.UPDATE_DETAILS(proposalId), 
    details
  );
  return response.data;
};

/**
 * List all clients.
 * GET /clients
 */
export const getClients = async (page: number = 1, isInLeads?: boolean) => {
  const params: any = { page };
  
  // If a filter is provided, append it to the request
  if (isInLeads !== undefined) {
    params.is_in_leads = isInLeads ? 1 : 0; 
  }

  const response = await apiClient.get('/clients', { params });
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
  is_in_leads?: boolean; // Added
  proposal_id?: number | null; // Added
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

/**
 * GET All calendar works
 */
export const getCalendarWorks = async (page: number = 1) => {
  const response = await apiClient.get(ENDPOINTS.CALENDAR_WORKS.BASE, {
    params: { page }
  });
  return response.data;
};

/**
 * POST Create a new calendar work
 */
export const createCalendarWork = async (data: CalendarWorkPayload) => {
  // If there's a file, use FormData for multipart upload
  if (data.content_file) {
    const formData = new FormData();
    formData.append('date', data.date);
    formData.append('client_id', data.client_id.toString());
    formData.append('description', data.description);
    formData.append('content_description', data.content_description);
    formData.append('content_file', data.content_file);
    if (data.creative_work_creative_id) {
      formData.append('creative_work_creative_id', data.creative_work_creative_id.toString());
    }

    const response = await apiClient.post(ENDPOINTS.CALENDAR_WORKS.BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // No file, send as JSON without content_file
    const { content_file, ...payload } = data;
    const response = await apiClient.post(ENDPOINTS.CALENDAR_WORKS.BASE, payload);
    return response.data;
  }
};

/**
 * POST Create calendar works with creative assignments
 */
export const createCalendarWorksWithCreatives = async (data: CalendarWorksCreatePayload) => {
  const response = await apiClient.post(ENDPOINTS.CALENDAR_WORKS.BASE, data);
  return response.data;
};

/**
 * PUT Assign calendar work to team members
 */
export const assignCalendarWork = async (id: number, data: AssignCalendarWorkPayload) => {
  const response = await apiClient.put(ENDPOINTS.CALENDAR_WORKS.ASSIGN(id), data);
  return response.data;
};

/**
 * PUT Assign calendar work content to content writers
 */
export const assignCalendarWorkContent = async (id: number, data: { content_assigned_to: string }) => {
  const response = await apiClient.put(`/calendar-works/${id}/content/assign`, data);
  return response.data;
};

/**
 * GET All calendar work creatives
 */
export const getCalendarWorkCreatives = async () => {
  const response = await apiClient.get(ENDPOINTS.CALENDAR_WORK_CREATIVES.BASE);
  return response.data;
};

/**
 * POST Create a new calendar work creative
 */
export const createCalendarWorkCreative = async (data: CalendarWorkCreativePayload) => {
  const response = await apiClient.post(ENDPOINTS.CALENDAR_WORK_CREATIVES.BASE, data);
  return response.data;
};

/**
 * GET Single calendar work creative by ID
 */
export const getCalendarWorkCreative = async (id: number) => {
  const response = await apiClient.get(`${ENDPOINTS.CALENDAR_WORK_CREATIVES.BASE}/${id}`);
  return response.data;
};

/**
 * PUT Update calendar work creative by ID
 */
export const updateCalendarWorkCreative = async (id: number, data: CalendarWorkCreativePayload) => {
  const response = await apiClient.put(`${ENDPOINTS.CALENDAR_WORK_CREATIVES.BASE}/${id}`, data);
  return response.data;
};

/**
 * DELETE Calendar work creative by ID
 */
export const deleteCalendarWorkCreative = async (id: number) => {
  const response = await apiClient.delete(`${ENDPOINTS.CALENDAR_WORK_CREATIVES.BASE}/${id}`);
  return response.data;
};

/**
 * PUT Assign designers to a calendar work
 * Endpoint: PUT /calendar-works/{id}/designers/assign
 */
export const assignDesignersToWork = async (id: number, designerIds: number[]) => {
  const response = await apiClient.put(`/calendar-works/${id}/designers/assign`, { 
    assigned_to: JSON.stringify(designerIds) 
  });
  return response.data;
};

/**
 * PUT Update calendar work content details (description and file)
 * Endpoint: PUT /calendar-works/{id}/content/changes
 */
export const updateCalendarWorkContentDetails = async (id: number, data: { content_description: string; content_file?: File }) => {
  const formData = new FormData();
  formData.append('content_description', data.content_description);
  if (data.content_file) {
    formData.append('content_file', data.content_file);
  }

  const response = await apiClient.post(`/calendar-works/${id}/content/changes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { _method: 'PUT' }
  });
  return response.data;
};

/**
 * PUT Update calendar work status
 * Endpoint: PUT /calendar-works/{id}/status
 */
export const updateCalendarWorkStatus = async (id: number, status: string) => {
  const response = await apiClient.put(`/calendar-works/${id}/status`, { status });
  return response.data;
};
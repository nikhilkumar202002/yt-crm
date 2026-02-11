export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    EMPLOYEES: '/users',
    PROFILE: '/user/profile',
  },
  USERS: {
    LIST: '/users/list',
  },
  ROLES: {
    BASE: '/roles',
    DETAIL: (id: number) => `/roles/${id}`,
  },  
  DEPARTMENTS: {
    BASE: '/departments',
    DETAIL: (id: number) => `/departments/${id}`,
  },
  DESIGNATIONS: {
    BASE: '/designations',
    DETAIL: (id: number) => `/designations/${id}`,
  },
  LEADS: {
    BASE: '/leads',
    UPLOAD: '/leads/upload',
    DETAIL: (id: number) => `/leads/${id}`,  // cite: 9
  },
PROPOSALS: {
    BASE: '/proposals',
    DETAIL: (id: number) => `/proposals/${id}`,
    ACCEPT: (id: number) => `/proposals/${id}/accept`,
    UPDATE_DETAILS: (id: number) => `/proposals/${id}/details`,
  },
  SERVICES: {
    BASE: '/services',
    DETAIL: (id: number) => `/services/${id}`,
  },

  SUB_SERVICES: {
    BASE: '/sub-services',
    DETAIL: (id: number) => `/sub-services/${id}`,
  },
  
  CALENDAR_WORKS: {
    BASE: '/calendar-works',
    DETAIL: (id: number) => `/calendar-works/${id}`,
    ASSIGN: (id: number) => `/calendar-works/${id}/designers/assign`,
    CONTENT_ASSIGN: (id: number) => `/calendar-works/${id}/content/assign`,
  },
  
  CALENDAR_WORK_CREATIVES: {
    BASE: '/calendar-work-creatives',
  },
  
  CAMPAIGNS: {
    SETUP: '/campaigns/setup',       // cite: 27
    EXECUTION: '/campaigns/execute',  // cite: 51
    STATS: '/campaigns/performance',  // cite: 58
  },
  FINANCE: {
    BILLING: '/finance/billing',     // cite: 76
    RETAINERS: '/finance/retainers', // cite: 75
  },
  GROUPS: {
    BASE: '/groups',
    DETAIL: (id: number) => `/groups/${id}`,
  },
  POSITIONS: {
    BASE: '/positions',
    DETAIL: (id: number) => `/positions/${id}`,
  }
};
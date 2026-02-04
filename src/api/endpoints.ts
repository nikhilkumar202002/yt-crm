export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    EMPLOYEES: '/users',
    PROFILE: '/user/profile',
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
  CAMPAIGNS: {
    SETUP: '/campaigns/setup',       // cite: 27
    EXECUTION: '/campaigns/execute',  // cite: 51
    STATS: '/campaigns/performance',  // cite: 58
  },
  FINANCE: {
    BILLING: '/finance/billing',     // cite: 76
    RETAINERS: '/finance/retainers', // cite: 75
  }
};
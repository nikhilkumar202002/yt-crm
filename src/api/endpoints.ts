export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
    LOGOUT: '/logout',
    PROFILE: '/user/profile',
  },
  ROLES: {
    BASE: '/roles',
    DETAIL: (id: number) => `/roles/${id}`,
  },  
  LEADS: {
    CAPTURE: '/leads/capture',       // cite: 6
    ASSIGN: '/leads/auto-assignment', // cite: 7
    QUALIFY: '/leads/qualification',  // cite: 9
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
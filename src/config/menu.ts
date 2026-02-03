import { UserRole } from './roles';

export interface MenuItem {
  title: string;
  path: string;
  roles: UserRole[];
}

export const SIDEBAR_MENU: MenuItem[] = [
  { 
    title: 'Dashboard', 
    path: '/dashboard', 
    roles: ['ADMIN', 'SALES', 'PM'] 
  },
  { 
    title: 'Leads & Pipeline', 
    path: '/leads', 
    roles: ['ADMIN', 'SALES'] // cite: 5, 10
  },
  { 
    title: 'Strategy & Pitch', 
    path: '/strategy', 
    roles: ['ADMIN', 'SALES', 'PM'] // cite: 13
  },
  { 
    title: 'Campaign Setup', 
    path: '/campaigns', 
    roles: ['ADMIN', 'PM', 'ADS_OP'] // cite: 27
  },
  { 
    title: 'Creative Workflow', 
    path: '/creative', 
    roles: ['ADMIN', 'PM', 'CREATIVE'] // cite: 34
  },
  { 
    title: 'Asset Hub', 
    path: '/assets', 
    roles: ['ADMIN', 'PM', 'CREATIVE', 'CLIENT'] // cite: 42
  },
  { 
    title: 'Ad Operations', 
    path: '/execution', 
    roles: ['ADMIN', 'ADS_OP'] // cite: 51
  },
  { 
    title: 'Intelligence', 
    path: '/intelligence', 
    roles: ['ADMIN', 'ANALYST', 'PM'] // cite: 58
  },
  { 
    title: 'Finance & Billing', 
    path: '/finance', 
    roles: ['ADMIN', 'FINANCE'] // cite: 72
  }
];
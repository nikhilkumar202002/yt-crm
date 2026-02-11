// src/config/menu.ts
import { UserRole } from './roles';

export interface MenuItem {
  title: string;
  path: string;
  roles: UserRole[];
  submenu?: MenuItem[];
}

export const SIDEBAR_MENU: MenuItem[] = [
  { 
    title: 'Dashboard', 
    path: '/dashboard', 
    roles: ['ADMIN', 'SALES', 'PM', 'DM HEAD'] 
  },
 
  { 
    title: 'Leads & Pipeline', 
    path: '/leads', 
    roles: ['ADMIN', 'SALES', 'DM HEAD', 'DM EXECUTIVE'], // Parent remains visible
    submenu: [
      { 
        title: 'All Leads', 
        path: '/leads', 
        roles: ['ADMIN', 'DM HEAD'] // DM EXECUTIVE removed from here
      },
      { 
        title: 'Assigned Leads', 
        path: '/leads/assigned', 
        roles: ['ADMIN', 'SALES', 'DM HEAD', 'DM EXECUTIVE'] // Visibility maintained
      }
    ]
  },
  {
    title: 'Proposal',
    path: '/proposals',
    roles: ['ADMIN', 'DM HEAD']
  },
{
    title: 'Onboarded Clients',
    path: '/clients',
    roles: ['ADMIN', 'DM HEAD', 'DM EXECUTIVE']
  },
   {
    title: 'Calendar',
    path: '/calendar',
    roles: ['ADMIN', 'SALES', 'PM', 'DM HEAD', 'DM EXECUTIVE']
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    roles: ['ADMIN', 'PM', 'DM HEAD', 'DM EXECUTIVE', 'CREATIVE HEAD', 'CREATIVE TEAM HEAD', 'CREATIVE DESIGNERS', 'CONTENT WRITER']
  },
  { 
    title: 'Strategy & Pitch', 
    path: '/strategy', 
    roles: ['ADMIN', 'SALES', 'PM'] 
  },
  { 
    title: 'Campaign Setup', 
    path: '/campaigns', 
    roles: ['ADMIN', 'PM', 'ADS_OP', 'DM HEAD'] 
  },
  { 
    title: 'Creative Workflow', 
    path: '/creative', 
    roles: ['ADMIN', 'PM', 'CREATIVE HEAD', 'CREATIVE TEAM HEAD', 'CREATIVE DESIGNERS']
  },
  { 
    title: 'Asset Hub', 
    path: '/assets', 
    roles: ['ADMIN', 'PM', 'CREATIVE HEAD', 'CREATIVE TEAM HEAD', 'CREATIVE DESIGNERS', 'CLIENT', 'CONTENT WRITER'] 
  },
  { 
    title: 'Ad Operations', 
    path: '/execution', 
    roles: ['ADMIN', 'ADS_OP', 'DM HEAD'] 
  },
  { 
    title: 'Intelligence', 
    path: '/intelligence', 
    roles: ['ADMIN', 'ANALYST', 'PM', 'DM HEAD'] 
  },
  { 
    title: 'Finance & Billing', 
    path: '/finance', 
    roles: ['ADMIN', 'FINANCE'] 
  },
  { 
    title: 'Employees', 
    path: '/employees', 
    roles: ['ADMIN'] 
  },
  {
    title: 'Settings',
    path: '/settings',
    roles: ['ADMIN'], 
    submenu: [
      { title: 'Role Management', path: '/settings/roles', roles: ['ADMIN'] },
      { title: 'Departments', path: '/settings/departments', roles: ['ADMIN'] },
      { title: 'Designations', path: '/settings/designations', roles: ['ADMIN'] },
      { title: 'Groups', path: '/groups', roles: ['ADMIN'] },
      { title: 'Services', path: '/settings/services', roles: ['ADMIN'] },
      { title: 'Calendar Work Creatives', path: '/settings/calendar-work-creatives', roles: ['ADMIN'] },
    ]
  },
];
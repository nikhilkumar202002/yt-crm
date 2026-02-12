// src/config/menu.ts
import { resolvePermissions } from './permissionResolver';

export interface MenuItem {
  title: string;
  path: string;
  requiredPermissions?: string[]; // Array of required permission keys
  submenu?: MenuItem[];
}

// Helper function to check if user has required permissions
export function hasMenuAccess(userPermissions: any, requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }
  return requiredPermissions.some(perm => userPermissions[perm] === true);
}

export const SIDEBAR_MENU: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    requiredPermissions: [] // Everyone can access dashboard
  },

  {
    title: 'Leads & Pipeline',
    path: '', // Parent menu doesn't have a direct path since it has submenus
    requiredPermissions: ['canViewAllLeads', 'canViewAssignedLeads'], // Users with lead viewing permissions
    submenu: [
      {
        title: 'All Leads',
        path: '/leads',
        requiredPermissions: ['canViewAllLeads'] // Admin, Manager, and authorized Staff
      },
      {
        title: 'Assigned Leads',
        path: '/leads/assigned',
        requiredPermissions: ['canViewAssignedLeads'] // Staff Members, Heads, Interns with assigned leads
      }
    ]
  },
  {
    title: 'Proposal',
    path: '/proposals',
    requiredPermissions: ['canViewAll'] // Admin and Head level access only
  },
{
    title: 'Onboarded Clients',
    path: '/clients',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
   {
    title: 'Calendar',
    path: '/calendar',
    requiredPermissions: [] // Most roles can access calendar
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    requiredPermissions: ['canAssignGroup'] // Can work on assigned tasks
  },
  {
    title: 'Strategy & Pitch',
    path: '/strategy',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
  {
    title: 'Campaign Setup',
    path: '/campaigns',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
  {
    title: 'Creative Workflow',
    path: '/creative',
    requiredPermissions: ['canAssignGroup'] // Creative team access
  },
  {
    title: 'Asset Hub',
    path: '/assets',
    requiredPermissions: ['canAssignGroup'] // Can access assigned assets
  },
  {
    title: 'Ad Operations',
    path: '/execution',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
  {
    title: 'Intelligence',
    path: '/intelligence',
    requiredPermissions: ['canViewAll'] // Analytics access
  },
  {
    title: 'Finance & Billing',
    path: '/finance',
    requiredPermissions: ['canViewAll'] // Finance access
  },
  {
    title: 'Employees',
    path: '/employees',
    requiredPermissions: ['canManageGroups', 'canViewAll'] // Management access
  },
  {
    title: 'Settings',
    path: '/settings',
    requiredPermissions: ['canManageGroups', 'canViewAll'], // Admin access
    submenu: [
      { title: 'Role Management', path: '/settings/roles', requiredPermissions: ['canManageGroups'] },
      { title: 'Departments', path: '/settings/departments', requiredPermissions: ['canManageGroups'] },
      { title: 'Designations', path: '/settings/designations', requiredPermissions: ['canManageGroups'] },
      { title: 'Groups', path: '/settings/groups', requiredPermissions: ['canManageGroups'] },
      { title: 'Positions', path: '/settings/positions', requiredPermissions: ['canManageGroups'] },
      { title: 'Services', path: '/settings/services', requiredPermissions: ['canManageGroups'] },
      { title: 'Calendar Work Creatives', path: '/settings/calendar-work-creatives', requiredPermissions: ['canManageGroups'] },
    ]
  },
];
import { type MenuItem } from './menu';

export const ADMIN_MENU: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    requiredPermissions: []
  },
  {
    title: 'Leads & Pipeline',
    path: '',
    requiredPermissions: ['viewAllLeads', 'viewAssignedLeads'],
    submenu: [
      {
        title: 'All Leads',
        path: '/leads',
        requiredPermissions: ['viewAllLeads']
      },
      {
        title: 'Assigned Leads',
        path: '/leads/assigned',
        requiredPermissions: ['viewAssignedLeads']
      }
    ]
  },
  {
    title: 'Proposal',
    path: '/proposals',
    requiredPermissions: ['uploadLeads']
  },
  {
    title: 'Onboarded Clients',
    path: '/clients',
    requiredPermissions: ['viewAllLeads', 'viewAssignedLeads']
  },
  {
    title: 'Calendar',
    path: '/calendar',
    requiredPermissions: ['viewCalendar']
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    requiredPermissions: ['canAssignGroup']
  },
 
  {
    title: 'Finance & Billing',
    path: '/finance',
    requiredPermissions: ['canViewAll']
  },
  {
    title: 'Employees',
    path: '/employees',
    requiredPermissions: ['canManageGroups', 'canViewAll']
  },
  {
    title: 'Settings',
    path: '/settings',
    requiredPermissions: ['canManageGroups', 'canViewAll'],
    submenu: [
      { title: 'Role Management', path: '/settings/roles', requiredPermissions: ['canManageGroups'] },
      { title: 'Departments', path: '/settings/departments', requiredPermissions: ['canManageGroups'] },
      { title: 'Designations', path: '/settings/designations', requiredPermissions: ['canManageGroups'] },
      { title: 'Groups', path: '/settings/groups', requiredPermissions: ['canManageGroups'] },
      { title: 'Positions', path: '/settings/positions', requiredPermissions: ['canManageGroups'] },
      { title: 'Permissions', path: '/settings/permissions', requiredPermissions: ['canManageGroups'] },
      { title: 'Services', path: '/settings/services', requiredPermissions: ['canManageGroups'] },
      { title: 'Calendar Work Creatives', path: '/settings/calendar-work-creatives', requiredPermissions: ['canManageGroups'] },
    ]
  },
];
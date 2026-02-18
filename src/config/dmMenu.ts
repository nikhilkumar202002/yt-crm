import { MenuItem } from './menu';

export const DM_MENU: MenuItem[] = [
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

];
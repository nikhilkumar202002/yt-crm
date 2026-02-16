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
        requiredPermissions: ['assignLeads']
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
    requiredPermissions: ['viewAllLeads']
  },
  {
    title: 'Calendar',
    path: '/calendar',
    requiredPermissions: ['viewAllLeads']
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    requiredPermissions: ['canAssignGroup']
  },

];
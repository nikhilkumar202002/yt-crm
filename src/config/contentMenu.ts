import { MenuItem } from './menu';

export const CONTENT_MENU: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    requiredPermissions: []
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    requiredPermissions: ['canAssignGroup']
  },
  {
    title: 'Creative Workflow',
    path: '/creative',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
];
import { MenuItem } from './menu';

export const GRAPHICS_MENU: MenuItem[] = [
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
  {
    title: 'Asset Hub',
    path: '/assets',
    requiredPermissions: ['canViewAll', 'canAssignGroup']
  },
];
export interface MenuItem {
  title: string;
  path: string;
  requiredPermissions?: string[]; 
  submenu?: MenuItem[];
}

export function hasMenuAccess(userPermissions: Record<string, boolean>, requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; 
  }
  return requiredPermissions.some(perm => userPermissions[perm] === true);
}

export const MAIN_MENU: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    requiredPermissions: [] // Visible to everyone logged in
  },
  {
    title: 'All Leads',
    path: '/leads',
    requiredPermissions: ['leads.view-all']
  },
  {
    title: 'Assigned Leads',
    path: '/leads/assigned',
    requiredPermissions: ['leads.assign']
  },
  {
    title: 'Proposal',
    path: '/proposals',
    requiredPermissions: ['proposals.view', 'proposals.upload', 'leads.upload']
  },
  {
    title: 'Onboarded Clients',
    path: '/clients',
    // FIXED: Changed underscores to hyphens to match DB
    requiredPermissions: ['leads.view-all', 'leads.view']
  },
  {
    title: 'Calendar',
    path: '/calendar',
    requiredPermissions: ['calendar.view', 'calendar.manage']
  },
  {
    title: 'Worksheet',
    path: '/worksheet',
    requiredPermissions: ['worksheet.view', 'worksheet.manage']
  },
  {
    title: 'Creative Workflow',
    path: '/creative',
    // FIXED: Changed general.view_all to general.view-all
    requiredPermissions: ['general.view-all', 'worksheet.view']
  },
  {
    title: 'Asset Hub',
    path: '/assets',
    // FIXED: Changed general.view_all to general.view-all
    requiredPermissions: ['general.view-all', 'worksheet.view']
  },
  {
    title: 'Finance & Billing',
    path: '/finance',
    // FIXED: Changed general.view_all to general.view-all
    requiredPermissions: ['general.view-all', 'finance.view']
  },
  {
    title: 'Employees',
    path: '/employees',
    // FIXED: Changed general.view_all to general.view-all
    requiredPermissions: ['settings.manage', 'employees.view', 'general.view-all']
  },
  {
    title: 'Settings',
    path: '/settings',
    requiredPermissions: [], // Always visible, submenus filtered by permissions
    submenu: [
      { title: 'Role Management', path: '/settings/roles', requiredPermissions: ['settings.manage'] },
      { title: 'Departments', path: '/settings/departments', requiredPermissions: ['settings.manage'] },
      { title: 'Designations', path: '/settings/designations', requiredPermissions: ['settings.manage'] },
      { title: 'Groups', path: '/settings/groups', requiredPermissions: ['settings.manage'] },
      { title: 'Positions', path: '/settings/positions', requiredPermissions: ['settings.manage'] },
      { title: 'Permissions', path: '/settings/permissions', requiredPermissions: ['settings.manage'] },
      { title: 'Role Permissions', path: '/settings/role-permissions', requiredPermissions: ['settings.manage'] },
      { title: 'Services', path: '/settings/services', requiredPermissions: ['settings.manage'] }
    ]
  }
];
export interface MenuItem {
  title: string;
  path: string;
  requiredPermissions?: string[]; 
  submenu?: MenuItem[];
}

export function hasMenuAccess(userPermissions: Record<string, boolean>, requiredPermissions?: string[]): boolean {
  console.log('🔍 hasMenuAccess called with permissions:', userPermissions);
  console.log('Required permissions:', requiredPermissions);

  if (!requiredPermissions || requiredPermissions.length === 0) {
    console.log('No required permissions - access granted');
    return true;
  }

  const hasAccess = requiredPermissions.some(perm => {
    const hasPerm = userPermissions[perm] === true;
    console.log(`Checking permission '${perm}': ${hasPerm}`);
    return hasPerm;
  });

  console.log('Final access decision:', hasAccess);
  return hasAccess;
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
    requiredPermissions: ['proposal.view', 'proposal.view-all']
  },
  {
    title: 'Onboarded Clients',
    path: '/clients',
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
    title: 'Intelligence',
    path: '/intelligence',
    requiredPermissions: ['analytics.view', 'analytics.view-all']
  },

  {
    title: 'Finance & Billing',
    path: '/finance',
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
    requiredPermissions: ['settings.manage'], // Only visible to users with settings management permissions
    submenu: [
      { title: 'Role Management', path: '/settings/roles', requiredPermissions: ['settings.manage'] },
      { title: 'Departments', path: '/settings/departments', requiredPermissions: ['settings.manage'] },
      { title: 'Designations', path: '/settings/designations', requiredPermissions: ['settings.manage'] },
      { title: 'Groups', path: '/settings/groups', requiredPermissions: ['settings.manage'] },
      { title: 'Positions', path: '/settings/positions', requiredPermissions: ['settings.manage'] },
      { title: 'Permissions', path: '/settings/permissions', requiredPermissions: ['settings.manage'] },
      { title: 'Role Permissions', path: '/settings/role-permissions', requiredPermissions: ['settings.manage'] },
      { title: 'User Permissions', path: '/settings/user-permissions', requiredPermissions: ['settings.manage'] },
      { title: 'Services', path: '/settings/services', requiredPermissions: ['settings.manage'] }
    ]
  }
];
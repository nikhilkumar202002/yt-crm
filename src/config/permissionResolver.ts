// src/config/permissionResolver.ts

export function resolvePermissions({ role, permissions }: { role: string | null, permissions: any[] | null | Record<string, boolean> }): Record<string, boolean> {
  console.log('🔐 PERMISSION RESOLVER CALLED');
  console.log('Role:', role);
  console.log('Permissions input:', permissions);

  // Check for admin role (case insensitive)
  const isAdmin = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'administrator' || role?.toLowerCase() === 'superadmin';
  console.log('Is admin role?', isAdmin);

  if (isAdmin) {
    console.log('PermissionResolver - Admin detected, returning all permissions as true');
    // Return an object that has all permission checks return true
    return new Proxy({}, {
      get: (target, prop) => {
        console.log(`Admin permission check for: ${String(prop)} - returning true`);
        return true;
      }
    }) as Record<string, boolean>;
  }

  const permissionDict: { [key: string]: boolean } = {};

  // Handle array format (matches your provided JSON structure)
  if (Array.isArray(permissions)) {
    console.log('PermissionResolver - Processing array format, items:', permissions.length);
    permissions.forEach((item, index) => {
      console.log(`PermissionResolver - Processing item ${index}:`, item);

      // 1. Pivot structure: item.permission.code (API response structure)
      if (item?.permission?.code) {
        permissionDict[item.permission.code] = true;
        console.log(`PermissionResolver - Added permission: ${item.permission.code}`);
      }
      // 2. Direct object structure fallback: item.code
      else if (item?.code) {
        permissionDict[item.code] = true;
        console.log(`PermissionResolver - Added permission: ${item.code}`);
      }
      // 3. String array fallback: "leads.create"
      else if (typeof item === 'string') {
        permissionDict[item] = true;
        console.log(`PermissionResolver - Added permission: ${item}`);
      }
      // 4. Handle any other structure that might have a code field
      else if (item && typeof item === 'object' && 'code' in item) {
        permissionDict[item.code] = true;
        console.log(`PermissionResolver - Added permission from object: ${item.code}`);
      }
    });
  }
  // Handle object format (legacy backend)
  else if (permissions && typeof permissions === 'object') {
    console.log('PermissionResolver - Processing object format');
    const mapping: Record<string, string> = {
      viewAllLeads: 'leads.view-all',
      viewAssignedLeads: 'leads.view',
      assignLeads: 'leads.assign',
      uploadLeads: 'leads.upload',
      viewCalendar: 'calendar.view',
      manageCalendar: 'calendar.manage',
      viewWorksheet: 'worksheet.view',
      manageWorksheet: 'worksheet.manage',
      viewProposals: 'proposals.view',
      uploadProposals: 'proposals.upload',
      viewClients: 'leads.view-all', // Onboarded clients
      viewAll: 'general.view-all',
      viewFinance: 'finance.view',
      viewEmployees: 'employees.view',
      manageSettings: 'settings.manage'
    };
    Object.keys(permissions).forEach(key => {
      if (permissions[key] && mapping[key]) {
        permissionDict[mapping[key]] = true;
        console.log(`PermissionResolver - Mapped legacy permission ${key} to ${mapping[key]}`);
      }
      // Also include the permission as-is if it matches our menu permission format
      if (permissions[key] && key.includes('.') && (key.startsWith('leads.') || key.startsWith('calendar.') || key.startsWith('worksheet.') || key.startsWith('proposals.') || key.startsWith('general.') || key.startsWith('finance.') || key.startsWith('employees.') || key.startsWith('settings.'))) {
        permissionDict[key] = true;
        console.log(`PermissionResolver - Added direct permission: ${key}`);
      }
    });
  }

  console.log('PermissionResolver - Final resolved permissions:', permissionDict);
  return permissionDict;
}
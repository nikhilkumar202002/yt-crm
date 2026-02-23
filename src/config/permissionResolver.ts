export function resolvePermissions({ role, permissions }: { role: string | null, permissions: any[] | null | Record<string, boolean> }): Record<string, boolean> {
  if (role?.toLowerCase() === 'admin') {
    return new Proxy({}, {
      get: () => true
    }) as Record<string, boolean>;
  }
  
  const permissionDict: { [key: string]: boolean } = {};
  
  // Role-based permissions
  const roleLower = role?.toLowerCase();
  if (roleLower === 'dm executive' || roleLower === 'dm-executive' || roleLower === 'dmexecutive') {
    permissionDict['leads.view-all'] = true;
    permissionDict['leads.view'] = true;
    permissionDict['calendar.view'] = true;
    permissionDict['worksheet.view'] = true;
  }
  
  // Handle array format (new backend)
  if (Array.isArray(permissions)) {
    permissions.forEach(item => {
      if (item.permission && item.permission.code) {
        permissionDict[item.permission.code] = true;
      }
    });
  } 
  // Handle object format (legacy backend)
  else if (permissions && typeof permissions === 'object') {
    const mapping: Record<string, string> = {
      viewAllLeads: 'leads.view-all',
      viewAssignedLeads: 'leads.view',
      assignLeads: 'leads.assign',
      uploadLeads: 'leads.upload',
      // Add more mappings as needed
    };
    Object.keys(permissions).forEach(key => {
      if (permissions[key] && mapping[key]) {
        permissionDict[mapping[key]] = true;
      }
    });
    // For backward compatibility, give settings.manage to legacy users
    permissionDict['settings.manage'] = true;
  }
  
  return permissionDict;
}
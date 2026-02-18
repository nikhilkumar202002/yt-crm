import { GLOBAL_ROLES } from "./roles";
import { POSITION_PERMISSIONS } from "./positionPermissions";

// Map API role names to internal permission keys
const ROLE_MAPPING: Record<string, keyof typeof GLOBAL_ROLES> = {
  'admin': 'admin',
  'administrator': 'admin',
  'ADMIN': 'admin',
  'Admin': 'admin',
  'manager': 'manager',
  'MANAGER': 'manager',
  'Manager': 'manager',
  'pm': 'manager',
  'PM': 'manager',
  'project manager': 'manager',
  'staff': 'staff',
  'STAFF': 'staff',
  'employee': 'staff',
  'user': 'staff',
  // Add more mappings as needed
};

export function resolvePermissions(user: {
  role: string | null | undefined;
  position: string | null | undefined;
  group?: string | null | undefined;
  designation_name?: string | null | undefined;
  permissions?: {
    viewAllLeads: boolean;
    viewAssignedLeads: boolean;
    assignLeads: boolean;
    uploadLeads: boolean;
  };
}) {
  const roleStr = (user.role || 'staff').toLowerCase();
  const mappedRole = ROLE_MAPPING[roleStr] || 'staff';

  const positionKey = (user.designation_name || user.position || '').toLowerCase().trim();
  const positionPermissions = (POSITION_PERMISSIONS as any)[positionKey] || {};
  const groupLower = (user.group || '').toLowerCase().trim();

  // Start with merged base permissions
  let permissions = { 
    ...GLOBAL_ROLES[mappedRole as keyof typeof GLOBAL_ROLES], 
    ...positionPermissions 
  };

  // If backend provided custom permissions, merge them
  if (user.permissions) {
    if (user.permissions.viewAllLeads !== undefined) permissions.canViewAllLeads = user.permissions.viewAllLeads;
    if (user.permissions.viewAssignedLeads !== undefined) permissions.canViewAssignedLeads = user.permissions.viewAssignedLeads;
    if (user.permissions.assignLeads !== undefined) permissions.canAssignLeads = user.permissions.assignLeads;
    if (user.permissions.uploadLeads !== undefined) permissions.canUploadLeads = user.permissions.uploadLeads;
  }

  // 1. Admin bypass - always return full control
  if (mappedRole === 'admin') {
    return {
      ...GLOBAL_ROLES.admin,
      viewAllLeads: true,
      viewAssignedLeads: true,
      assignLeads: true,
      uploadLeads: true,
      canViewAllLeads: true,
      canViewAssignedLeads: true,
      canAssignLeads: true,
      canUploadLeads: true,
    };
  }

  // 2. Department-specific logic (DM, Content, etc.)
  const isDM = groupLower.includes('digital marketing') || groupLower === 'dm';
  const isContent = groupLower.includes('content');
  const isGraphics = groupLower.includes('graphics') || groupLower.includes('creative designers');
  
  // Position "Head" check (supports both IDs like '6' and name like "head")
  const isHead = positionKey === 'head' || positionKey === '6' || positionKey.includes('head');

  if (isDM || isContent) {
    if (isHead) {
      // DM Head: Only Lead Assignment (All Leads) - Per user requirement
      permissions.canViewAllLeads = true;
      permissions.canAssignLeads = true;
      permissions.canUploadLeads = true;
      permissions.canViewAssignedLeads = false; // Hide "My Assigned Leads"
      permissions.canAssignGroup = true; // Worksheet access
      permissions.canViewCalendar = true; // Added for robustness
    } else {
      // DM Member: Dashboard, All Leads, Onboarded Client, Calendar, Worksheet
      permissions.canViewAllLeads = true; 
      permissions.canAssignLeads = false;  
      permissions.canViewAssignedLeads = false; // Note: user omitted this from the list
      permissions.canUploadLeads = false;
      permissions.canAssignGroup = true; // Worksheet access
      permissions.canViewCalendar = true; // Calendar access
    }
  }

  if (isGraphics) {
    // Graphics: Restricted to Worksheet/Calendar
    permissions.canViewAllLeads = false;
    permissions.canViewAssignedLeads = false;
    permissions.canAssignLeads = false;
    permissions.canAssignGroup = true;
  }

  // 3. Fallback for generic positions (ensuring Head vs Member separation)
  if (isHead) {
     permissions.canViewAllLeads = true;
     permissions.canAssignLeads = true;
     permissions.canViewAssignedLeads = true;
  }

  // Map to unified permission object (handling all naming schemas used in menu/sidebar)
  const final = {
    ...permissions,
    // Format 1: CamelCase (used in menu.ts/sidebar)
    viewAllLeads: permissions.canViewAllLeads ?? false,
    viewAssignedLeads: permissions.canViewAssignedLeads ?? false,
    viewCalendar: permissions.canViewCalendar ?? false, // Add this
    assignLeads: permissions.canAssignLeads ?? false,
    uploadLeads: permissions.canUploadLeads ?? false,
    
    // Format 2: canCamelCase (used in some components)
    canViewAllLeads: permissions.canViewAllLeads ?? false,
    canViewAssignedLeads: permissions.canViewAssignedLeads ?? false,
    canViewCalendar: permissions.canViewCalendar ?? false, // Add this
    canAssignLeads: permissions.canAssignLeads ?? false,
    canUploadLeads: permissions.canUploadLeads ?? false,
    
    // Worksheet specific
    canAssignGroup: permissions.canAssignGroup ?? false,
  };

  return final;
}

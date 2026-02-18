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
  role: string;
  position: string;
  group?: string;
  designation_name?: string;
  permissions?: {
    viewAllLeads: boolean;
    viewAssignedLeads: boolean;
    assignLeads: boolean;
    uploadLeads: boolean;
  };
}) {
  // Map the role name to internal permission key
  const mappedRole = ROLE_MAPPING[user.role] || ROLE_MAPPING[user.role.toLowerCase()] || 'staff';

  // Get position permissions with case-insensitive matching
  const positionKey = (user.designation_name || user.position || '').toLowerCase();
  const positionPermissions = (POSITION_PERMISSIONS as any)[positionKey] || {};
  const groupLower = (user.group || '').toLowerCase().trim();

  // Start with base permissions from role + position
  let permissions = { ...GLOBAL_ROLES[mappedRole], ...positionPermissions };

  // If backend provided permissions, merge them into the starting point
  if (user.permissions) {
    permissions = {
      ...permissions,
      canViewAllLeads: user.permissions.viewAllLeads,
      canViewAssignedLeads: user.permissions.viewAssignedLeads,
      canAssignLeads: user.permissions.assignLeads,
      canUploadLeads: user.permissions.uploadLeads,
    };
  }

  // For admin role, position permissions should NOT override role permissions
  if (mappedRole === 'admin') {
    const adminPerms = GLOBAL_ROLES[mappedRole];
    return {
      ...adminPerms,
      viewAllLeads: adminPerms.canViewAllLeads || true,
      viewAssignedLeads: adminPerms.canViewAssignedLeads || true,
      assignLeads: adminPerms.canAssignLeads || true,
      uploadLeads: adminPerms.canUploadLeads || true,
    };
  }

  // Apply group-based restrictions for non-admin users
  if ((groupLower === 'content creator' || groupLower === 'content') && 
      (user.position === '1' || user.position === 'member' || user.position === 'employee' || 
       positionKey === 'member' || positionKey === 'employee' ||
       user.designation_name?.toLowerCase() === 'member' || user.designation_name?.toLowerCase() === 'employee')) {
    // Content Creator group with Member/employee position should have very limited access
    // Only Dashboard and Worksheet
    permissions.canViewAll = false;
    permissions.canAssignAny = false;
    permissions.canAssignGroup = true; // Allow worksheet access
    permissions.canManageGroups = false;
    permissions.canViewAllLeads = false;
    permissions.canViewAssignedLeads = false;
    permissions.canAssignLeads = false;
    permissions.canReceiveLeadIdsForAssignment = false;
    permissions.canViewCalendar = false;
  } else if (groupLower === 'content creator' || groupLower === 'content') {
    // Other Content Creator positions have normal access
    permissions.canViewAllLeads = false;
    permissions.canViewAssignedLeads = false;
  }

  // Ensure Digital Marketing and Content Creator have worksheet access
  if (groupLower.includes('digital marketing') || groupLower === 'dm' || groupLower.includes('content')) {
    permissions.canAssignGroup = true;
  }

  // Handle Proposal menu access for Digital Marketing Department
  // Only the "Head" position gets access to the Proposal menu
  if (groupLower.includes('digital marketing') || groupLower === 'dm') {
    if (positionKey === 'head' || positionKey === '6' || positionKey.includes('head')) {
      permissions.canUploadLeads = true;
    } else {
      // Members/Employees do not get proposal access
      permissions.canUploadLeads = false;
      // Also hide "Assigned Leads" submenu for members
      permissions.canViewAssignedLeads = false;
    }
  }

  // Restrict Graphics Department and Creative Designers from seeing Leads and Clients
  if (groupLower.includes('graphics') || groupLower.includes('creative designers')) {
    permissions.canViewAllLeads = false;
    permissions.canViewAssignedLeads = false;
    permissions.canAssignGroup = true;
  }

  // For other roles, position permissions can enhance role permissions
  
  // Map old permission keys to new ones
  return {
    ...permissions,
    viewAllLeads: permissions.canViewAllLeads || false,
    viewAssignedLeads: permissions.canViewAssignedLeads || false,
    assignLeads: permissions.canAssignLeads || false,
    uploadLeads: permissions.canUploadLeads || false,
  };
}

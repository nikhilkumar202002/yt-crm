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
}) {
  // Map the role name to internal permission key
  const mappedRole = ROLE_MAPPING[user.role] || ROLE_MAPPING[user.role.toLowerCase()] || 'staff';

  // Get position permissions with case-insensitive matching
  const positionKey = (user.position || '').toLowerCase();
  const positionPermissions = POSITION_PERMISSIONS[positionKey] || {};

  // For admin role, position permissions should NOT override role permissions
  if (mappedRole === 'admin') {
    return {
      ...positionPermissions, // Position permissions first
      ...GLOBAL_ROLES[mappedRole] // Admin permissions override position permissions
    };
  }

  // For other roles, position permissions can enhance role permissions
  return {
    ...GLOBAL_ROLES[mappedRole],
    ...positionPermissions
  };
}

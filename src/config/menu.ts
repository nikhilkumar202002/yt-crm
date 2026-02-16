// src/config/menu.ts
import { ADMIN_MENU } from './adminMenu';
import { GRAPHICS_MENU } from './graphicsMenu';
import { DM_MENU } from './dmMenu';
import { CONTENT_MENU } from './contentMenu';

export interface MenuItem {
  title: string;
  path: string;
  requiredPermissions?: string[]; // Array of required permission keys
  submenu?: MenuItem[];
}

// Helper function to check if user has required permissions
export function hasMenuAccess(userPermissions: any, requiredPermissions?: string[]): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }
  return requiredPermissions.some(perm => userPermissions[perm] === true);
}

/**
 * Get the appropriate menu based on user role and group
 */
export function getMenuByDepartment(role: string, group?: string): MenuItem[] {
  const roleLower = role?.toLowerCase() || '';
  const groupLower = group?.toLowerCase().trim() || '';
  
  // Admin access - can access all menus
  if (roleLower === 'admin' || roleLower === 'administrator') {
    return ADMIN_MENU;
  }

  // Department specific menus
  if (groupLower === 'graphics department' || groupLower === 'creative designers' || groupLower === 'graphics') {
    return GRAPHICS_MENU;
  }
  if (groupLower === 'digital marketing' || groupLower === 'dm' || groupLower === 'dm executive') {
    return DM_MENU;
  }
  if (groupLower === 'content creator' || groupLower === 'content') {
    return CONTENT_MENU;
  }

  // Default fallback
  return ADMIN_MENU;
}

export const SIDEBAR_MENU: MenuItem[] = ADMIN_MENU;
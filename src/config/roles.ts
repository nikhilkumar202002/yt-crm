export const GLOBAL_ROLES = {
  admin: {
    canViewAll: true,
    canAssignAny: true,
    canAssignGroup: true,
    canManageGroups: true
  },

  manager: {
    canViewAll: false,
    canAssignGroup: true,
    canManageOwnGroup: true
  },

  staff: {
    canViewAll: false,
    canAssignGroup: false
  }
};

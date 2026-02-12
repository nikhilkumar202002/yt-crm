export const GLOBAL_ROLES = {
  admin: {
    canViewAll: true,
    canAssignAny: true,
    canAssignGroup: true,
    canManageGroups: true,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true
  },

  manager: {
    canViewAll: false,
    canAssignGroup: true,
    canManageOwnGroup: true,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true
  },

  staff: {
    canViewAll: false,
    canAssignGroup: false,
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: false,
    canReceiveLeadIdsForAssignment: false
  }
};

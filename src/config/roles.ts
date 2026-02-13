export const GLOBAL_ROLES = {
  admin: {
    canViewAll: true,
    canAssignAny: true,
    canAssignGroup: true,
    canManageGroups: true,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true,
    canViewCalendar: true
  },

  manager: {
    canViewAll: false,
    canAssignGroup: true,
    canManageOwnGroup: true,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true,
    canViewCalendar: true
  },

  staff: {
    canViewAll: false,
    canAssignGroup: false,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: false,
    canViewCalendar: true
  }
};

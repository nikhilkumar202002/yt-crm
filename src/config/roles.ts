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
    canViewCalendar: true,
    canUploadLeads: true
  },

  manager: {
    canViewAll: false,
    canAssignGroup: true,
    canManageOwnGroup: true,
    canViewAllLeads: true,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true,
    canViewCalendar: true,
    canUploadLeads: true
  },

  staff: {
    canViewAll: false,
    canAssignGroup: true, // Staff should see their worksheet by default
    canViewAllLeads: false, 
    canViewAssignedLeads: true,
    canAssignLeads: false, 
    canReceiveLeadIdsForAssignment: false,
    canViewCalendar: true,
    canUploadLeads: false
  }
};

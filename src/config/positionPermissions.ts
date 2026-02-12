export const POSITION_PERMISSIONS = {
  '6': {
    canAssign: true,
    canReassign: true,
    canApprove: true,
    canViewAll: true,      // Head can view all leads
    canAssignGroup: true,   // Head can assign leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true
  },

  '1': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true,   // Member can see assigned leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: false,
    canReceiveLeadIdsForAssignment: false
  },

  '2': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true,   // Member can see assigned leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: false,
    canReceiveLeadIdsForAssignment: false
  },

  'head': {
    canAssign: true,
    canReassign: true,
    canApprove: true,
    canViewAll: true,      // Head can view all leads
    canAssignGroup: true,   // Head can assign leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: true,
    canReceiveLeadIdsForAssignment: true
  },

  'member': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true,   // Member can see assigned leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,
    canAssignLeads: false,
    canReceiveLeadIdsForAssignment: false
  },

  'intern': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canEdit: false,
    canViewAll: false,     // Intern cannot view leads
    canAssignGroup: false,  // Intern cannot see assigned leads
    canViewAllLeads: false,
    canViewAssignedLeads: true,  // If assigned
    canAssignLeads: false,
    canReceiveLeadIdsForAssignment: false
  }
};

export const POSITION_PERMISSIONS = {
  '6': {
    canAssign: true,
    canReassign: true,
    canApprove: true,
    canViewAll: true,      // Head can view all leads
    canAssignGroup: true   // Head can assign leads
  },

  '1': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true   // Member can see assigned leads
  },

  '2': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true   // Member can see assigned leads
  },

  'head': {
    canAssign: true,
    canReassign: true,
    canApprove: true,
    canViewAll: true,      // Head can view all leads
    canAssignGroup: true   // Head can assign leads
  },

  'member': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canViewAll: false,     // Member cannot view all leads
    canAssignGroup: true   // Member can see assigned leads
  },

  'intern': {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canEdit: false,
    canViewAll: false,     // Intern cannot view leads
    canAssignGroup: false  // Intern cannot see assigned leads
  }
};

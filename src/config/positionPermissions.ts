export const POSITION_PERMISSIONS = {
  Head: {
    canAssign: true,
    canReassign: true,
    canApprove: true
  },

  Member: {
    canAssign: false,
    canReassign: false,
    canApprove: false
  },

  Intern: {
    canAssign: false,
    canReassign: false,
    canApprove: false,
    canEdit: false
  }
};

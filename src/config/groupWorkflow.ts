export const GROUP_WORKFLOW = {
  "Digital Marketing": {
    nextGroup: "Content Creator",
    allowedPositionsToAssign: ["Head"]
  },

  "Content Creator": {
    nextGroup: "Creative Designers",
    allowedPositionsToAssign: ["Head"]
  },

  "Creative Designers": {
    nextGroup: null,
    allowedPositionsToAssign: ["Head"]
  }
};

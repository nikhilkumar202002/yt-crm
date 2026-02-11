import { GLOBAL_ROLES } from "./roles";
import { POSITION_PERMISSIONS } from "./positionPermissions";

export function resolvePermissions(user: {
  role: string;
  position: string;
}) {
  return {
    ...GLOBAL_ROLES[user.role],
    ...POSITION_PERMISSIONS[user.position]
  };
}

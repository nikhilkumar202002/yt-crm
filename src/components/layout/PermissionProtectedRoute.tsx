import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { resolvePermissions } from '../../config/permissionResolver';

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  fallbackPath?: string;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  children,
  requiredPermissions,
  fallbackPath = '/403'
}) => {
  const { permissions: userPermissions, roleName, position, group, designation_name } = useAppSelector((state) => state.auth);

  // Use permissions from state or resolve from user data
  const permissions = resolvePermissions({
    role: roleName || 'staff',
    permissions: userPermissions,
  });

  if (!permissions) {
    return <Navigate to="/login" replace />;
  }

  const hasPermission = requiredPermissions.some(perm => (permissions as any)[perm] === true);

  if (!hasPermission) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute;
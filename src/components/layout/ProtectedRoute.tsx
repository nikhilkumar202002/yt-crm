import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/store';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (Dashboard, etc.)
  return <Outlet />;
};

export default ProtectedRoute;
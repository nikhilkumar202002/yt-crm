import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Intelligence/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import RoleManagement from './pages/Settings/RoleManagement';
import LeadsPage from './pages/Leads/LeadsPage';

import DepartmentsPage from './pages/Settings/DepartmentsPage';
import DesignationsPage from './pages/Settings/DesignationsPage';

import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeRegistration from './pages/Employees/EmployeeRegistration';

import AssignedLeadsPage from './pages/Leads/AssignedLeadsPage';
import ServicesPage from './pages/Settings/ServicesPage';

import ProposalPage from './pages/Proposal page/ProposalPage';
import ClientPage from './pages/clients/ClientPage';


import { useAppSelector } from './store/store';

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Layout wraps all protected content */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings/roles" element={<RoleManagement />} />
            <Route path="/settings/departments" element={<DepartmentsPage />} />
            <Route path="/settings/designations" element={<DesignationsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/register" element={<EmployeeRegistration />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/assigned" element={<AssignedLeadsPage />} />
            <Route path="/settings/services" element={<ServicesPage />} />
            <Route path="/proposals" element={<ProposalPage />} />
            <Route path="/clients" element={<ClientPage />} />
            
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
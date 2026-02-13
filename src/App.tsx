import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Intelligence/Dashboard';
import PermissionProtectedRoute from './components/layout/PermissionProtectedRoute';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import RoleManagement from './pages/Settings/RoleManagement';
import LeadsPage from './pages/Leads/LeadsPage';

import EmployeesPage from './pages/Employees/EmployeesPage';
import EmployeeRegistration from './pages/Employees/EmployeeRegistration';
import DepartmentsPage from './pages/Settings/DepartmentsPage';
import DesignationsPage from './pages/Settings/DesignationsPage';
import ServicesPage from './pages/Settings/ServicesPage';
import CalendarWorkCreativesPage from './pages/Settings/CalendarWorkCreativesPage';

import ProposalPage from './pages/Proposal page/ProposalPage';

import ClientPage from './pages/clients/ClientPage';
import EnquiryClientsPage from './pages/clients/EnquiryClientsPage';
import LeadClientsPage from './pages/clients/LeadClientsPage';

import CalendarPage from './pages/Calendar/CalendarPage';
import WorksheetPage from './pages/Worksheet/WorksheetPage';
import GroupsPage from './pages/Settings/GroupsPage';
import PositionsPage from './pages/Settings/PositionsPage';



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
            <Route path="/leads" element={
              <PermissionProtectedRoute requiredPermissions={['viewAllLeads']}>
                <LeadsPage />
              </PermissionProtectedRoute>
            } />
            <Route path="/leads/assigned" element={
              <PermissionProtectedRoute requiredPermissions={['viewAssignedLeads']}>
                <LeadsPage />
              </PermissionProtectedRoute>
            } />
            <Route path="/settings/services" element={<ServicesPage />} />
            <Route path="/settings/calendar-work-creatives" element={<CalendarWorkCreativesPage />} />
            <Route path="/proposals" element={<ProposalPage />} />
            <Route path="/clients" element={<ClientPage />} />
            <Route path="/clients/enquiry-clients" element={<EnquiryClientsPage />} />
            <Route path="/clients/leads" element={<LeadClientsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/worksheet" element={<WorksheetPage />} />
            <Route path="/settings/groups" element={<GroupsPage />} />
            <Route path="/settings/positions" element={<PositionsPage />} />
            
            
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
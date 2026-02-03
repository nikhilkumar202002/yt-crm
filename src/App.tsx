import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Intelligence/Dashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAppSelector } from './store/store';

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected Routes - Only accessible after Login successful */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Future Workflow Routes */}
          {/* <Route path="/leads" element={<Leads />} /> cite: 5 */}
          {/* <Route path="/finance" element={<Finance />} /> cite: 72 */}
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
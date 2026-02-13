import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Shield, MoreVertical, Search, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/common/Button';
import { getEmployees } from '../../api/services/authService';
import type { Employee } from '../../api/services/authService';

interface ExtendedEmployee extends Employee {
  status?: boolean | number;
  mobile_number?: string;
  position_name?: string;
}
import { useAppSelector } from '../../store/store';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { roleName } = useAppSelector((state) => state.auth);
  const [employees, setEmployees] = useState<ExtendedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use a ref to track if the initial fetch has already occurred
  const hasFetched = useRef(false);

  const fetchEmployees = useCallback(async () => {
    // Permission Gate: Only attempt fetch if the user is an Admin
    if (roleName !== 'Admin') {
      setEmployees([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getEmployees(); //
      
      // Drilling into paginated structure: result.data.data
      const unwrappedData = result?.data?.data || result?.data || [];
      console.log('Employee data:', unwrappedData);
      setEmployees(Array.isArray(unwrappedData) ? unwrappedData : []);
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]); 
    } finally {
      setLoading(false);
    }
  }, [roleName]);

  useEffect(() => {
    // Only call the API if it hasn't been called yet for this mount
    if (!hasFetched.current) {
      fetchEmployees();
      hasFetched.current = true;
    }
  }, [fetchEmployees]); // Still safe to keep fetchEmployees here due to useCallback

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-[11px] text-slate-500 font-medium">Full access view and system review</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => navigate('/employees/register')}
          className="w-full sm:w-auto shadow-lg shadow-blue-900/10"
        >
          <UserPlus size={14} /> Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synchronizing Data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3">Employee Profile</th>
                  <th className="px-5 py-3">Role & Position</th>
                  <th className="px-5 py-3">Dept & Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[150px]">
                              {emp.name || ''}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                              <Mail size={10} className="text-slate-300" /> 
                              <span className="truncate max-w-[180px]">{emp.email || ''}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                              <Phone size={10} className="text-slate-300" /> 
                              <span>{emp.mobile_number || ''}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                            <Shield size={12} className="text-blue-500" /> {emp.role_name || ''}
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium italic">
                            {emp.designation_name || ''} 
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {emp.position_name || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-600">
                            {emp.department_name || ''}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                            emp.is_active === 1 || emp.status === 1 || emp.status === true
                              ? 'bg-green-50 text-green-600 border-green-100' 
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            <span className={`h-1 w-1 rounded-full mr-1.5 ${emp.is_active === 1 || emp.status === 1 || emp.status === true ? 'bg-green-500' : 'bg-red-500'}`} />
                            {emp.is_active === 1 || emp.status === 1 || emp.status === true ? 'Active' : 'Inactive'}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Joined {emp.created_at ? format(new Date(emp.created_at), 'MMM dd, yyyy') : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                          <Search size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                          {roleName === 'Admin' ? 'No matching employees found' : 'Access Restricted'}
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">
                          {roleName === 'Admin' ? 'The directory is currently empty' : 'Administrative privileges required'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
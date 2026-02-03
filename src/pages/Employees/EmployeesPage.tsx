import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Shield, MoreVertical } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getEmployees, Employee } from '../../api/services/authService';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

const fetchEmployees = useCallback(async () => {
  try {
    setLoading(true);
    const result = await getEmployees();
    
    /**
     * Paginated Structure:
     * result = { success: true, data: { data: [...], current_page: 1, ... } }
     * The array is at result.data.data
     */
    if (result && result.data && Array.isArray(result.data.data)) {
      setEmployees(result.data.data); //
    } else if (result && Array.isArray(result.data)) {
      // Fallback for non-paginated structure
      setEmployees(result.data);
    } else {
      setEmployees([]);
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    setEmployees([]); 
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-[11px] text-slate-500 font-medium">Full access view and system review</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => navigate('/employees/register')}
        >
          <UserPlus size={14} /> Add Employee
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[200px] relative">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-slate-50">
  {employees.map((emp) => (
    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {emp.name ? emp.name.charAt(0) : ''}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-none">
              {emp.name || ''}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Mail size={10} /> {emp.email || ''}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Shield size={12} className="text-blue-500" /> {emp.role_name || ''}
          </div>
          <p className="text-[10px] text-slate-400">
            {emp.designation_name || ''} 
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-slate-700">
            {emp.department_name || ''}
          </p>
          <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border ${
            emp.is_active === 1 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {emp.is_active === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
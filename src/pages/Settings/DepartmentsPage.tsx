import React, { useEffect, useState, useCallback } from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getDepartments, deleteDepartment, type OrgUnit } from '../../api/services/microService';
import { CreateDepartmentModal } from './components/CreateDepartmentModal';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDepartments();
      
      /**
       * Paginated Structure:
       * The array of departments is located at result.data.data
       */
      const deptList = result?.data?.data || result?.data || [];
      setDepartments(Array.isArray(deptList) ? deptList : []);
    } catch (error) {
      console.error("Failed to fetch departments", error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchDepartments(); 
  }, [fetchDepartments]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this department?")) {
      try {
        await deleteDepartment(id);
        fetchDepartments();
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Departments</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage organizational structures</p>
        </div>
      <CreateDepartmentModal onSuccess={fetchDepartments} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[200px] relative">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={14} /></div>
                          <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-500">{dept.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                          Number(dept.status) === 1 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {Number(dept.status) === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                        <button onClick={() => dept.id && handleDelete(dept.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                      No departments found in the system.
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

export default DepartmentsPage;
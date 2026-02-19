import React, { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getDesignations, deleteDesignation, type OrgUnit } from '../../api/services/microService';

import { CreateDesignationModal } from './components/CreateDesignationModal';

const DesignationsPage = () => {
  const [designations, setDesignations] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesignations = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDesignations();
      
      /**
       * Paginated Structure:
       * The array of designations is located at result.data.data
       */
      const designationList = result?.data?.data || result?.data || [];
      setDesignations(Array.isArray(designationList) ? designationList : []);
    } catch (error) {
      console.error("Failed to fetch designations", error);
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchDesignations(); 
  }, [fetchDesignations]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this designation?")) {
      try {
        await deleteDesignation(id);
        fetchDesignations();
      } catch (error) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Designations</h1>
          <p className="text-[11px] text-slate-500 font-medium">Define team roles and responsibilities</p>
        </div>
        <CreateDesignationModal onSuccess={fetchDesignations} />
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {designations.length > 0 ? (
                  designations.map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={14} /></div>
                          <span className="text-xs font-bold text-slate-900">{ds.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] text-slate-500">{ds.description}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                        <button onClick={() => ds.id && handleDelete(ds.id)} className="text-slate-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic text-sm">
                      No designations found in the system.
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

export default DesignationsPage;
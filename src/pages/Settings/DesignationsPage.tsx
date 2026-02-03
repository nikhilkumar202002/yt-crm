import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getDesignations, deleteDesignation, OrgUnit } from '../../api/services/microService';

const DesignationsPage = () => {
  const [designations, setDesignations] = useState<OrgUnit[]>([]);

  const fetchDesignations = async () => {
    const response = await getDesignations();
    setDesignations(response.data);
  };

  useEffect(() => { fetchDesignations(); }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this designation?")) {
      await deleteDesignation(id);
      fetchDesignations();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Designations</h1>
          <p className="text-[11px] text-slate-500 font-medium">Define team roles and responsibilities</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={14} /> Add Designation
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role Description</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {designations.map((ds) => (
              <tr key={ds.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Briefcase size={14} /></div>
                    <span className="text-xs font-bold text-slate-900">{ds.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] text-slate-500">{ds.description}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => ds.id && handleDelete(ds.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DesignationsPage;
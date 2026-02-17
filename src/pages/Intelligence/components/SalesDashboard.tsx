import React, { useState, useEffect } from 'react';
import { Target, ExternalLink } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import { getAssignedLeads } from '../../../api/services/microService';

interface SalesDashboardProps {
  user: any;
  groupName: string;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ user, groupName }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await getAssignedLeads(1, '', user?.id);
        const data = response.data?.data || response.data || [];
        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch assigned leads:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user?.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 items-start">
          <AttendanceTracker groupName={groupName} />
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-none text-white flex flex-col justify-center items-start">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 bg-blue-600 rounded-none flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <span className="font-black text-lg italic">YT</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Representative</p>
              <h2 className="text-xl font-black text-blue-400 leading-none">{user?.name}</h2>
            </div>
          </div>
          <div className="h-px w-full bg-slate-800 my-4" />
          <div className="flex items-start gap-4">
            <div className="px-3 py-1.5 bg-slate-800 rounded-none border border-slate-700">
              <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Assigned Leads</p>
              <p className="text-[10px] font-bold text-white">{leads.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-none shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Target size={16} className="text-blue-600" />
            My Assigned Leads
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-3">Lead Name</th>
                <th className="px-6 py-3">Requirement</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">Loading leads...</td></tr>
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-bold text-slate-900">{lead.lead?.name || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-slate-600 line-clamp-1">{lead.requirement || 'No requirement'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded-none border border-blue-100 uppercase">{lead.user_status || 'Pending'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"><ExternalLink size={14} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">No leads assigned to you</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
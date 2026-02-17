import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getCalendarWorks } from '../../../api/services/microService';

interface WorkScheduleProps {
  userId: number;
  groupName: string;
}

const WorkSchedule: React.FC<WorkScheduleProps> = ({ userId, groupName }) => {
  const [works, setCalendarWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await getCalendarWorks();
        const data = response.data?.data || response.data || [];
        
        const groupLower = groupName.toLowerCase();
        const isContent = groupLower.includes('content');
        const isGraphics = groupLower.includes('graphics') || groupLower.includes('creative');

        const filtered = data.filter((work: any) => {
          const parseIds = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val.map(i => (typeof i === 'object' ? i.id : i)).map(Number);
            try { return JSON.parse(val).map(Number); } catch { return String(val).split(',').map(Number).filter(n => !isNaN(n)); }
          };

          if (isContent) return parseIds(work.content_assigned_to).includes(userId);
          if (isGraphics) return parseIds(work.assigned_to).includes(userId);
          return parseIds(work.content_assigned_to).includes(userId) || parseIds(work.assigned_to).includes(userId);
        });

        setCalendarWorks(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, [userId, groupName]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          My Work Schedule
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Task Description</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">Loading schedule...</td></tr>
            ) : works.length > 0 ? (
              works.map((work) => (
                <tr key={work.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold text-slate-900">{work.client?.company_name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-slate-600 line-clamp-1">{work.content_description || work.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-slate-500">
                    {work.date ? new Date(work.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[9px] font-bold rounded-full border border-yellow-100">Pending</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-[10px] text-slate-400 uppercase tracking-widest">No tasks assigned for today</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkSchedule;
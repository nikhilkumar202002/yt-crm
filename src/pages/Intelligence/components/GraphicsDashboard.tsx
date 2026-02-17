import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import WorkSchedule from './WorkSchedule';
import { getCalendarWorks } from '../../../api/services/microService';

interface GraphicsDashboardProps {
  user: any;
  groupName: string;
}

const GraphicsDashboard: React.FC<GraphicsDashboardProps> = ({ user, groupName }) => {
  const [worksCount, setWorksCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await getCalendarWorks();
        const data = response.data?.data || response.data || [];
        const userId = Number(user?.id);
        const filtered = data.filter((work: any) => {
          const parseIds = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val.map(i => (typeof i === 'object' ? i.id : i)).map(Number);
            try { return JSON.parse(val).map(Number); } catch { return String(val).split(',').map(Number).filter(n => !isNaN(n)); }
          };
          return parseIds(work.assigned_to).includes(userId);
        });
        setWorksCount(filtered.length);
      } catch (err) {}
    };
    fetchCount();
  }, [user?.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 items-start">
          <AttendanceTracker groupName={groupName} />
        </div>
        <div className="md:col-span-1 bg-slate-900 p-6 rounded-none text-white flex flex-col justify-center relative overflow-hidden items-start">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Layers size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Graphics Dept</p>
          <h2 className="text-xl font-black text-blue-400 leading-none mb-2">{user?.name}</h2>
          <p className="text-[10px] text-slate-500 font-medium">Creative Designer</p>
        </div>
        <div className="md:col-span-1 bg-white p-5 rounded-none shadow-sm border border-slate-100 flex flex-col justify-center items-start">
          <div className="p-3 bg-purple-50 rounded-none text-purple-600 mb-2">
            <Layers size={20} />
          </div>
          <p className="text-2xl font-black text-slate-900">{worksCount}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Designs</p>
        </div>
      </div>
      <WorkSchedule userId={Number(user?.id)} groupName={groupName} />
    </div>
  );
};

export default GraphicsDashboard;
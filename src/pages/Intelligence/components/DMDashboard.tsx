import React from 'react';
import { Globe } from 'lucide-react';
import AttendanceTracker from './AttendanceTracker';
import WorkSchedule from './WorkSchedule';

interface DMDashboardProps {
  user: any;
  groupName: string;
}

const DMDashboard: React.FC<DMDashboardProps> = ({ user, groupName }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 items-start">
          <AttendanceTracker groupName={groupName} />
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-none text-white flex flex-col justify-center relative overflow-hidden items-start">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Globe size={100} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">DM Dept</p>
          <h2 className="text-xl font-black text-blue-400 leading-none mb-2">{user?.name}</h2>
          <p className="text-[10px] text-slate-500 font-medium">Digital Marketer</p>
        </div>
      </div>
      <WorkSchedule userId={Number(user?.id)} groupName={groupName} />
    </div>
  );
};

export default DMDashboard;
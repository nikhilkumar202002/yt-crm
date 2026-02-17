import React from 'react';
import AttendanceTracker from './AttendanceTracker';
import WorkSchedule from './WorkSchedule';

interface DepartmentDashboardProps {
  user: any;
  groupName: string;
}

const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ user, groupName }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <AttendanceTracker groupName={groupName} />
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl text-white flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <span className="font-black text-lg italic">YT</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome back,</p>
              <h2 className="text-xl font-black text-blue-400 leading-none">{user?.name}</h2>
            </div>
          </div>
          <div className="h-px w-full bg-slate-800 my-4" />
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Department</p>
              <p className="text-[10px] font-bold text-white">{groupName}</p>
            </div>
          </div>
        </div>
      </div>
      <WorkSchedule userId={Number(user?.id)} groupName={groupName} />
    </div>
  );
};

export default DepartmentDashboard;
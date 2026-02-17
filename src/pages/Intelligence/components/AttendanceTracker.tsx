import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface AttendanceTrackerProps {
  groupName: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ groupName }) => {
  const [loginTime, setLoginTime] = useState<string | null>(localStorage.getItem(`login_time_${groupName}`));
  const [logoutTime, setLogoutTime] = useState<string | null>(localStorage.getItem(`logout_time_${groupName}`));

  const handleClockIn = () => {
    const now = new Date().toLocaleTimeString();
    setLoginTime(now);
    localStorage.setItem(`login_time_${groupName}`, now);
  };

  const handleClockOut = () => {
    const now = new Date().toLocaleTimeString();
    setLogoutTime(now);
    localStorage.setItem(`logout_time_${groupName}`, now);
  };

  return (
    <div className="bg-white p-5 rounded-none shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-none text-blue-600">
          <Clock size={20} />
        </div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Attendance Tracker</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500 font-medium uppercase">Login:</span>
          <span className="text-slate-900 font-bold">{loginTime || '--:--'}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-500 font-medium uppercase">Logout:</span>
          <span className="text-slate-900 font-bold">{logoutTime || '--:--'}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button 
          variant={loginTime ? "secondary" : "primary"} 
          size="sm" 
          className="flex-1 text-[10px] font-bold h-9"
          onClick={handleClockIn}
          disabled={!!loginTime}
        >
          Clock In
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 text-[10px] font-bold h-9"
          onClick={handleClockOut}
          disabled={!loginTime || !!logoutTime}
        >
          Clock Out
        </Button>
      </div>
    </div>
  );
};

export default AttendanceTracker;
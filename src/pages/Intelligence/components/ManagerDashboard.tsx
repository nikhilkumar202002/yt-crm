import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '../../../store/store';
import { Button } from '../../../components/common/Button';
import { getUsersList } from '../../../api/services/authService';
// import { getEmployeesForAssignment } from '../../../api/services/microService'; // reserved for future use
import { Search } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email?: string;
  group_name?: string;
  position_name?: string;
}

interface AttendanceRecord {
  user_id: number;
  status: 'present' | 'absent' | 'late' | string;
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [team, setTeam] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // get users list (company-wide) then filter by manager's group/team
        const usersResp = await getUsersList();
        const usersData: User[] = usersResp?.data?.data || usersResp?.data || [];

        // Prefer microService employees endpoint which may include position/group
        let teamMembers: User[] = usersData;

        // If current user has group info, filter to that group
        const myGroup = user?.group_name?.toLowerCase();
        if (myGroup) {
          teamMembers = usersData.filter(u => u.group_name?.toLowerCase() === myGroup && u.id !== user?.id);
        }

        setTeam(teamMembers);

        // Attendance integration: currently not available in API wrapper.
        // Keep attendance empty; this block can be replaced with a real API call
        // once an attendance endpoint (e.g., getAttendanceForDate) is added to microService.
        setAttendance([]);
      } catch (err) {
        console.error('Failed to load team or users', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetch();
  }, [user?.id, user?.group_name]);

  const absentMembers = useMemo(() => {
    const absentIds = new Set(attendance.filter(a => a.status === 'absent').map(a => a.user_id));
    return team.filter(t => absentIds.has(t.id));
  }, [attendance, team]);

  const filteredTeam = team.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.position_name?.toLowerCase().includes(search.toLowerCase()));

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Manager Dashboard</h2>
          <p className="text-sm text-slate-500">Overview for {user.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..." className="pl-10 pr-3 py-2 border rounded-none text-sm" />
          </div>
          <Button variant="primary" size="sm">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 border rounded-none">
          <h3 className="font-bold text-sm mb-3">Team Members ({filteredTeam.length})</h3>
          {loading ? (
            <div className="text-sm text-slate-400">Loading...</div>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-auto">
              {filteredTeam.map(m => (
                <li key={m.id} className="flex items-center justify-between p-2 border rounded-none">
                  <div>
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.position_name || m.group_name}</div>
                  </div>
                  <div className="text-xs text-slate-500">{attendance.find(a => a.user_id === m.id)?.status || '—'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 border rounded-none">
          <h3 className="font-bold text-sm mb-3">Absent Today ({absentMembers.length})</h3>
          {loading ? (
            <div className="text-sm text-slate-400">Loading...</div>
          ) : absentMembers.length === 0 ? (
            <div className="text-sm text-slate-400">No absentees</div>
          ) : (
            <ul className="space-y-2">
              {absentMembers.map(m => (
                <li key={m.id} className="flex items-center justify-between p-2 border rounded-none">
                  <div>
                    <div className="font-bold text-sm">{m.name}</div>
                    <div className="text-xs text-slate-500">{m.position_name || m.group_name}</div>
                  </div>
                  <div className="text-xs text-red-600 font-bold">Absent</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

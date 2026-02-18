import React, { useEffect, useState, useMemo } from 'react';
import { useAppSelector } from '../../../store/store';
import { Users, AlertCircle, CheckCircle, Clock, MoreHorizontal, Search as SearchIcon } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getUsersList } from '../../../api/services/authService';

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
        const usersResp = await getUsersList();
        const usersData: User[] = usersResp?.data?.data || usersResp?.data || [];
        let teamMembers: User[] = usersData;
        const myGroup = user?.group_name?.toLowerCase();
        if (myGroup) {
          teamMembers = usersData.filter(u => u.group_name?.toLowerCase() === myGroup && u.id !== user?.id);
        }
        setTeam(teamMembers);
        setAttendance([]); // placeholder until attendance API available
      } catch (err) {
        console.error('Failed to load team or users', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetch();
  }, [user?.id, user?.group_name]);

  const stats = useMemo(() => {
    const total = team.length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const pendingApprovals = 0; // placeholder
    return { total, absentCount, presentCount, pendingApprovals };
  }, [team, attendance]);

  const absentMembers = useMemo(() => {
    const absentIds = new Set(attendance.filter(a => a.status === 'absent').map(a => a.user_id));
    return team.filter(t => absentIds.has(t.id));
  }, [attendance, team]);

  const filteredTeam = team.filter(t => (t.name || '').toLowerCase().includes(search.toLowerCase()) || (t.position_name || '').toLowerCase().includes(search.toLowerCase()));

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-none shadow-sm border-l-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Team Members</p>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
            </div>
            <Users size={28} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-none shadow-sm border-l-2 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Absent Today</p>
              <p className="text-xl font-black text-slate-900">{stats.absentCount}</p>
            </div>
            <AlertCircle size={28} className="text-red-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-none shadow-sm border-l-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
              <p className="text-xl font-black text-slate-900">{stats.presentCount}</p>
            </div>
            <CheckCircle size={28} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-none shadow-sm border-l-2 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
              <p className="text-xl font-black text-slate-900">{stats.pendingApprovals}</p>
            </div>
            <Clock size={28} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users size={14} className="text-blue-600" /> Team Members
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..." className="pl-10 pr-3 py-2 border rounded-none text-sm" />
              </div>
              <Button variant="secondary" size="sm">Export</Button>
              <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-slate-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    <th className="py-3 text-left">Name</th>
                    <th className="py-3 text-left">Position</th>
                    <th className="py-3 text-left">Email</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTeam.map((m) => (
                    <tr key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 text-[10px] font-bold text-slate-800">{m.name}</td>
                      <td className="py-3 text-[10px] text-slate-500">{m.position_name || m.group_name}</td>
                      <td className="py-3 text-[10px] text-slate-500">{m.email || '—'}</td>
                      <td className="py-3 text-right text-[10px]">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold ${attendance.find(a => a.user_id === m.id)?.status === 'present' ? 'text-green-600 bg-green-50' : attendance.find(a => a.user_id === m.id)?.status === 'absent' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50'}`}>
                          {attendance.find(a => a.user_id === m.id)?.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-none shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Absent Today ({absentMembers.length})</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
          </div>

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

          <div className="mt-6 border-t border-slate-50 pt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Actions</h4>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm">Mark Attendance</Button>
              <Button variant="primary" size="sm">Request Update</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;

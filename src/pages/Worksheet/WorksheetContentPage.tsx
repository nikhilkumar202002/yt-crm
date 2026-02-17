import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, updateCalendarWorkContentDetails, updateCalendarWorkStatus } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import EditContentModal from './components/EditContentModal';

interface Creative {
  id: string;
  name: string;
  nos: string;
}

interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  contact_number_1: string;
  contact_number_2: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  update_history: null;
  is_in_leads: boolean;
  proposal_id: null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  group_id: string;
  position_id: string;
  role_name: string;
  group_name: string;
  position_name: string;
}

interface CalendarWork {
  id: number;
  client_id: string;
  date: string;
  content_file: null;
  created_at: string;
  updated_at: string;
  description: string;
  content_description: string;
  created_by: string;
  update_history: unknown[] | null;
  notes: string;
  is_special_day: boolean;
  assigned_to: string | null;
  assigned_to_names?: Record<string, string>;
  assigned_by: string | null;
  assigned_time: string | null;
  content_assigned_to: string | null;
  content_assigned_to_names?: Record<string, string>;
  creatives: Creative[];
  client: Client;
  tracking_no: string;
  is_deleted: boolean;
  deleted_by: string | null;
  content_assigned_by: string | null;
  status?: string;
  client_approved_status?: string;
}

const WorksheetContentPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [workStatuses, setWorkStatuses] = useState<{ [key: number]: string }>({});

  const [editContentModal, setEditContentModal] = useState<{
    isOpen: boolean;
    workId: number | null;
    description: string;
  }>({
    isOpen: false,
    workId: null,
    description: ''
  });

  useEffect(() => {
    const fetchCalendarWorks = async () => {
      try {
        setLoading(true);
        const response = await getCalendarWorks();
        const worksData = response.data?.data || response.data || [];
        setCalendarWorks(worksData);
        setError(null);
      } catch (err) {
        setError('Failed to load calendar works data');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await getUsersList();
        const usersData = response.data?.data || response.data || [];
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchCalendarWorks();
    fetchUsers();
  }, []);

  const handleStatusChange = async (workId: number, newStatus: string) => {
    try {
      const response = await updateCalendarWorkStatus(workId, newStatus);
      if (response.status || response.data) {
        setWorkStatuses(prev => ({ ...prev, [workId]: newStatus }));
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { ...w, status: newStatus } : w));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdateContent = async (workId: number, description: string, file?: File) => {
    try {
      const response = await updateCalendarWorkContentDetails(workId, { 
        content_description: description, 
        content_file: file 
      });
      const updatedWork = response.data || response;
      if (updatedWork) {
        setCalendarWorks(prev => prev.map(w => w.id === workId ? updatedWork : w));
      }
      setEditContentModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

  const parseIds = (data: any): number[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(item => (typeof item === 'object' && item !== null ? item.id : item))
                 .map(Number).filter(n => !isNaN(n));
    }
    try {
      if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(item => (typeof item === 'object' && item !== null ? item.id : item))
                       .map(Number).filter(n => !isNaN(n));
        }
      }
      const stringData = String(data);
      return stringData.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
    } catch (e) {
      return [];
    }
  };

  const getAssignedNames = (work: CalendarWork) => {
    const assignedTo = work.assigned_to;
    const assignedNames = work.assigned_to_names;
    const ids = parseIds(assignedTo);
    if (ids.length === 0) return 'Not Assigned';
    
    if (assignedNames) {
      const names = ids.map(id => assignedNames[id.toString()]).filter(Boolean);
      if (names.length > 0) {
        if (names.length > 2) return `${names[0]}, ${names[1]} +${names.length - 2}`;
        return names.join(', ');
      }
    }

    const names = ids.map(id => users.find(u => u.id === Number(id))?.name).filter(Boolean);
    if (names.length === 0) return 'Not Assigned';
    if (names.length > 2) return `${names[0]}, ${names[1]} +${names.length - 2}`;
    return names.join(', ');
  };

  const getFullAssignedNames = (assignedTo: string | null) => {
    const ids = parseIds(assignedTo);
    const names = ids.map(id => users.find(u => u.id === Number(id))?.name).filter(Boolean);
    return names.length > 0 ? names.join(', ') : undefined;
  };

  const filteredCalendarWorks = calendarWorks.filter(work => {
    if (user?.id) {
      const assignedContentIds = parseIds(work.content_assigned_to);
      if (!assignedContentIds.includes(Number(user.id))) {
        return false;
      }
    }

    const searchLower = searchTerm.toLowerCase();
    return (
      work.client?.company_name?.toLowerCase().includes(searchLower) ||
      work.client?.name?.toLowerCase().includes(searchLower) ||
      work.content_description?.toLowerCase().includes(searchLower) ||
      work.notes?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Content Worksheet</h1>
          <p className="text-[11px] text-slate-500 font-medium">View and manage your assigned content works</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, content, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal"
          />
        </div>
      </div>

      <div className="bg-white rounded-none shadow-sm border border-slate-200/60 overflow-hidden relative border border-slate-200">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Calendar Works...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-12 text-left border border-slate-200">#</th>
                  <th className="px-4 py-3 w-24 border border-slate-200">Special Day</th>
                  <th className="px-4 py-3 w-48 border border-slate-200">Client</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Creatives</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Designer</th>
                  <th className="px-4 py-3 min-w-[250px] border border-slate-200">Content Description</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Client Approval</th>
                  <th className="px-4 py-3 w-24 text-left border border-slate-200">Status</th>
                  <th className="px-4 py-3 w-24 text-left border border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-left align-top text-[10px] font-medium text-slate-400 border border-slate-200">{index + 1}</td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="flex items-start gap-2">
                          {work.is_special_day ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-none text-[9px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                              Special Day
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Regular</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-37.5">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1.5 truncate max-w-37.5">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="space-y-1">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 2).map((creative, index) => (
                              <div key={index} className="text-[10px] text-slate-600">
                                {creative.name} ({creative.nos})
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400">No creatives</span>
                          )}
                          {work.creatives && work.creatives.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{work.creatives.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        {(() => {
                          const names = getAssignedNames(work);
                          const isAssigned = parseIds(work.assigned_to).length > 0;
                          return (
                            <div 
                              className={`text-[10px] px-3 py-1.5 border font-bold truncate uppercase tracking-wider ${
                                isAssigned 
                                  ? 'bg-orange-500 text-white border-orange-600' 
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                              title={getFullAssignedNames(work.assigned_to)}
                            >
                              {names}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] text-slate-700">
                          {work.content_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <span className={`inline-flex items-center px-2 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider text-white ${
                          work.client_approved_status === 'approved' ? 'bg-green-600' :
                          work.client_approved_status === 'not_approved' ? 'bg-red-600' :
                          work.client_approved_status === 'needed_edit' ? 'bg-orange-600' :
                          work.client_approved_status === 'images_changed' ? 'bg-blue-600' :
                          'bg-slate-500'
                        }`}>
                          {work.client_approved_status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <select
                          value={workStatuses[work.id] || work.status || 'pending'}
                          onChange={(e) => handleStatusChange(work.id, e.target.value)}
                          className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer transition-all w-full min-w-[100px] text-white ${
                            (workStatuses[work.id] || work.status) === 'completed' ? 'bg-green-600' :
                            (workStatuses[work.id] || work.status) === 'working_progress' ? 'bg-blue-600' :
                            (workStatuses[work.id] || work.status) === 'approval_pending' ? 'bg-purple-600' :
                            'bg-slate-500'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="working_progress">In Progress</option>
                          <option value="approval_pending">Approval</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <button 
                          onClick={() => setEditContentModal({
                            isOpen: true,
                            workId: work.id,
                            description: work.content_description || ''
                          })}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-none transition-all"
                          title="Edit Content"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center align-top border border-slate-200">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-none text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">No works found</p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">Check back later for new assignments</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditContentModal
        isOpen={editContentModal.isOpen}
        onClose={() => setEditContentModal(prev => ({ ...prev, isOpen: false }))}
        onSave={(description, file) => {
          if (editContentModal.workId) {
            handleUpdateContent(editContentModal.workId, description, file);
          }
        }}
        initialDescription={editContentModal.description}
      />
    </div>
  );
};

export default WorksheetContentPage;
import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, updateCalendarWorkContentDetails } from '../../api/services/microService';
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
}

const WorksheetContentPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workStatuses] = useState<{ [key: number]: string }>({});

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

    fetchCalendarWorks();
  }, []);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Calendar Works...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3 w-24">Special Day</th>
                  <th className="px-4 py-3 w-48">Client</th>
                  <th className="px-4 py-3 w-32">Creatives</th>
                  <th className="px-4 py-3 min-w-[250px]">Content Description</th>
                  <th className="px-4 py-3 w-24 text-center">Status</th>
                  <th className="px-4 py-3 w-24 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-center text-[10px] font-medium text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {work.is_special_day ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                              Special Day
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Regular</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-37.5">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1.5 truncate max-w-37.5">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3">
                        <div className="text-[11px] text-slate-700">
                          {work.content_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-medium ${
                          workStatuses[work.id] === 'completed' ? 'bg-green-100 text-green-800' :
                          workStatuses[work.id] === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {workStatuses[work.id] || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setEditContentModal({
                            isOpen: true,
                            workId: work.id,
                            description: work.content_description || ''
                          })}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Content"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
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
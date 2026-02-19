import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Plus, Search, LayoutGrid, List, Calendar as CalendarIcon, FileText, Upload
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, assignCalendarWorkContent, assignDesignersToWork, updateClientApprovedStatus } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import AssignmentModal from './components/AssignmentModal';
import ImageLightbox from '../../components/common/ImageLightbox';

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
  designer_files?: any;
  designer_file?: any;
  designer_status?: string;
  status?: string;
  client_approved_status?: string;
}

const WorksheetDMPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserGroup, setCurrentUserGroup] = useState<string>('');
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');
  const [clientApprovedStatuses, setClientApprovedStatuses] = useState<{ [key: number]: string }>({});
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [workStatuses, setWorkStatuses] = useState<{ [key: number]: string }>({});
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal state
  const [assignmentModal, setAssignmentModal] = useState<{ isOpen: boolean; workId: number | null; initialIds: number[]; type: 'designer' | 'content' }>({
    isOpen: false,
    workId: null,
    initialIds: [],
    type: 'designer'
  });

  // For DM roles, show all columns including content assign
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
        // Set current user group
        const currentUser = user?.id ? usersData.find((u: User) => u.id === user.id) : null;
        setCurrentUserGroup(currentUser?.group_name || '');
        setCurrentUserPosition(currentUser?.position_name || '');
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchCalendarWorks();
    fetchUsers();
  }, [user?.id]);

  const positionLower = currentUserPosition.toLowerCase().trim();
  const isHead = positionLower.includes('head');

  const handleAssignDesigner = async (workId: number, userIds: number[]) => {
    try {
      const response = await assignDesignersToWork(workId, userIds);
      const updatedWork = response.data || response;
      if (updatedWork) {
        setCalendarWorks(prev => prev.map(w => w.id === workId ? updatedWork : w));
      }
      setAssignmentModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Failed to assign designer:', err);
    }
  };

  const handleAssignContent = async (workId: number, userIds: number[]) => {
    try {
      const response = await assignCalendarWorkContent(workId, { content_assigned_to: JSON.stringify(userIds) });
      const updatedWork = response.data || response;
      if (updatedWork) {
        setCalendarWorks(prev => prev.map(w => w.id === workId ? updatedWork : w));
      }
      setAssignmentModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Failed to assign content:', err);
    }
  };

  const handleClientApprovedStatusChange = async (workId: number, newStatus: string) => {
    try {
      const response = await updateClientApprovedStatus(workId, newStatus);
      if (response.status || response.data) {
        setClientApprovedStatuses(prev => ({ ...prev, [workId]: newStatus }));
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { ...w, client_approved_status: newStatus } : w));
      }
    } catch (err) {
      console.error('Failed to update client approval status:', err);
    }
  };

  const designerUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('graphics') || u.group_name?.toLowerCase().includes('creative')),
  [users]);

  const contentUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('content')),
  [users]);

  const parseFiles = (data: any): string[] => {
    if (!data) return [];
    
    const extractUrl = (item: any): string | null => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && item.file_url) return item.file_url;
      return null;
    };

    if (Array.isArray(data)) {
      return data.map(extractUrl).filter((item): item is string => item !== null);
    }
    
    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (!trimmed) return [];
      
      try {
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          const array = Array.isArray(parsed) ? parsed : [parsed];
          return array.map(extractUrl).filter((item): item is string => item !== null);
        }
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
      } catch (e) {
        return [trimmed];
      }
    }
    return [];
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

  const getAssignedNames = (work: CalendarWork, type: 'designer' | 'content') => {
    const assignedTo = type === 'designer' ? work.assigned_to : work.content_assigned_to;
    const assignedNames = type === 'designer' ? work.assigned_to_names : work.content_assigned_to_names;
    const ids = parseIds(assignedTo);
    if (ids.length === 0) return type === 'designer' ? 'Assign Designer' : 'Assign Content';
    
    if (assignedNames) {
      const names = ids.map(id => assignedNames[id.toString()]).filter(Boolean);
      if (names.length > 0) {
        if (names.length > 2) return `${names[0]}, ${names[1]} +${names.length - 2}`;
        return names.join(', ');
      }
    }

    const names = ids.map(id => users.find(u => u.id === Number(id))?.name).filter(Boolean);
    if (names.length === 0) return type === 'designer' ? 'Assign Designer' : 'Assign Content';
    if (names.length > 2) return `${names[0]}, ${names[1]} +${names.length - 2}`;
    return names.join(', ');
  };

  const getFullAssignedNames = (assignedTo: string | null) => {
    const ids = parseIds(assignedTo);
    const names = ids.map(id => users.find(u => u.id === Number(id))?.name).filter(Boolean);
    return names.length > 0 ? names.join(', ') : undefined;
  };

  // Filter works based on search term
  const filteredCalendarWorks = calendarWorks.filter(work => {
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
      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-content ul { list-style-type: disc !important; margin-left: 1.25rem !important; margin-top: 0.25rem; }
        .rich-text-content ol { list-style-type: decimal !important; margin-left: 1.25rem !important; margin-top: 0.25rem; }
        .rich-text-content { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
        .rich-text-content.expanded { -webkit-line-clamp: unset; display: block; }
        .rich-text-content p { margin-bottom: 0.25rem; }
        .rich-text-content b, .rich-text-content strong { font-weight: 700; }
      `}} />

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">DM Worksheet</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage calendar works and assignments</p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          className="w-full sm:w-auto shadow-lg shadow-blue-900/10"
        >
          <Plus size={14} /> Add Work
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client, content, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal"
            />
          </div>
          <div className="flex items-center border border-slate-200 bg-white p-1 ml-1 shrink-0 h-[38px]">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`p-1.5 transition-all ${viewMode === 'card' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`relative ${viewMode === 'table' ? 'bg-white rounded-none shadow-sm border border-slate-200/60 overflow-hidden' : ''}`}>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3 border border-slate-200 bg-white">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Calendar Works...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3 border border-slate-200 bg-white">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1600px] border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-12 text-left border border-slate-200">#</th>
                  <th className="px-4 py-3 w-28 border border-slate-200">Tracking No</th>
                  <th className="px-4 py-3 w-24 border border-slate-200">Date</th>
                  <th className="px-4 py-3 w-24 border border-slate-200">Special Day</th>
                  <th className="px-4 py-3 w-48 border border-slate-200">Client</th>
                  <th className="px-4 py-3 min-w-[250px] border border-slate-200">Content Description</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Creatives</th>
                  <th className="px-4 py-3 min-w-[200px] border border-slate-200">Notes</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Designer</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Content Writer</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Designs</th>
                  <th className="px-4 py-3 w-32 text-left border border-slate-200">Work Status</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Client Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-left align-top text-[10px] font-medium text-slate-400 border border-slate-200">{index + 1}</td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-900">
                          {work.tracking_no || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] font-medium text-slate-900">
                          {work.date ? (() => {
                            const date = new Date(work.date);
                            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                          })() : 'No Date'}
                        </div>
                      </td>
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
                        <div 
                          className={`text-[11px] text-slate-700 rich-text-content ${expandedRows[work.id] ? 'expanded' : ''}`}
                          title={work.content_description?.replace(/<[^>]*>/g, '')}
                          dangerouslySetInnerHTML={{ __html: work.content_description || 'No description' }}
                        />
                        {work.content_description && work.content_description.length > 60 && (
                          <button 
                            onClick={() => toggleRowExpansion(work.id)}
                            className="text-[9px] text-blue-600 hover:text-blue-800 font-bold mt-1 uppercase tracking-tighter"
                          >
                            {expandedRows[work.id] ? 'Show Less' : 'Read More'}
                          </button>
                        )}
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
                        <div className="text-[11px] text-slate-700">
                          {work.notes || 'No notes'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        {(() => {
                          const names = getAssignedNames(work, 'designer');
                          const isAssigned = parseIds(work.assigned_to).length > 0;
                          return (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className={`text-[10px] w-full justify-between transition-all ${isAssigned ? '!bg-orange-500 !text-white !border-orange-600' : ''}`}
                              title={getFullAssignedNames(work.assigned_to)}
                              onClick={() => {
                                if (!isHead) return;
                                setAssignmentModal({
                                  isOpen: true,
                                  workId: work.id,
                                  initialIds: parseIds(work.assigned_to),
                                  type: 'designer'
                                });
                              }}
                            >
                              {names}
                            </Button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        {(() => {
                          const names = getAssignedNames(work, 'content');
                          const isAssigned = parseIds(work.content_assigned_to).length > 0;
                          return (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className={`text-[10px] w-full justify-between transition-all ${isAssigned ? '!bg-blue-500 !text-white !border-blue-600 hover:!bg-blue-600' : ''}`}
                              title={getFullAssignedNames(work.content_assigned_to)}
                              onClick={() => {
                                if (!isHead) return;
                                setAssignmentModal({
                                  isOpen: true,
                                  workId: work.id,
                                  initialIds: parseIds(work.content_assigned_to),
                                  type: 'content'
                                });
                              }}
                            >
                              {names}
                            </Button>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="flex flex-col items-start gap-2">
                          {(() => {
                            const files = parseFiles(work.designer_files || work.designer_file);
                            return files.length > 0 ? (
                              <div className="flex flex-wrap items-start gap-2">
                                {files.map((file, idx) => {
                                  const imageUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`;
                                  return (
                                    <button 
                                      key={idx} 
                                      onClick={() => setLightboxImage(imageUrl)}
                                      className="block group/img relative"
                                    >
                                      <img 
                                        src={imageUrl} 
                                        alt="Design" 
                                        className="h-20 w-20 object-cover rounded-none border border-slate-200 shadow-sm group-hover/img:border-blue-400 transition-all cursor-zoom-in"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Error';
                                        }}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">No designs</span>
                            );
                          })()}
                        </div>
                      </td>
                     
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Content</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider w-fit text-white ${
                              work.status === 'completed' ? 'bg-green-600' :
                              work.status === 'working_progress' ? 'bg-blue-600' :
                              work.status === 'approval_pending' ? 'bg-purple-600' :
                              'bg-slate-500'
                            }`}>
                              {(work.status || 'pending').replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Designer</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider w-fit text-white ${
                              work.designer_status === 'completed' ? 'bg-green-600' :
                              work.designer_status === 'working_progress' ? 'bg-blue-600' :
                              work.designer_status === 'approval_pending' ? 'bg-purple-600' :
                              'bg-slate-500'
                            }`}>
                              {(work.designer_status || 'pending').replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </td>
                       <td className="px-4 py-3 align-top border border-slate-200">
                        <select
                          value={clientApprovedStatuses[work.id] || work.client_approved_status || 'pending'}
                          onChange={(e) => handleClientApprovedStatusChange(work.id, e.target.value)}
                          className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer transition-all w-full min-w-[100px] text-white ${
                            (clientApprovedStatuses[work.id] || work.client_approved_status) === 'approved' ? 'bg-green-600' :
                            (clientApprovedStatuses[work.id] || work.client_approved_status) === 'not_approved' ? 'bg-red-600' :
                            (clientApprovedStatuses[work.id] || work.client_approved_status) === 'needed_edit' ? 'bg-orange-600' :
                            (clientApprovedStatuses[work.id] || work.client_approved_status) === 'images_changed' ? 'bg-blue-600' :
                            'bg-slate-500'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="not_approved">Not Approved</option>
                          <option value="needed_edit">Needed Edit</option>
                          <option value="images_changed">Images Changed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="px-6 py-20 text-center align-top border border-slate-200">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-none text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          No works found
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">
                          Create a new work to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCalendarWorks.length > 0 ? (
              filteredCalendarWorks.map((work) => (
                <div key={work.id} className="bg-white border border-slate-200 rounded-none overflow-hidden hover:shadow-lg transition-all flex flex-col group">
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50 group-hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-none uppercase tracking-widest border border-blue-100">
                        {work.tracking_no || 'UNT-000'}
                      </span>
                      {work.is_special_day && (
                        <span className="text-[9px] font-bold bg-purple-600 text-white px-2 py-1 rounded-none uppercase tracking-wider">
                          Special Day
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{work.client?.company_name || 'N/A'}</h3>
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarIcon size={12} />
                      <span className="text-[11px] font-medium">
                         {work.date ? new Date(work.date).toLocaleDateString() : 'No Date'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 space-y-4">
                    {/* Content Section */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText size={10} className="text-blue-500" /> Content Description
                      </label>
                      <div 
                        className={`text-[11px] text-slate-600 rich-text-content leading-relaxed ${expandedRows[work.id] ? 'expanded' : ''}`} 
                        dangerouslySetInnerHTML={{ __html: work.content_description || 'No description provided' }} 
                      />
                      {work.content_description && work.content_description.length > 100 && (
                        <button 
                          onClick={() => toggleRowExpansion(work.id)} 
                          className="text-[9px] text-blue-600 font-bold uppercase hover:underline"
                        >
                          {expandedRows[work.id] ? 'Less' : 'More'}
                        </button>
                      )}
                    </div>

                    {/* Creatives & Files */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Creatives</label>
                        <div className="flex flex-wrap gap-1">
                          {work.creatives?.map((c, i) => (
                            <span key={i} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 border border-slate-200">
                              {c.name} ({c.nos})
                            </span>
                          )) || <span className="text-[10px] text-slate-300 italic">None</span>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Designs</label>
                        <div className="flex flex-wrap gap-1.5">
                          {parseFiles(work.designer_files || work.designer_file).map((f, i) => (
                            <img 
                              key={i} 
                              src={f.startsWith('http') ? f : `${import.meta.env.VITE_API_BASE_URL || ''}/${f.replace(/^\//, '')}`} 
                              className="h-8 w-8 object-cover border border-slate-200 cursor-zoom-in"
                              onClick={() => setLightboxImage(f)}
                            />
                          )) || <span className="text-[10px] text-slate-300 underline">None</span>}
                        </div>
                      </div>
                    </div>

                    {/* Team Section */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Designer</p>
                          <button 
                            onClick={() => isHead && setAssignmentModal({ isOpen: true, workId: work.id, initialIds: parseIds(work.assigned_to), type: 'designer' })}
                            className={`w-full text-left text-[10px] font-bold p-1.5 border transition-all truncate ${parseIds(work.assigned_to).length > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                          >
                            {getAssignedNames(work, 'designer')}
                          </button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Content</p>
                          <button 
                            onClick={() => isHead && setAssignmentModal({ isOpen: true, workId: work.id, initialIds: parseIds(work.content_assigned_to), type: 'content' })}
                            className={`w-full text-left text-[10px] font-bold p-1.5 border transition-all truncate ${parseIds(work.content_assigned_to).length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                          >
                            {getAssignedNames(work, 'content')}
                          </button>
                        </div>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex-1">
                           <p className="text-[8px] text-slate-400 font-bold uppercase mb-1">Approval Status</p>
                           <select
                              value={clientApprovedStatuses[work.id] || work.client_approved_status || 'pending'}
                              onChange={(e) => handleClientApprovedStatusChange(work.id, e.target.value)}
                              className={`text-[9px] font-bold px-2 py-1.5 rounded-none border-none outline-none cursor-pointer transition-all w-full text-white ${
                                (clientApprovedStatuses[work.id] || work.client_approved_status) === 'approved' ? 'bg-green-600' :
                                'bg-slate-500'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="not_approved">Not Approved</option>
                              <option value="needed_edit">Needed Edit</option>
                              <option value="images_changed">Images Changed</option>
                            </select>
                        </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-200 p-20 text-center italic text-slate-400 text-sm">
                No worksheets match your search.
              </div>
            )}
          </div>
        )}
      </div>

      <AssignmentModal
        isOpen={assignmentModal.isOpen}
        onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))}
        onAssign={(userIds) => {
          if (assignmentModal.workId) {
            if (assignmentModal.type === 'designer') {
              handleAssignDesigner(assignmentModal.workId, userIds);
            } else {
              handleAssignContent(assignmentModal.workId, userIds);
            }
          }
        }}
        users={assignmentModal.type === 'designer' ? designerUsers : contentUsers}
        initialSelectedIds={assignmentModal.initialIds}
        title={assignmentModal.type === 'designer' ? "Assign Designers" : "Assign Content Writers"}
      />

      {lightboxImage && (
        <ImageLightbox 
          src={lightboxImage} 
          onClose={() => setLightboxImage(null)} 
        />
      )}
    </div>
  );
};

export default WorksheetDMPage;
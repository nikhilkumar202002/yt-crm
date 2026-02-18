import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  AlertTriangle,
  Image as ImageIcon,
  LayoutGrid, List, Calendar as CalendarIcon, FileText, Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, updateClientApprovedStatus } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import ImageLightbox from '../../components/common/ImageLightbox';
import { POSITION_PERMISSIONS } from '../../config/positionPermissions';

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
  designer_files?: string[] | string;
  designer_file?: string[] | string;
  status?: string;
  designer_status?: string;
  client_approved_status?: string;
}

const WorksheetManagerPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [updatingWorkId, setUpdatingWorkId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if user can approve
  const canApprove = useMemo(() => {
    if (!currentUserPosition) return false;
    const positionKey = currentUserPosition.toLowerCase().trim();
    const permissions = POSITION_PERMISSIONS[positionKey] || POSITION_PERMISSIONS[currentUserPosition];
    return permissions?.canApprove || false;
  }, [currentUserPosition]);

  useEffect(() => {
    const fetchCalendarWorks = async () => {
      try {
        setLoading(true);
        const response = await getCalendarWorks();
        const worksData = response.data?.data || response.data || [];
        setCalendarWorks(worksData);
        setError(null);
      } catch (err) {
        console.error('Failed to load calendar works:', err);
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
        // Set current user position
        const currentUser = user?.id ? usersData.find((u: User) => u.id === user.id) : null;
        setCurrentUserPosition(currentUser?.position_name || '');
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchCalendarWorks();
    fetchUsers();
  }, [user?.id]);

  const handleApprovalChange = async (workId: number, newStatus: string) => {
    if (!canApprove) return;

    try {
      setUpdatingWorkId(workId);
      const response = await updateClientApprovedStatus(workId, newStatus);
      const updatedWork = response.data || response;
      if (updatedWork) {
        setCalendarWorks(prev => prev.map(w => w.id === workId ? updatedWork : w));
      }
    } catch (err) {
      console.error('Failed to update approval status:', err);
    } finally {
      setUpdatingWorkId(null);
    }
  };

const parseFiles = (data: unknown): string[] => {
    if (!data) return [];

    const extractUrl = (item: unknown): string | null => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'file_url' in item) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.file_url === 'string') return obj.file_url;
      }
      return null;
    };

    if (Array.isArray(data)) {
      return data.map(extractUrl).filter((item): item is string => item !== null);
    }

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (!trimmed) return [];

      try {
        // Handle JSON strings like '["url1", "url2"]' or '[{"file_url": "..."}]'
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          const array = Array.isArray(parsed) ? parsed : [parsed];
          return array.map(extractUrl).filter((item): item is string => item !== null);
        }
        // Handle comma-separated strings
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        // Fallback for single strings (URLs or paths)
        return [trimmed];
      }
    }
    return [];
  };

const parseIds = (data: unknown): number[] => {
    if (!data) return [];

    // Handle native arrays (of numbers or objects)
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'object' && item !== null && 'id' in item) {
          const obj = item as Record<string, unknown>;
          return typeof obj.id === 'number' || typeof obj.id === 'string' ? obj.id : item;
        }
        return item;
      })
                 .map(Number)
                 .filter(n => !isNaN(n));
    }

    try {
      // Handle JSON strings
      if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (typeof item === 'object' && item !== null && 'id' in item) {
              const obj = item as Record<string, unknown>;
              return typeof obj.id === 'number' || typeof obj.id === 'string' ? obj.id : item;
            }
            return item;
          })
                       .map(Number)
                       .filter(n => !isNaN(n));
        }
      }

      // Handle comma-separated strings or single IDs
      const stringData = String(data);
      return stringData.split(',').map(s => s.trim()).map(Number).filter(n => !isNaN(n));
    } catch {
      return [];
    }
  };

  const getAssignedNames = (work: CalendarWork, type: 'designer' | 'content') => {
    const assignedTo = type === 'designer' ? work.assigned_to : work.content_assigned_to;
    const assignedNames = type === 'designer' ? work.assigned_to_names : work.content_assigned_to_names;

    const ids = parseIds(assignedTo);
    if (ids.length === 0) return type === 'designer' ? 'No Designer' : 'No Content';

    // 1. Try to use names directly from the work object (provided by API)
    if (assignedNames) {
      const names = ids.map(id => assignedNames[id.toString()]).filter(Boolean);
      if (names.length > 0) {
        if (names.length > 2) return `${names[0]}, ${names[1]} +${names.length - 2}`;
        return names.join(', ');
      }
    }

    // 2. Fallback to global users list
    const names = ids
      .map(id => users.find(u => u.id === Number(id))?.name)
      .filter(Boolean);

    if (names.length === 0) return type === 'designer' ? 'No Designer' : 'No Content';

    if (names.length > 2) {
      return `${names[0]}, ${names[1]} +${names.length - 2}`;
    }
    return names.join(', ');
  };

  // Filter works based on search term and approval status
  const filteredCalendarWorks = calendarWorks.filter(work => {
    // Only show works that are in approval pending status or have been submitted for approval
    const isApprovalPending = work.designer_status === 'approval_pending' ||
                             work.client_approved_status === 'pending' ||
                             !work.client_approved_status ||
                             work.client_approved_status === 'needed_edit';

    if (!isApprovalPending) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      work.client?.company_name?.toLowerCase().includes(searchLower) ||
      work.client?.name?.toLowerCase().includes(searchLower) ||
      work.content_description?.toLowerCase().includes(searchLower) ||
      work.notes?.toLowerCase().includes(searchLower) ||
      work.tracking_no?.toLowerCase().includes(searchLower)
    );
  });

  if (currentUserPosition && !canApprove) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-sans">
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <AlertTriangle size={48} className="text-orange-500" />
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-500 text-center">You don't have permission to access the manager approval page.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manager Approval</h1>
          <p className="text-[11px] text-slate-500 font-medium">Review and approve creative works</p>
        </div>
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

      {/* Calendar Works Container */}
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
            <table className="w-full text-left border-collapse min-w-[1400px] border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 w-12 text-left border border-slate-200">#</th>
                  <th className="px-4 py-3 w-28 border border-slate-200">Tracking No</th>
                  <th className="px-4 py-3 w-24 border border-slate-200">Date</th>
                  <th className="px-4 py-3 w-24 border border-slate-200">Special Day</th>
                  <th className="px-4 py-3 w-48 border border-slate-200">Client</th>
                  <th className="px-4 py-3 min-w-[250px] border border-slate-200">Content Description</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Creatives</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Designer</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Content Writer</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Design Files</th>
                  <th className="px-4 py-3 w-32 border border-slate-200">Designer Status</th>
                  <th className="px-4 py-3 w-40 border border-slate-200">Client Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors">
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
                        <div className="text-[10px] text-slate-600">
                          {getAssignedNames(work, 'designer')}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[10px] text-slate-600">
                          {getAssignedNames(work, 'content')}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="flex flex-wrap items-start gap-2">
                          {(() => {
                            // Check both designer_files and designer_file (fallback for singular naming)
                            const files = parseFiles(work.designer_files || work.designer_file);
                            return files.length > 0 ? (
                              files.map((file, idx) => {
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
                                      className="h-16 w-16 object-cover rounded-none border border-slate-200 shadow-sm group-hover/img:border-blue-400 transition-all cursor-zoom-in"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Error';
                                      }}
                                    />
                                  </button>
                                );
                              })
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <ImageIcon size={12} />
                                No files
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <span className={`inline-flex items-center px-2 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider text-white ${
                          work.designer_status === 'completed' ? 'bg-green-600' :
                          work.designer_status === 'working_progress' ? 'bg-blue-600' :
                          work.designer_status === 'approval_pending' ? 'bg-purple-600' :
                          'bg-slate-500'
                        }`}>
                          {work.designer_status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="flex flex-col gap-2">
                          <select
                            value={work.client_approved_status || 'pending'}
                            onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                            disabled={updatingWorkId === work.id}
                            className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer w-full min-w-[120px] text-white ${
                              work.client_approved_status === 'approved' ? 'bg-green-600' :
                              work.client_approved_status === 'not_approved' ? 'bg-red-600' :
                              work.client_approved_status === 'needed_edit' ? 'bg-orange-600' :
                              work.client_approved_status === 'images_changed' ? 'bg-blue-600' :
                              'bg-slate-500'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="not_approved">Not Approved</option>
                            <option value="needed_edit">Needs Edit</option>
                            <option value="images_changed">Images Changed</option>
                          </select>
                          {updatingWorkId === work.id && (
                            <div className="flex items-center gap-1 text-[9px] text-blue-600">
                              <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
                              Updating...
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-6 py-20 text-center align-top border border-slate-200">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-none text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          No works pending approval
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">
                          Works will appear here when submitted for approval
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

                  <div className="p-4 flex-1 space-y-4">
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

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Design Files</label>
                      <div className="flex flex-wrap gap-2">
                        {parseFiles(work.designer_files || work.designer_file).map((file, idx) => {
                          const imageUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`;
                          return (
                            <img 
                              key={idx} 
                              src={imageUrl} 
                              className="h-12 w-12 object-cover border border-slate-200 cursor-zoom-in hover:border-blue-500 transition-all"
                              onClick={() => setLightboxImage(imageUrl)}
                            />
                          );
                        })}
                        {parseFiles(work.designer_files || work.designer_file).length === 0 && (
                          <span className="text-[10px] text-slate-300">No designs uploaded</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Designer</p>
                          <p className="text-[10px] font-bold text-slate-700 bg-slate-50 p-1.5 border border-slate-200 truncate">
                            {getAssignedNames(work, 'designer')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Content</p>
                          <p className="text-[10px] font-bold text-slate-700 bg-slate-50 p-1.5 border border-slate-200 truncate">
                            {getAssignedNames(work, 'content')}
                          </p>
                        </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[8px] text-slate-400 font-bold uppercase mb-0.5">Approval Decision</p>
                      <select
                        value={work.client_approved_status || 'pending'}
                        onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                        disabled={updatingWorkId === work.id}
                        className={`text-[10px] font-black px-2 py-1.5 rounded-none border-none outline-none cursor-pointer w-full text-white shadow-sm transition-all ${
                          work.client_approved_status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                          work.client_approved_status === 'not_approved' ? 'bg-red-600 hover:bg-red-700' :
                          work.client_approved_status === 'needed_edit' ? 'bg-orange-600 hover:bg-orange-700' :
                          work.client_approved_status === 'images_changed' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-slate-500 hover:bg-slate-600'
                        }`}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="not_approved">Not Approved</option>
                        <option value="needed_edit">Needed Edit</option>
                        <option value="images_changed">Images Changed</option>
                      </select>
                      {updatingWorkId === work.id && (
                        <div className="flex items-center justify-center gap-1.5 text-[9px] text-blue-600 font-bold mt-1">
                          <div className="animate-spin h-2 w-2 border border-blue-600 border-t-transparent rounded-full" />
                          UPDATING...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-100 p-20 text-center italic text-slate-400 text-sm">
                No works found matching your filter.
              </div>
            )}
          </div>
        )}
      </div>

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};

export default WorksheetManagerPage;
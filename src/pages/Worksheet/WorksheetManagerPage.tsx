import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  AlertTriangle,
  Image as ImageIcon,
  LayoutGrid, List, Calendar as CalendarIcon, FileText, Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, updateClientApprovedStatus, updateHeadApproval } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import ImageLightbox from '../../components/common/ImageLightbox';
import CommentModal from '../../components/common/CommentModal';
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
  is_head_approved?: boolean | null;
  head_comment?: string | null;
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
  const [commentModal, setCommentModal] = useState<{ isOpen: boolean; work: CalendarWork | null }>({
    isOpen: false,
    work: null
  });

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openCommentModal = (work: CalendarWork) => {
    setCommentModal({ isOpen: true, work });
  };

  // Check if user can approve
  const canApprove = useMemo(() => {
    if (!currentUserPosition) return false;
    const positionKey = currentUserPosition.toLowerCase().trim();
    const permissions = (POSITION_PERMISSIONS as any)[positionKey] || (POSITION_PERMISSIONS as any)[currentUserPosition];
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

  const handleApprovalChange = async (workId: number, newStatus: string, type: 'client' | 'head' = 'client') => {
    if (!canApprove) return;

    try {
      setUpdatingWorkId(workId);
      if (type === 'head') {
        const work = calendarWorks.find(w => w.id === workId);
        // Map UI string to boolean/null
        const apiStatus = newStatus === 'approved' ? true : newStatus === 'edit_needed' ? false : null;
        await updateHeadApproval(workId, apiStatus, work?.head_comment || '');
        
        // Manual merge to prevent data loss and ensure visibility
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { 
          ...w, 
          is_head_approved: apiStatus 
        } : w));
      } else {
        await updateClientApprovedStatus(workId, newStatus, 'client_approved_status');
        
        // Manual merge to keep client and creatives info
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { 
          ...w, 
          client_approved_status: newStatus 
        } : w));
      }
    } catch (err) {
      console.error('Failed to update approval status:', err);
    } finally {
      setUpdatingWorkId(null);
    }
  };

  const handleCommentChange = async (workId: number, comments: string) => {
    try {
      setUpdatingWorkId(workId);
      const work = calendarWorks.find(w => w.id === workId);
      // Keep existing bool or default to null for pending
      const currentStatus = work?.is_head_approved === undefined ? null : work.is_head_approved;
      await updateHeadApproval(workId, currentStatus, comments);
      
      // Manual merge to keep row data intact
      setCalendarWorks(prev => prev.map(w => w.id === workId ? { 
        ...w, 
        head_comment: comments 
      } : w));
    } catch (err) {
      console.error('Failed to update comments:', err);
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
    // Hide works that are already approved by the head (Manager)
    if (work.is_head_approved === true) return false;

    // Only show works that are in approval pending status or have been submitted for approval
    const isApprovalPending = work.designer_status === 'approval_pending' ||
                             work.designer_status === 'completed' ||
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
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr className="text-[8.5px] font-bold text-slate-500 uppercase tracking-[0.05em]">
                  <th className="px-3 py-2.5 w-10 text-left border border-slate-200/60">#</th>
                  <th className="px-3 py-2.5 w-24 border border-slate-200/60">Tracking</th>
                  <th className="px-3 py-2.5 w-20 border border-slate-200/60">Date</th>
                  <th className="px-3 py-2.5 w-20 border border-slate-200/60">Type</th>
                  <th className="px-3 py-2.5 w-44 border border-slate-200/60">Client</th>
                  <th className="px-3 py-2.5 min-w-[200px] border border-slate-200/60">Content Description</th>
                  <th className="px-3 py-2.5 w-24 border border-slate-200/60">Creative</th>
                  <th className="px-3 py-2.5 w-32 border border-slate-200/60">Designer</th>
                  <th className="px-3 py-2.5 w-32 border border-slate-200/60">Writer</th>
                  <th className="px-3 py-2.5 w-28 border border-slate-200/60">Design</th>
                  <th className="px-3 py-2.5 w-28 border border-slate-200/60">Status</th>
                  <th className="px-3 py-2.5 w-28 border border-slate-200/60">Client Appr</th>
                  <th className="px-3 py-2.5 w-28 border border-slate-200/60">Head Appr</th>
                  <th className="px-3 py-2.5 w-20 border border-slate-200/60 text-center">Cmd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-3 py-2 text-left align-top text-[9px] font-medium text-slate-400 border border-slate-100/80">{index + 1}</td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="text-[10px] font-bold text-blue-600 tracking-tight">
                          {work.tracking_no || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80 whitespace-nowrap">
                        <div className="text-[10px] font-medium text-slate-600">
                          {work.date ? (() => {
                            const date = new Date(work.date);
                            return isNaN(date.getTime()) ? 'Invalid' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                          })() : 'No Date'}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="flex items-start">
                          {work.is_special_day ? (
                            <span className="text-[8px] font-extrabold text-purple-600 uppercase tracking-tighter bg-purple-50 px-1 rounded-sm border border-purple-100">
                              Special
                            </span>
                          ) : (
                            <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">Norm</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 leading-tight truncate">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate uppercase tracking-tighter">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div
                          className={`text-[10px] text-slate-500 rich-text-content leading-relaxed ${expandedRows[work.id] ? 'expanded' : ''}`}
                          dangerouslySetInnerHTML={{ __html: work.content_description || 'No description' }}
                        />
                        {work.content_description && work.content_description.length > 50 && (
                          <button
                            onClick={() => toggleRowExpansion(work.id)}
                            className="text-[8px] text-blue-500 hover:text-blue-700 font-bold mt-1 uppercase tracking-widest"
                          >
                            {expandedRows[work.id] ? '[-] Less' : '[+] More'}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="flex flex-col gap-0.5">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 2).map((creative, index) => (
                              <div key={index} className="text-[9px] text-slate-600 whitespace-nowrap">
                                <span className="font-bold text-slate-400 mr-1">{creative.nos}x</span>
                                {creative.name.length > 12 ? creative.name.substring(0, 12) + '..' : creative.name}
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-300 italic">None</span>
                          )}
                          {work.creatives && work.creatives.length > 2 && (
                            <span className="text-[8px] text-slate-400 font-semibold">+{work.creatives.length - 2} items</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="text-[9px] text-indigo-600 font-medium leading-tight">
                          {getAssignedNames(work, 'designer')}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="text-[9px] text-emerald-600 font-medium leading-tight">
                          {getAssignedNames(work, 'content')}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="flex flex-wrap items-start gap-1">
                          {(() => {
                            const files = parseFiles(work.designer_files || work.designer_file);
                            return files.length > 0 ? (
                              files.slice(0, 2).map((file, idx) => {
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
                                      className="h-8 w-8 object-cover rounded shadow-sm border border-slate-200 group-hover/img:border-blue-400 transition-all cursor-zoom-in"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/32x32?text=Err';
                                      }}
                                    />
                                  </button>
                                );
                              })
                            ) : (
                              <div className="flex items-center gap-1 text-[8px] text-slate-300">
                                No Files
                              </div>
                            );
                          })()}
                          {parseFiles(work.designer_files || work.designer_file).length > 2 && (
                            <span className="text-[8px] text-slate-400 self-center">+{parseFiles(work.designer_files || work.designer_file).length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight text-white ${
                          work.designer_status === 'completed' ? 'bg-green-500' :
                          work.designer_status === 'working_progress' ? 'bg-blue-500' :
                          work.designer_status === 'approval_pending' ? 'bg-violet-500' :
                          'bg-slate-400'
                        }`}>
                          {work.designer_status?.replace('_', ' ') || 'Pending'}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="flex flex-col gap-1">
                          <select
                            value={work.client_approved_status || 'pending'}
                            onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                            disabled={updatingWorkId === work.id}
                            className={`text-[8.5px] font-bold px-2 py-1 rounded border outline-none cursor-pointer w-full transition-all text-center appearance-none ${
                              work.client_approved_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                              work.client_approved_status === 'not_approved' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' :
                              work.client_approved_status === 'needed_edit' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              work.client_approved_status === 'images_changed' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' :
                              'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="approved">APPROVED</option>
                            <option value="not_approved">REJECTED</option>
                            <option value="needed_edit">EDIT</option>
                            <option value="images_changed">IMAGES</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80">
                        <div className="flex flex-col gap-1">
                          <select
                            value={
                              work.is_head_approved === true ? 'approved' : 
                              (work.is_head_approved === false && work.head_comment) ? 'edit_needed' : 
                              'pending'
                            }
                            onChange={(e) => handleApprovalChange(work.id, e.target.value, 'head')}
                            disabled={updatingWorkId === work.id}
                            className={`text-[8.5px] font-bold px-2 py-1 rounded border outline-none cursor-pointer w-full transition-all text-center appearance-none ${
                              work.is_head_approved === true ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                              (work.is_head_approved === false && work.head_comment) ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' :
                              'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="approved">APPROVED</option>
                            <option value="edit_needed">RE-EDIT</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top border border-slate-100/80 text-center">
                        <button
                          onClick={() => openCommentModal(work)}
                          className={`p-1 rounded-full transition-colors ${work.head_comment ? 'text-blue-600 bg-blue-50' : 'text-slate-300 hover:text-slate-500 active:bg-slate-100'}`}
                          title={work.head_comment || "Add Command"}
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="px-6 py-20 text-center align-top border border-slate-100/80">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded text-slate-200">
                          <Clipboard size={20} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          Clear Queue
                        </p>
                        <p className="text-[9px] text-slate-300 uppercase tracking-tighter">
                          All works processed
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
                <div key={work.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-all flex flex-col group">
                  {/* Header Section */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50 group-hover:bg-blue-50/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest border border-blue-100">
                        {work.tracking_no || 'UNT-000'}
                      </span>
                      <div className="flex items-center gap-2">
                        {work.is_special_day && (
                          <span className="text-xs font-bold bg-purple-600 text-white px-2 py-1 rounded-md uppercase tracking-wider">
                            Special Day
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-slate-500">
                          <CalendarIcon size={12} />
                          <span className="text-xs font-medium">
                            {work.date ? new Date(work.date).toLocaleDateString() : 'No Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{work.client?.company_name || 'N/A'}</h3>
                    <p className="text-xs text-slate-500">{work.client?.name || 'N/A'}</p>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 space-y-4">
                    {/* Content Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText size={10} className="text-blue-500" /> Content Description
                      </label>
                      <div
                        className={`text-xs text-slate-600 rich-text-content leading-relaxed ${expandedRows[work.id] ? 'expanded' : ''}`}
                        dangerouslySetInnerHTML={{ __html: work.content_description || 'No description provided' }}
                      />
                      {work.content_description && work.content_description.length > 100 && (
                        <button
                          onClick={() => toggleRowExpansion(work.id)}
                          className="text-xs text-blue-600 font-bold uppercase hover:underline"
                        >
                          {expandedRows[work.id] ? 'Less' : 'More'}
                        </button>
                      )}
                    </div>

                    {/* Creatives */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Creatives</label>
                      <div className="flex flex-wrap gap-1">
                        {work.creatives && work.creatives.length > 0 ? (
                          work.creatives.map((creative, idx) => (
                            <span key={idx} className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs font-medium text-green-800">
                              {creative.name} ({creative.nos})
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No creatives</span>
                        )}
                      </div>
                    </div>

                    {/* Assignments */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Designer</p>
                        <p className="text-xs font-semibold text-indigo-800 bg-indigo-50 p-2 border border-indigo-200 rounded truncate">
                          {getAssignedNames(work, 'designer')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Content Writer</p>
                        <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2 border border-emerald-200 rounded truncate">
                          {getAssignedNames(work, 'content')}
                        </p>
                      </div>
                    </div>

                    {/* Design Files */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Design Files</label>
                      <div className="flex flex-wrap gap-2">
                        {parseFiles(work.designer_files || work.designer_file).map((file, idx) => {
                          const imageUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`;
                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              className="h-12 w-12 object-cover border border-slate-200 cursor-zoom-in hover:border-blue-500 transition-all rounded"
                              onClick={() => setLightboxImage(imageUrl)}
                            />
                          );
                        })}
                        {parseFiles(work.designer_files || work.designer_file).length === 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <ImageIcon size={12} />
                            No designs uploaded
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Designer Status</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white ${
                          work.designer_status === 'completed' ? 'bg-green-600' :
                          work.designer_status === 'working_progress' ? 'bg-blue-600' :
                          work.designer_status === 'approval_pending' ? 'bg-purple-600' :
                          'bg-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            work.designer_status === 'completed' ? 'bg-green-200' :
                            work.designer_status === 'working_progress' ? 'bg-blue-200' :
                            work.designer_status === 'approval_pending' ? 'bg-purple-200' :
                            'bg-slate-200'
                          }`}></div>
                          {work.designer_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Section */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto space-y-3">
                    {/* Client Approval */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client Approval Status</p>
                      <select
                        value={work.client_approved_status || 'pending'}
                        onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                        disabled={updatingWorkId === work.id}
                        className={`text-xs font-bold px-3 py-2 rounded-md border outline-none cursor-pointer w-full transition-all appearance-none text-center ${
                          work.client_approved_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                          work.client_approved_status === 'not_approved' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' :
                          work.client_approved_status === 'needed_edit' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                          work.client_approved_status === 'images_changed' ? 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' :
                          'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="not_approved">Rejected</option>
                        <option value="needed_edit">Edit Needed</option>
                        <option value="images_changed">Images Changed</option>
                      </select>
                    </div>

                    {/* Head Approval */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Head Approval Status</p>
                      <select
                        value={
                          work.is_head_approved === true ? 'approved' : 
                          (work.is_head_approved === false && work.head_comment) ? 'edit_needed' : 
                          'pending'
                        }
                        onChange={(e) => handleApprovalChange(work.id, e.target.value, 'head')}
                        disabled={updatingWorkId === work.id}
                        className={`text-xs font-bold px-3 py-2 rounded-md border outline-none cursor-pointer w-full transition-all appearance-none text-center ${
                          work.is_head_approved === true ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                          (work.is_head_approved === false && work.head_comment) ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' :
                          'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="edit_needed">Re-Edit Needed</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approval Feedback</p>
                      <button
                        onClick={() => openCommentModal(work)}
                        className={`w-full py-2 rounded-md text-[11px] font-bold border transition-all flex items-center justify-center gap-2 ${
                          work.head_comment 
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <FileText size={12} />
                        {work.head_comment ? 'View/Edit Comments' : 'Add Comments'}
                      </button>
                    </div>

                    {/* Loading State */}
                    {updatingWorkId === work.id && (
                      <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                        <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full" />
                        UPDATING...
                      </div>
                    )}
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

      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
        onSave={(comments) => {
          if (commentModal.work) {
            handleCommentChange(commentModal.work.id, comments);
          }
        }}
        initialComments={commentModal.work?.head_comment || ''}
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

export default WorksheetManagerPage;
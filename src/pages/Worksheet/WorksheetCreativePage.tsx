import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  Edit, Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, assignCalendarWorkContent, assignDesignersToWork, updateCalendarWorkContentDetails, uploadDesignerFiles, updateCalendarWorkStatus, updateDesignerStatus, updateClientApprovedStatus } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import AssignmentModal from './components/AssignmentModal';
import EditContentModal from './components/EditContentModal';
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
  status?: string;
  designer_status?: string;
  client_approved_status?: string;
}

const WorksheetCreativePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserGroup, setCurrentUserGroup] = useState<string>('');
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');
  const [workStatuses, setWorkStatuses] = useState<{ [key: number]: string }>({});
  const [clientApprovedStatuses, setClientApprovedStatuses] = useState<{ [key: number]: string }>({});
  const [uploadingWorkId, setUploadingWorkId] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Modal state
  const [assignmentModal, setAssignmentModal] = useState<{ isOpen: boolean; workId: number | null; initialIds: number[]; type: 'designer' | 'content' }>({
    isOpen: false,
    workId: null,
    initialIds: [],
    type: 'designer'
  });
  const [editContentModal, setEditContentModal] = useState<{
    isOpen: boolean;
    workId: number | null;
    description: string;
  }>({
    isOpen: false,
    workId: null,
    description: ''
  });

  const groupLower = currentUserGroup.toLowerCase().trim();
  const positionLower = currentUserPosition.toLowerCase().trim();
  const isHead = positionLower.includes('head');
  const isContentWriter = ['content creator', 'content'].includes(groupLower);
  const isGraphics = ['creative designers', 'creative team lead', 'graphics department', 'graphics'].includes(groupLower);

  // Conditional visibility based on user group
  const shouldShowSLno = true;
  const shouldShowTrackingNo = false;
  const shouldShowDate = false;
  const shouldShowSpecialDay = true;
  const shouldShowClient = true;
  const shouldShowContentDescription = true;
  const shouldShowCreatives = !isContentWriter;
  const shouldShowNotes = true;
  const shouldShowAssignDesigner = !isContentWriter;
  const shouldShowAssignContent = false;
  const shouldShowDesignUpload = !isContentWriter;
  const shouldShowStatus = true;
  const shouldShowClientApproval = true;
  const shouldShowActions = false;

  const totalVisibleCols = 
    (shouldShowSLno ? 1 : 0) +
    (shouldShowTrackingNo ? 1 : 0) +
    (shouldShowDate ? 1 : 0) +
    (shouldShowSpecialDay ? 1 : 0) +
    (shouldShowClient ? 1 : 0) +
    (shouldShowContentDescription ? 1 : 0) +
    (shouldShowCreatives ? 1 : 0) +
    (shouldShowNotes ? 1 : 0) +
    (shouldShowAssignDesigner ? 1 : 0) +
    (shouldShowAssignContent ? 1 : 0) +
    (shouldShowDesignUpload ? 1 : 0) +
    (shouldShowClientApproval ? 1 : 0) +
    (shouldShowStatus ? 1 : 0) +
    (shouldShowActions ? 1 : 0);

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
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchCalendarWorks();
    fetchUsers();
  }, [user?.id]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingWorkId) return;

    try {
      const workId = uploadingWorkId;
      const response = await uploadDesignerFiles(workId, Array.from(files));
      
      // Robustly extract the work object from the response
      let updatedWork = response?.data || response;
      if (response?.status === true && response?.data) {
        updatedWork = response.data;
      }

      // Only update if we have a valid work object with an ID
      if (updatedWork && (updatedWork.id || updatedWork.tracking_no)) {
        setCalendarWorks(prev => prev.map(w => w.id === workId ? updatedWork : w));
      }
      
    } catch (err) {
      console.error('Failed to upload files:', err);
    } finally {
      setUploadingWorkId(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleStatusChange = async (workId: number, newStatus: string) => {
    try {
      const response = await updateDesignerStatus(workId, newStatus);
      if (response.status || response.data) {
        setWorkStatuses(prev => ({ ...prev, [workId]: newStatus }));
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { ...w, designer_status: newStatus } : w));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
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
        // Handle JSON strings like '["url1", "url2"]' or '[{"file_url": "..."}]'
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          const parsed = JSON.parse(trimmed);
          const array = Array.isArray(parsed) ? parsed : [parsed];
          return array.map(extractUrl).filter((item): item is string => item !== null);
        }
        // Handle comma-separated strings
        return trimmed.split(',').map(s => s.trim()).filter(Boolean);
      } catch (e) {
        // Fallback for single strings (URLs or paths)
        return [trimmed];
      }
    }
    return [];
  };

  const designerUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('graphics') || u.group_name?.toLowerCase().includes('creative')),
  [users]);

  const contentUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('content')),
  [users]);

  const parseIds = (data: any): number[] => {
    if (!data) return [];
    
    // Handle native arrays (of numbers or objects)
    if (Array.isArray(data)) {
      return data.map(item => (typeof item === 'object' && item !== null ? item.id : item))
                 .map(Number)
                 .filter(n => !isNaN(n));
    }

    try {
      // Handle JSON strings
      if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map(item => (typeof item === 'object' && item !== null ? item.id : item))
                       .map(Number)
                       .filter(n => !isNaN(n));
        }
      }
      
      // Handle comma-separated strings or single IDs
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
      
    if (names.length === 0) return type === 'designer' ? 'Assign Designer' : 'Assign Content';
    
    if (names.length > 2) {
      return `${names[0]}, ${names[1]} +${names.length - 2}`;
    }
    return names.join(', ');
  };

  const getFullAssignedNames = (assignedTo: string | null) => {
    const ids = parseIds(assignedTo);
    const names = ids
      .map(id => users.find(u => u.id === Number(id))?.name)
      .filter(Boolean);
    
    return names.length > 0 ? names.join(', ') : undefined;
  };

  // Filter works based on search term
  const filteredCalendarWorks = calendarWorks.filter(work => {
    // Filter by assignment for Content team members
    if (isContentWriter && user?.id && !isHead) {
      const assignedContentIds = parseIds(work.content_assigned_to);
      if (!assignedContentIds.includes(Number(user.id))) {
        return false;
      }
    }

    // Filter by assignment for Graphics team members
    if (isGraphics && user?.id && !isHead) {
      const assignedDesignerIds = parseIds(work.assigned_to);
      if (!assignedDesignerIds.includes(Number(user.id))) {
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Creative Worksheet</h1>
          <p className="text-[11px] text-slate-500 font-medium">View and manage your assigned creative works</p>
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

      {/* Calendar Works Table */}
      <div className="bg-white rounded-none shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Calendar Works...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1500px] border border-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {shouldShowSLno && (
                    <th className="px-4 py-3 w-12 text-left border border-slate-200">#</th>
                  )}
                  {shouldShowTrackingNo && (
                    <th className="px-4 py-3 w-28 border border-slate-200">Tracking No</th>
                  )}
                  {shouldShowDate && (
                    <th className="px-4 py-3 w-24 border border-slate-200">Date</th>
                  )}
                  {shouldShowSpecialDay && (
                    <th className="px-4 py-3 w-24 border border-slate-200">Special Day</th>
                  )}
                  {shouldShowClient && (
                    <th className="px-4 py-3 w-48 border border-slate-200">Client</th>
                  )}
                  {shouldShowContentDescription && (
                    <th className="px-4 py-3 min-w-[250px] border border-slate-200">Content Description</th>
                  )}
                  {shouldShowCreatives && (
                    <th className="px-4 py-3 w-32 border border-slate-200">Creatives</th>
                  )}
                  {shouldShowNotes && (
                    <th className="px-4 py-3 min-w-[200px] border border-slate-200">Notes</th>
                  )}
                  {shouldShowAssignDesigner && (
                    <th className="px-4 py-3 w-40 border border-slate-200">Assign Designer</th>
                  )}
                  {shouldShowAssignContent && (
                    <th className="px-4 py-3 w-40 border border-slate-200">Assign Content</th>
                  )}
                  {shouldShowDesignUpload && (
                    <th className="px-4 py-3 w-32 border border-slate-200">Design Upload</th>
                  )}
                  {shouldShowClientApproval && (
                    <th className="px-4 py-3 w-32 border border-slate-200">Client Approval</th>
                  )}
                  {shouldShowStatus && (
                    <th className="px-4 py-3 w-24 text-left border border-slate-200">Status</th>
                  )}
                  {shouldShowActions && (
                    <th className="px-4 py-3 w-24 text-left border border-slate-200">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      {shouldShowSLno && (
                        <td className="px-4 py-3 text-left align-top text-[10px] font-medium text-slate-400 border border-slate-200">{index + 1}</td>
                      )}
                      {shouldShowTrackingNo && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="text-[11px] font-bold text-slate-900">
                            {work.tracking_no || 'N/A'}
                          </div>
                        </td>
                      )}
                      {shouldShowDate && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="text-[11px] font-medium text-slate-900">
                            {work.date ? (() => {
                              const date = new Date(work.date);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            })() : 'No Date'}
                          </div>
                        </td>
                      )}
                      {shouldShowSpecialDay && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="flex items-start gap-2">
                            {work.is_special_day ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-none text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                                Special Day
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Regular</span>
                            )}
                          </div>
                        </td>
                      )}
                      {shouldShowClient && (
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
                      )}
                      {shouldShowContentDescription && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="text-[11px] text-slate-700">
                            {work.content_description || 'No description'}
                          </div>
                        </td>
                      )}
                      {shouldShowCreatives && (
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
                      )}
                      {shouldShowNotes && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="text-[11px] text-slate-700">
                            {work.notes || 'No notes'}
                          </div>
                        </td>
                      )}
                      {shouldShowAssignDesigner && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          {(() => {
                            const designerIds = parseIds(work.assigned_to);
                            const isAssigned = designerIds.length > 0;
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
                                    initialIds: designerIds,
                                    type: 'designer'
                                  });
                                }}
                              >
                              {getAssignedNames(work, 'designer')}
                              </Button>
                            );
                          })()}
                        </td>
                      )}
                      {shouldShowAssignContent && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          {(() => {
                            const contentIds = parseIds(work.content_assigned_to);
                            const isAssigned = contentIds.length > 0;
                            return (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className={`text-[10px] w-full justify-between transition-all ${isAssigned ? '!bg-orange-500 !text-white !border-orange-600 hover:!bg-orange-600' : ''}`}
                                title={getFullAssignedNames(work.content_assigned_to)}
                                onClick={() => {
                                if (!isHead) return;
                                  setAssignmentModal({
                                    isOpen: true,
                                    workId: work.id,
                                    initialIds: contentIds,
                                    type: 'content'
                                  });
                                }}
                              >
                                {getAssignedNames(work, 'content')}
                              </Button>
                            );
                          })()}
                        </td>
                      )}
                      {shouldShowDesignUpload && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <div className="flex flex-col items-start gap-2">
                            {(() => {
                              // Check both designer_files and designer_file (fallback for singular naming)
                              const files = parseFiles(work.designer_files || work.designer_file);
                              return files.length > 0 && (
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
                              );
                            })()}
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-[10px]"
                              onClick={() => {
                                setUploadingWorkId(work.id);
                                document.getElementById('designer-file-upload')?.click();
                              }}
                              isLoading={uploadingWorkId === work.id}
                            >
                              <Upload size={12} className="mr-1" /> Upload
                            </Button>
                          </div>
                        </td>
                      )}
                      {shouldShowClientApproval && (
                        <td className="px-4 py-3 align-top border border-slate-200">
                          <select
                            value={clientApprovedStatuses[work.id] || work.client_approved_status || 'pending'}
                            onChange={(e) => handleClientApprovedStatusChange(work.id, e.target.value)}
                            className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer transition-all w-full min-w-[100px] ${
                              (clientApprovedStatuses[work.id] || work.client_approved_status) === 'approved' ? 'bg-green-100 text-green-700' :
                              (clientApprovedStatuses[work.id] || work.client_approved_status) === 'not_approved' ? 'bg-red-100 text-red-700' :
                              (clientApprovedStatuses[work.id] || work.client_approved_status) === 'needed_edit' ? 'bg-orange-100 text-orange-700' :
                              (clientApprovedStatuses[work.id] || work.client_approved_status) === 'images_changed' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="not_approved">Not Approved</option>
                            <option value="needed_edit">Needed Edit</option>
                            <option value="images_changed">Images Changed</option>
                          </select>
                        </td>
                      )}
                      {shouldShowStatus && (
                        <td className="px-4 py-3 text-left align-top border border-slate-200">
                          <select
                            value={workStatuses[work.id] || work.designer_status || 'pending'}
                            onChange={(e) => handleStatusChange(work.id, e.target.value)}
                            className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer transition-all w-full min-w-[100px] ${
                              (workStatuses[work.id] || work.designer_status) === 'completed' ? 'bg-green-100 text-green-700' :
                              (workStatuses[work.id] || work.designer_status) === 'working_progress' ? 'bg-blue-100 text-blue-700' :
                              (workStatuses[work.id] || work.designer_status) === 'approval_pending' ? 'bg-purple-100 text-purple-700' :
                              'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="working_progress">In Progress</option>
                            <option value="approval_pending">Approval</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      )}
                      {shouldShowActions && (
                        <td className="px-4 py-3 text-left align-top border border-slate-200">
                          <div className="flex items-start justify-start gap-1">
                            {isContentWriter && !isHead ? (
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
                            ) : (
                              <>
                                <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-none transition-all">
                                  <Edit size={14} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-none transition-all">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={totalVisibleCols} className="px-6 py-20 text-center align-top border border-slate-200">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-none text-slate-300">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          No works found
                        </p>
                        <p className="text-[10px] text-slate-300 uppercase tracking-widest font-medium">
                          Check back later for new assignments
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      <input
        type="file"
        id="designer-file-upload"
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleFileChange}
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

export default WorksheetCreativePage;
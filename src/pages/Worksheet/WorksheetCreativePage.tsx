import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  Edit, Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { getCalendarWorks, assignCalendarWorkContent, assignDesignersToWork, updateCalendarWorkContentDetails } from '../../api/services/microService';
import { getUsersList } from '../../api/services/authService';
import AssignmentModal from './components/AssignmentModal';
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

  const isHead = currentUserPosition.toLowerCase().includes('head');
  const isContentWriter = currentUserGroup === 'Content Creator' || currentUserGroup === 'Content';

  // Conditional visibility based on user group
  const shouldShowTrackingNo = 
    isHead || (
    currentUserGroup !== 'Content Creator' && 
    currentUserGroup !== 'Content' && 
    currentUserGroup !== 'Graphics Department' && 
    currentUserGroup !== 'Creative Designers');
  const shouldShowDate = 
    isHead || (
    currentUserGroup !== 'Content Creator' && 
    currentUserGroup !== 'Content' && 
    currentUserGroup !== 'Graphics Department' && 
    currentUserGroup !== 'Creative Designers');
  const shouldShowAssignContent = 
    isHead || (
    currentUserGroup !== 'Graphics Department' && 
    currentUserGroup !== 'Creative Designers');
  const shouldShowAssignDesigner = isHead || (currentUserGroup !== 'Content Creator' && currentUserGroup !== 'Content');
  const shouldShowDesignUpload = isHead || (currentUserGroup !== 'Content Creator' && currentUserGroup !== 'Content');
  const shouldShowActions = 
    isHead || 
    isContentWriter || 
    (currentUserGroup !== 'Graphics Department' && 
     currentUserGroup !== 'Creative Designers');

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
    const isContentGroup = currentUserGroup === 'Content Creator' || currentUserGroup === 'Content';
    if (isContentGroup && user?.id && !isHead) {
      const assignedContentIds = parseIds(work.content_assigned_to);
      if (!assignedContentIds.includes(Number(user.id))) {
        return false;
      }
    }

    // Filter by assignment for Graphics team members
    const isGraphicsGroup = currentUserGroup === 'Graphics Department' || currentUserGroup === 'Creative Designers';
    if (isGraphicsGroup && user?.id && !isHead) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal"
          />
        </div>
      </div>

      {/* Calendar Works Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
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
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3 w-12 text-center">#</th>
                  {shouldShowTrackingNo && (
                    <th className="px-5 py-3">Tracking No</th>
                  )}
                  {shouldShowDate && (
                    <th className="px-5 py-3">Date</th>
                  )}
                  <th className="px-5 py-3">Special Day</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Content Description</th>
                  <th className="px-5 py-3">Creatives</th>
                  <th className="px-5 py-3">Notes</th>
                  {shouldShowAssignDesigner && (
                    <th className="px-5 py-3">Assign Designer</th>
                  )}
                  {shouldShowAssignContent && (
                    <th className="px-5 py-3">Assign Content</th>
                  )}
                  {shouldShowDesignUpload && (
                    <th className="px-5 py-3">Design Upload</th>
                  )}
                  <th className="px-5 py-3 text-center">Status</th>
                  {shouldShowActions && (
                    <th className="px-5 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{index + 1}</td>
                      {shouldShowTrackingNo && (
                        <td className="px-5 py-3">
                          <div className="text-[11px] font-bold text-slate-900">
                            {work.tracking_no || 'N/A'}
                          </div>
                        </td>
                      )}
                      {shouldShowDate && (
                        <td className="px-5 py-3">
                          <div className="text-[11px] font-medium text-slate-900">
                            {work.date ? (() => {
                              const date = new Date(work.date);
                              return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
                            })() : 'No Date'}
                          </div>
                        </td>
                      )}
                      <td className="px-5 py-3">
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
                      <td className="px-5 py-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-37.5">
                            {work.client?.company_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1.5 truncate max-w-37.5">
                            {work.client?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[11px] text-slate-700 max-w-50 truncate">
                          {work.content_description || 'No description'}
                        </div>
                      </td>
                      <td className="px-5 py-3">
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
                      <td className="px-5 py-3">
                        <div className="text-[11px] text-slate-700 max-w-37.5 truncate">
                          {work.notes || 'No notes'}
                        </div>
                      </td>
                      {shouldShowAssignDesigner && (
                        <td className="px-5 py-3">
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
                        <td className="px-5 py-3">
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
                        <td className="px-5 py-3">
                          <Button variant="secondary" size="sm" className="text-[10px]">
                            <Upload size={12} className="mr-1" /> Upload
                          </Button>
                        </td>
                      )}
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-medium ${
                          workStatuses[work.id] === 'completed' ? 'bg-green-100 text-green-800' :
                          workStatuses[work.id] === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {workStatuses[work.id] || 'pending'}
                        </span>
                      </td>
                      {shouldShowActions && (
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isContentWriter && !isHead ? (
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
                            ) : (
                              <>
                                <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                  <Edit size={14} />
                                </button>
                                <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                    <td colSpan={7 + (shouldShowTrackingNo ? 1 : 0) + (shouldShowDate ? 1 : 0) + (shouldShowAssignDesigner ? 1 : 0) + (shouldShowAssignContent ? 1 : 0) + (shouldShowDesignUpload ? 1 : 0) + (shouldShowActions ? 1 : 0)} className="px-6 py-20 text-center align-top">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-slate-50 rounded-full text-slate-300">
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
    </div>
  );
};

export default WorksheetCreativePage;
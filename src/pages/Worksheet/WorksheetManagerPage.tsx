import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search,
  AlertTriangle,
  Image as ImageIcon,
  LayoutGrid, List, Calendar as CalendarIcon, FileText, Upload, Loader2,
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
  is_head_approved?: string | null;
  head_comment?: string | null;
}

const WorksheetManagerPage = () => {
  const { user, roleName, group, position, isAuthenticated } = useAppSelector((state) => state.auth);
  const token = localStorage.getItem('token');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserPosition, setCurrentUserPosition] = useState<string>('');
  const [currentUserGroup, setCurrentUserGroup] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [updatingWorkId, setUpdatingWorkId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        // You can add a token validation API call here if needed
        // For now, we'll just check if token exists and user is authenticated
        setTokenValid(isAuthenticated && !!user);
      } catch (error) {
        console.error('Token validation failed:', error);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token, isAuthenticated, user]);

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

  // Get unique clients for dropdown
  const uniqueClients = useMemo(() => {
    const clients = calendarWorks
      .map(work => work.client)
      .filter((client, index, self) => 
        client && self.findIndex(c => c.id === client.id) === index
      )
      .sort((a, b) => a.company_name.localeCompare(b.company_name));
    return clients;
  }, [calendarWorks]);

  // Check if user can approve
  const canApprove = useMemo(() => {
    if (!currentUserPosition) return false;
    const positionKey = currentUserPosition.toLowerCase().trim();
    const permissions = (POSITION_PERMISSIONS as any)[positionKey] || (POSITION_PERMISSIONS as any)[currentUserPosition];
    const hasPermission = permissions?.canApprove || false;

    // Staff role should not have approval permissions
    if (roleName === 'staff') {
      return false;
    }

    // Special case: allow manager role with head position
    if (roleName === 'manager' && currentUserPosition === 'head') {
      return true;
    }

    return hasPermission;
  }, [currentUserPosition, roleName]);

  // Determine table view based on user role/department/position
  const tableViewConfig = useMemo(() => {
    const groupLower = currentUserGroup.toLowerCase().trim();
    const positionLower = currentUserPosition.toLowerCase().trim();
    const roleLower = roleName?.toLowerCase().trim() || '';

    // Default view for managers
    let config = {
      showSLno: true,
      showTracking: true,
      showDate: true,
      showType: true,
      showClient: true,
      showContentDescription: true,
      showCreative: true,
      showDesigner: true,
      showWriter: true,
      showDesign: true,
      showDesStatus: true,
      showClientApproval: true,
      showHeadApproval: true,
      showClientFilter: true,
      title: 'Manager Approval',
      subtitle: 'Review and approve creative works'
    };

    // Customize based on department/role/position
    if (groupLower.includes('creative')) {
      // Creative department manager
      config = {
        ...config,
        showDesign: true,
        showDesStatus: true,
        showWriter: false, // Hide writer column for creative managers
        title: 'Creative Manager Approval',
        subtitle: 'Review and approve design works'
      };
    } else if (groupLower.includes('graphics')) {
      // Graphics department manager - show full manager view
      config = {
        ...config,
        title: 'Graphics Manager Approval',
        subtitle: 'Review and approve graphics works'
      };
    } else if (groupLower.includes('content')) {
      // Content department manager
      config = {
        ...config,
        showWriter: true,
        showDesign: false, // Hide design column for content managers
        showDesStatus: false,
        title: 'Content Manager Approval',
        subtitle: 'Review and approve content works'
      };
    } else if (positionLower.includes('head') && !groupLower.includes('creative') && !groupLower.includes('content')) {
      // General head/manager
      config = {
        ...config,
        title: 'Department Head Approval',
        subtitle: 'Oversee all department approvals'
      };
    }

    return config;
  }, [currentUserGroup, currentUserPosition, roleName]);

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
        // Set current user position and group
        const currentUser = user?.id ? usersData.find((u: User) => u.id === user.id) : null;
        setCurrentUserPosition(currentUser?.position_name || position || '');
        setCurrentUserGroup(currentUser?.group_name || group || '');
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Fallback to auth state values
        setCurrentUserPosition(position || '');
        setCurrentUserGroup(group || '');
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
        // Map UI string to API string
        const apiStatus = newStatus === 'approved' ? 'Approved' : newStatus === 'edit_needed' ? 'Re-Edit' : null;
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

  const handleCommentChange = async (workId: number, comments: string, newStatus?: string) => {
    try {
      setUpdatingWorkId(workId);
      const work = calendarWorks.find(w => w.id === workId);
      
      // Determine final status
      let finalStatus = work?.is_head_approved === undefined ? null : work.is_head_approved;
      if (newStatus) {
        finalStatus = newStatus === 'approved' ? 'Approved' : newStatus === 'edit_needed' ? 'Re-Edit' : null;
      }

      await updateHeadApproval(workId, finalStatus, comments);
      
      // Manual merge to keep row data intact
      setCalendarWorks(prev => prev.map(w => w.id === workId ? { 
        ...w, 
        head_comment: comments,
        is_head_approved: finalStatus
      } : w));
    } catch (err) {
      console.error('Failed to update comments and status:', err);
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

  const renderInitialBadge = (work: CalendarWork, type: 'designer' | 'content') => {
    const assignedTo = type === 'designer' ? work.assigned_to : work.content_assigned_to;
    const assignedNames = type === 'designer' ? work.assigned_to_names : work.content_assigned_to_names;
    const ids = parseIds(assignedTo);

    if (ids.length === 0) return <span className="text-[8px] text-slate-300 italic">None</span>;

    const names = ids.map(id => {
      if (assignedNames && assignedNames[id.toString()]) return assignedNames[id.toString()];
      return users.find(u => u.id === Number(id))?.name;
    }).filter(Boolean);

    if (names.length === 0) return <span className="text-[8px] text-slate-300 italic">None</span>;

    const colors = [
      'bg-slate-600', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 
      'bg-slate-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500'
    ];

    return (
      <div className="flex -space-x-1.5 items-center justify-center hover:space-x-0.5 transition-all duration-300 group/badges">
        {names.map((name, idx) => {
          const initials = name!.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          // Simple hash-based color selection
          const colorIndex = (name!.charCodeAt(0) + name!.length) % colors.length;
          return (
            <div 
              key={idx}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-white shadow-sm ${colors[colorIndex]} transition-transform hover:scale-110 hover:z-10`}
              title={name}
            >
              {initials}
            </div>
          );
        })}
      </div>
    );
  };

  // Filter works based on search term and client
  const filteredCalendarWorks = calendarWorks.filter(work => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      work.client?.company_name?.toLowerCase().includes(searchLower) ||
      work.client?.name?.toLowerCase().includes(searchLower) ||
      work.content_description?.toLowerCase().includes(searchLower) ||
      work.notes?.toLowerCase().includes(searchLower) ||
      work.tracking_no?.toLowerCase().includes(searchLower)
    );
    const matchesClient = selectedClient === '' || work.client?.id.toString() === selectedClient;
    return matchesSearch && matchesClient;
  });

  // Check if user is authenticated and has valid token
  if (!isAuthenticated || !token || !user || tokenValid === false) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-sans">
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <AlertTriangle size={48} className="text-orange-500" />
          <h1 className="text-xl font-bold text-slate-900">Authentication Required</h1>
          <p className="text-slate-500 text-center">Please log in to access the manager worksheet.</p>
          <p className="text-[11px] text-slate-400 text-center">You need to be authenticated with a valid token to view this page.</p>
        </div>
      </div>
    );
  }

  // Show loading while validating token
  if (tokenValid === null) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 font-sans">
        <div className="flex flex-col items-center justify-center p-20 gap-3">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Validating Authentication...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{tableViewConfig.title}</h1>
          <p className="text-[11px] text-slate-500 font-medium">{tableViewConfig.subtitle}</p>
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
          {tableViewConfig.showClientFilter && (
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-normal bg-white min-w-[200px]"
              >
                <option value="">All Clients</option>
                {uniqueClients.map(client => (
                  <option key={client.id} value={client.id.toString()}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead className="bg-[#fcfcfd] border-b border-slate-200">
                <tr className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-3 py-3 w-24">Tracking</th>
                  <th className="px-3 py-3 w-20">Date</th>
                  <th className="px-3 py-3 w-20 text-center">Type</th>
                  {tableViewConfig.showClientFilter && <th className="px-3 py-3 w-48">Client</th>}
                  <th className="px-3 py-3 min-w-[200px]">Content Description</th>
                  <th className="px-3 py-3 w-24">Creative</th>
                  {tableViewConfig.showDesigner && <th className="px-3 py-3 w-28 text-center">Designer</th>}
                  {tableViewConfig.showWriter && <th className="px-3 py-3 w-28 text-center">Writer</th>}
                  {tableViewConfig.showDesign && <th className="px-3 py-3 w-28">Design</th>}
                  {tableViewConfig.showDesStatus && <th className="px-3 py-3 w-24 text-center">Des Status</th>}
                  {tableViewConfig.showClientApproval && <th className="px-3 py-3 w-24 text-center">Client Appr</th>}
                  <th className="px-3 py-3 w-32 text-center">Head Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-[#f9fafb] transition-colors group">
                      <td className="px-2 py-3 text-center align-middle text-[9px] font-medium text-slate-400">{index + 1}</td>
                      <td className="px-3 py-3 align-middle">
                        <div className="text-[10px] font-bold text-blue-600 tracking-tight">
                          {work.tracking_no || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle whitespace-nowrap">
                        <div className="text-[10px] text-slate-600">
                          {work.date ? (() => {
                            const date = new Date(work.date);
                            return isNaN(date.getTime()) ? 'Invalid' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                          })() : 'No Date'}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-middle text-center">
                        {work.is_special_day ? (
                          <span className="text-[8px] font-bold text-purple-600 uppercase bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                            Spec
                          </span>
                        ) : (
                          <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">Norm</span>
                        )}
                      </td>
                      {tableViewConfig.showClientFilter && (
                        <td className="px-3 py-3 align-middle">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-900 leading-tight">
                              {work.client?.company_name || 'N/A'}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5 truncate uppercase tracking-tighter font-semibold">
                              {work.client?.name || 'N/A'}
                            </p>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-3 align-middle">
                        <div
                          className={`text-[10.5px] text-slate-600 rich-text-content leading-relaxed ${expandedRows[work.id] ? 'expanded' : ''}`}
                          dangerouslySetInnerHTML={{ __html: work.content_description || 'No description' }}
                        />
                        {work.content_description && work.content_description.length > 50 && (
                          <button
                            onClick={() => toggleRowExpansion(work.id)}
                            className="text-[8.5px] text-blue-500 hover:text-blue-700 font-bold mt-1 uppercase"
                          >
                            {expandedRows[work.id] ? '[-] Less' : '[+] More'}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-col gap-0.5">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 2).map((creative, index) => (
                              <div key={index} className="text-[9.5px] text-slate-600 whitespace-nowrap font-medium">
                                <span className="font-bold text-slate-400 mr-1">{creative.nos}x</span>
                                {creative.name.length > 10 ? creative.name.substring(0, 9) + '.' : creative.name}
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
                      {tableViewConfig.showDesigner && (
                        <td className="px-3 py-3 align-middle text-center">
                          <div className="text-[9px] text-slate-600 font-medium leading-tight">
                            {getAssignedNames(work, 'designer')}
                          </div>
                        </td>
                      )}
                      {tableViewConfig.showWriter && (
                        <td className="px-3 py-3 align-middle text-center">
                          <div className="text-[9px] text-slate-600 font-medium leading-tight">
                            {getAssignedNames(work, 'content')}
                          </div>
                        </td>
                      )}
                      {tableViewConfig.showDesign && (
                        <td className="px-3 py-3 align-middle">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(() => {
                              const files = parseFiles(work.designer_files || work.designer_file);
                              return files.length > 0 ? (
                                files.slice(0, 2).map((file, idx) => {
                                  const imageUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setLightboxImage(imageUrl)}
                                      className="block relative hover:scale-105 transition-transform"
                                    >
                                      <img
                                        src={imageUrl}
                                        alt="Design"
                                        className="h-9 w-9 object-cover rounded shadow-sm border border-slate-200 cursor-zoom-in"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://placehold.co/36x36?text=Err';
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
                              <span className="text-[8px] text-slate-400 self-center font-bold">+{parseFiles(work.designer_files || work.designer_file).length - 2}</span>
                            )}
                          </div>
                        </td>
                      )}
                      {tableViewConfig.showDesStatus && (
                        <td className="px-3 py-3 align-middle">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all ring-1 ring-inset ${
                              work.designer_status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                              work.designer_status === 'working_progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                              work.designer_status === 'approval_pending' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' :
                              'bg-slate-50 text-slate-600 ring-slate-400/20'
                            }`}>
                              <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                              work.designer_status === 'completed' ? 'bg-emerald-500' :
                              work.designer_status === 'working_progress' ? 'bg-blue-500' :
                              work.designer_status === 'approval_pending' ? 'bg-indigo-500' :
                              'bg-slate-500'
                              }`} />
                              {work.designer_status === 'completed' ? 'Done' :
                               work.designer_status === 'working_progress' ? 'Work' :
                               work.designer_status === 'approval_pending' ? 'Rev' : 'Pend'}
                            </span>
                          </div>
                        </td>
                      )}
                      {tableViewConfig.showClientApproval && (
                        <td className="px-3 py-3 align-middle">
                          <div className="flex justify-center">
                            <select
                              value={work.client_approved_status || 'pending'}
                              onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                              disabled={updatingWorkId === work.id}
                              className={`text-[8.5px] font-bold px-1.5 py-1 rounded border outline-none cursor-pointer w-full transition-all text-center appearance-none bg-white hover:border-slate-300 focus:border-blue-400 shadow-sm ${
                                work.client_approved_status === 'approved' ? 'text-emerald-700 border-emerald-100 bg-emerald-50' :
                                work.client_approved_status === 'not_approved' ? 'text-rose-700 border-rose-100 bg-rose-50' :
                                work.client_approved_status === 'needed_edit' ? 'text-amber-700 border-amber-100 bg-amber-50' :
                                work.client_approved_status === 'images_changed' ? 'text-cyan-700 border-cyan-100 bg-cyan-50' :
                                'text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="pending">PENDING</option>
                              <option value="approved">APPR</option>
                              <option value="not_approved">REJECT</option>
                              <option value="needed_edit">EDIT</option>
                              <option value="images_changed">IMG</option>
                            </select>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-3 align-middle">
                        <div className="flex flex-col gap-1 items-center justify-center min-h-[30px]">
                          <button
                            onClick={() => openCommentModal(work)}
                            disabled={updatingWorkId === work.id}
                            className={`text-[9px] font-bold py-1.5 rounded border outline-none cursor-pointer w-full transition-all flex items-center justify-center gap-2 group/btn ${
                              work.is_head_approved === 'Approved' ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50' :
                              work.is_head_approved === 'Re-Edit' ? 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50' :
                              'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {updatingWorkId === work.id ? (
                              <Loader2 size={12} className="animate-spin text-blue-600" />
                            ) : (
                               <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  work.is_head_approved === 'Approved' ? 'bg-emerald-500' : 
                                  work.is_head_approved === 'Re-Edit' ? 'bg-orange-500' : 
                                  'bg-slate-400'
                                }`} />
                                <span className="uppercase tracking-tighter">
                                  {work.is_head_approved === 'Approved' ? 'Approved' : 
                                   work.is_head_approved === 'Re-Edit' ? 'Re-Edit' : 
                                   'Review'}
                                </span>
                               </div>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={
                      7 + // Always visible: #, Tracking, Date, Type, Content Description, Creative, Head Approval
                      (tableViewConfig.showClientFilter ? 1 : 0) +
                      (tableViewConfig.showDesigner ? 1 : 0) +
                      (tableViewConfig.showWriter ? 1 : 0) +
                      (tableViewConfig.showDesign ? 1 : 0) +
                      (tableViewConfig.showDesStatus ? 1 : 0) +
                      (tableViewConfig.showClientApproval ? 1 : 0)
                    } className="px-6 py-24 text-center align-middle">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full text-slate-200 ring-8 ring-slate-50/50">
                          <Clipboard size={24} />
                        </div>
                        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                          Queue Empty
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
                          All calendar works have been processed
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
                <div key={work.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col group">
                  {/* Header Section */}
                  <div className="p-4 border-b border-slate-100 bg-[#fcfcfd]">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100/50">
                        {work.tracking_no || 'UNT-000'}
                      </span>
                      <div className="flex items-center gap-2">
                        {work.is_special_day && (
                          <span className="text-[9px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">
                            SPECIAL
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-slate-400">
                          <CalendarIcon size={12} />
                          <span className="text-[10px] font-medium">
                            {work.date ? new Date(work.date).toLocaleDateString('en-GB') : 'No Date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{work.client?.company_name || 'N/A'}</h3>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">{work.client?.name || 'N/A'}</p>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex-1 space-y-4">
                    {/* Content Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        Content Description
                      </label>
                      <div
                        className={`text-[11px] text-slate-600 rich-text-content leading-relaxed ${expandedRows[work.id] ? 'expanded' : ''}`}
                        dangerouslySetInnerHTML={{ __html: work.content_description || 'No description provided' }}
                      />
                      {work.content_description && work.content_description.length > 100 && (
                        <button
                          onClick={() => toggleRowExpansion(work.id)}
                          className="text-[10px] text-blue-600 font-bold uppercase hover:underline mt-1"
                        >
                          {expandedRows[work.id] ? '[-] Less' : '[+] More'}
                        </button>
                      )}
                    </div>

                    {/* Creatives and Assignments */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creatives</label>
                        <div className="flex flex-wrap gap-1">
                          {work.creatives && work.creatives.length > 0 ? (
                            work.creatives.slice(0, 3).map((creative, idx) => (
                              <span key={idx} className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {creative.nos}x {creative.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">No items</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned</label>
                        <div className="flex items-center gap-2">
                           {renderInitialBadge(work, 'designer')}
                           <span className="text-slate-300 font-light">|</span>
                           {renderInitialBadge(work, 'content')}
                        </div>
                      </div>
                    </div>

                    {/* Design Files */}
                    <div className="space-y-2 pt-2 border-t border-slate-50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designs</label>
                      <div className="flex flex-wrap gap-2">
                        {parseFiles(work.designer_files || work.designer_file).map((file, idx) => {
                          const imageUrl = file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`;
                          return (
                            <img
                              key={idx}
                              src={imageUrl}
                              className="h-14 w-14 object-cover border border-slate-200 cursor-zoom-in hover:border-blue-400 transition-all rounded-lg shadow-sm"
                              onClick={() => setLightboxImage(imageUrl)}
                            />
                          );
                        })}
                        {parseFiles(work.designer_files || work.designer_file).length === 0 && (
                          <div className="w-full py-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-400 gap-2">
                            <ImageIcon size={12} /> No designs uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Approval Section */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Client Status</p>
                        <select
                          value={work.client_approved_status || 'pending'}
                          onChange={(e) => handleApprovalChange(work.id, e.target.value)}
                          disabled={updatingWorkId === work.id}
                          className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer w-full transition-all appearance-none text-center shadow-sm bg-white hover:border-slate-300 ${
                            work.client_approved_status === 'approved' ? 'text-emerald-700 border-emerald-100' :
                            work.client_approved_status === 'not_approved' ? 'text-rose-700 border-rose-100' :
                            work.client_approved_status === 'needed_edit' ? 'text-amber-700 border-amber-100' :
                            'text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="approved">APPROVED</option>
                          <option value="not_approved">REJECTED</option>
                          <option value="needed_edit">EDIT NEEDED</option>
                        </select>
                      </div>
                      <div className="flex-1 space-y-1">
                         <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center">Head Approval</p>
                         <button
                           onClick={() => openCommentModal(work)}
                           className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border outline-none cursor-pointer w-full transition-all text-center shadow-sm flex items-center justify-center gap-2 bg-white ${
                            work.is_head_approved === 'Approved' ? 'text-emerald-700 border-emerald-100 hover:bg-emerald-50' :
                            work.is_head_approved === 'Re-Edit' ? 'text-orange-700 border-orange-100 hover:bg-orange-50' :
                            'text-slate-600 border-slate-200 hover:bg-slate-50'
                           }`}
                         >
                            <span className={`w-2 h-2 rounded-full ${
                              work.is_head_approved === 'Approved' ? 'bg-emerald-500' : 
                              work.is_head_approved === 'Re-Edit' ? 'bg-orange-500' : 
                              'bg-slate-400'
                            }`} />
                            {work.is_head_approved === 'Approved' ? 'APPROVED' : 
                             work.is_head_approved === 'Re-Edit' ? 'RE-EDIT' : 
                             'REVIEW'}
                         </button>
                      </div>
                    </div>

                    {/* Loading State */}
                    {updatingWorkId === work.id && (
                      <div className="flex items-center justify-center gap-2 text-[10px] text-blue-600 font-bold bg-blue-50 py-2 rounded-lg border border-blue-100 animate-pulse">
                        <Loader2 size={12} className="animate-spin" /> UPDATING...
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white border border-slate-200 rounded-xl text-center">
                <p className="text-slate-400 text-sm font-medium">No results found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={() => setCommentModal(prev => ({ ...prev, isOpen: false }))}
        onSave={(comments, status) => {
          if (commentModal.work) {
            handleCommentChange(commentModal.work.id, comments, status);
          }
        }}
        initialComments={commentModal.work?.head_comment || ''}
        initialStatus={
          commentModal.work?.is_head_approved === 'Approved' ? 'approved' : 
          commentModal.work?.is_head_approved === 'Re-Edit' ? 'edit_needed' : 
          'pending'
        }
        showStatusSelector={true}
        title="Manager Board Approval"
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

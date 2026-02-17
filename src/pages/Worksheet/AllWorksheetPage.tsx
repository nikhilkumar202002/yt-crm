import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../store/store';
import {
  Clipboard, Search, Upload, Edit, Trash2, Plus
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { 
  getCalendarWorks, 
  assignCalendarWorkContent, 
  assignDesignersToWork, 
  updateClientApprovedStatus,
  uploadDesignerFiles,
  updateCalendarWorkStatus,
  updateDesignerStatus,
  updateCalendarWorkContentDetails
} from '../../api/services/microService';
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

const AllWorksheetPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarWorks, setCalendarWorks] = useState<CalendarWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contentStatuses, setContentStatuses] = useState<{ [key: number]: string }>({});
  const [designerStatuses, setDesignerStatuses] = useState<{ [key: number]: string }>({});
  const [clientApprovedStatuses, setClientApprovedStatuses] = useState<{ [key: number]: string }>({});
  const [uploadingWorkId, setUploadingWorkId] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Modal states
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [worksRes, usersRes] = await Promise.all([
          getCalendarWorks(),
          getUsersList()
        ]);
        setCalendarWorks(worksRes.data?.data || worksRes.data || []);
        setUsers(usersRes.data?.data || usersRes.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      let updatedWork = response?.data || response;
      if (response?.status === true && response?.data) updatedWork = response.data;
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

  const handleContentStatusChange = async (workId: number, newStatus: string) => {
    try {
      const response = await updateCalendarWorkStatus(workId, newStatus);
      if (response.status || response.data) {
        setContentStatuses(prev => ({ ...prev, [workId]: newStatus }));
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { ...w, status: newStatus } : w));
      }
    } catch (err) {
      console.error('Failed to update content status:', err);
    }
  };

  const handleDesignerStatusChange = async (workId: number, newStatus: string) => {
    try {
      const response = await updateDesignerStatus(workId, newStatus);
      if (response.status || response.data) {
        setDesignerStatuses(prev => ({ ...prev, [workId]: newStatus }));
        setCalendarWorks(prev => prev.map(w => w.id === workId ? { ...w, designer_status: newStatus } : w));
      }
    } catch (err) {
      console.error('Failed to update designer status:', err);
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

  const designerUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('graphics') || u.group_name?.toLowerCase().includes('creative')),
  [users]);

  const contentUsers = useMemo(() => 
    users.filter(u => u.group_name?.toLowerCase().includes('content')),
  [users]);

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

  const parseFiles = (data: any): string[] => {
    if (!data) return [];
    const extractUrl = (item: any): string | null => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && item.file_url) return item.file_url;
      return null;
    };
    if (Array.isArray(data)) return data.map(extractUrl).filter((item): item is string => item !== null);
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Worksheet</h1>
          <p className="text-[11px] text-slate-500 font-medium">View and manage all calendar works</p>
        </div>
        <Button variant="primary" size="sm" className="w-full sm:w-auto shadow-lg shadow-blue-900/10">
          <Plus size={14} /> Add Work
        </Button>
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

      <div className="bg-white rounded-none shadow-sm border border-slate-200 overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-none" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Loading Data...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-3">
            <p className="text-red-600 mb-2 text-sm">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1800px] border border-slate-200">
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
                  <th className="px-4 py-3 w-24 text-left border border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCalendarWorks.length > 0 ? (
                  filteredCalendarWorks.map((work, index) => (
                    <tr key={work.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3 text-left align-top text-[10px] font-medium text-slate-400 border border-slate-200">{index + 1}</td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] font-bold text-slate-900">{work.tracking_no || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] font-medium text-slate-900">
                          {work.date ? new Date(work.date).toLocaleDateString() : 'No Date'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        {work.is_special_day ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-none text-[9px] font-bold bg-purple-600 text-white uppercase tracking-wider">Special Day</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Regular</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-37.5">{work.client?.company_name || 'N/A'}</p>
                          <p className="text-[9px] text-slate-500 mt-1.5 truncate max-w-37.5">{work.client?.name || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className={`text-[11px] text-slate-700 rich-text-content ${expandedRows[work.id] ? 'expanded' : ''}`} dangerouslySetInnerHTML={{ __html: work.content_description || 'No description' }} />
                        {work.content_description && work.content_description.length > 60 && (
                          <button onClick={() => toggleRowExpansion(work.id)} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold mt-1 uppercase tracking-tighter">
                            {expandedRows[work.id] ? 'Show Less' : 'Read More'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="space-y-1">
                          {work.creatives?.slice(0, 2).map((creative, idx) => (
                            <div key={idx} className="text-[10px] text-slate-600">{creative.name} ({creative.nos})</div>
                          )) || <span className="text-[10px] text-slate-400">No creatives</span>}
                          {work.creatives && work.creatives.length > 2 && <span className="text-[9px] text-slate-400">+{work.creatives.length - 2} more</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="text-[11px] text-slate-700">{work.notes || 'No notes'}</div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <Button variant="secondary" size="sm" className={`text-[10px] w-full justify-between transition-all ${parseIds(work.assigned_to).length > 0 ? '!bg-orange-500 !text-white !border-orange-600' : ''}`} onClick={() => setAssignmentModal({ isOpen: true, workId: work.id, initialIds: parseIds(work.assigned_to), type: 'designer' })}>
                          {getAssignedNames(work, 'designer')}
                        </Button>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <Button variant="secondary" size="sm" className={`text-[10px] w-full justify-between transition-all ${parseIds(work.content_assigned_to).length > 0 ? '!bg-blue-500 !text-white !border-blue-600 hover:!bg-blue-600' : ''}`} onClick={() => setAssignmentModal({ isOpen: true, workId: work.id, initialIds: parseIds(work.content_assigned_to), type: 'content' })}>
                          {getAssignedNames(work, 'content')}
                        </Button>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <div className="flex flex-wrap gap-2">
                          {parseFiles(work.designer_files || work.designer_file).map((file, idx) => (
                            <img key={idx} src={file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`} alt="Design" className="h-10 w-10 object-cover cursor-zoom-in border border-slate-200" onClick={() => setLightboxImage(file.startsWith('http') ? file : `${import.meta.env.VITE_API_BASE_URL || ''}/${file.replace(/^\//, '')}`)} />
                          ))}
                          <Button variant="secondary" size="sm" className="text-[10px] p-1" onClick={() => { setUploadingWorkId(work.id); document.getElementById('admin-file-upload')?.click(); }}>
                            <Upload size={12} />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <div className="flex flex-col gap-2">
                          <select value={contentStatuses[work.id] || work.status || 'pending'} onChange={(e) => handleContentStatusChange(work.id, e.target.value)} className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer text-white ${ (contentStatuses[work.id] || work.status) === 'completed' ? 'bg-green-600' : 'bg-slate-500' }`}>
                            <option value="pending">Content: Pending</option>
                            <option value="working_progress">Content: In Progress</option>
                            <option value="completed">Content: Completed</option>
                          </select>
                          <select value={designerStatuses[work.id] || work.designer_status || 'pending'} onChange={(e) => handleDesignerStatusChange(work.id, e.target.value)} className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer text-white ${ (designerStatuses[work.id] || work.designer_status) === 'completed' ? 'bg-green-600' : 'bg-slate-500' }`}>
                            <option value="pending">Designer: Pending</option>
                            <option value="working_progress">Designer: In Progress</option>
                            <option value="completed">Designer: Completed</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border border-slate-200">
                        <select value={clientApprovedStatuses[work.id] || work.client_approved_status || 'pending'} onChange={(e) => handleClientApprovedStatusChange(work.id, e.target.value)} className={`text-[9px] font-bold px-2 py-1 rounded-none border-none outline-none cursor-pointer w-full text-white ${ (clientApprovedStatuses[work.id] || work.client_approved_status) === 'approved' ? 'bg-green-600' : 'bg-slate-500' }`}>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="not_approved">Not Approved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-left align-top border border-slate-200">
                        <div className="flex gap-1">
                          <button onClick={() => setEditContentModal({ isOpen: true, workId: work.id, description: work.content_description || '' })} className="p-2 text-blue-500 hover:bg-blue-50"><Edit size={14} /></button>
                          <button className="p-2 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={14} className="px-6 py-20 text-center border border-slate-200">No works found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignmentModal isOpen={assignmentModal.isOpen} onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))} onAssign={(userIds) => assignmentModal.workId && (assignmentModal.type === 'designer' ? handleAssignDesigner(assignmentModal.workId, userIds) : handleAssignContent(assignmentModal.workId, userIds))} users={assignmentModal.type === 'designer' ? designerUsers : contentUsers} initialSelectedIds={assignmentModal.initialIds} title={assignmentModal.type === 'designer' ? "Assign Designers" : "Assign Content Writers"} />
      <EditContentModal isOpen={editContentModal.isOpen} onClose={() => setEditContentModal(prev => ({ ...prev, isOpen: false }))} onSave={(desc, file) => editContentModal.workId && handleUpdateContent(editContentModal.workId, desc, file)} initialDescription={editContentModal.description} />
      <input type="file" id="admin-file-upload" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
      {lightboxImage && <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
    </div>
  );
};

export default AllWorksheetPage
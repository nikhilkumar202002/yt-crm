import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, UserPlus, Download, Clock, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, UserCheck, ChevronDown, User, Mail, Phone, MessageSquare 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LeadTableRow } from './LeadTableRow';
import { PipelineMetric } from './PipelineMetric';
import { FileImportModal } from './FileImportModal';
import { LeadStatusBadge } from './LeadStatusBadge';
import { AssignLeadsModal } from './components/AssignLeadsModal';
import { LeadDescriptionModal } from './components/LeadDescriptionModal';
import { AddLeadModal } from './components/AddLeadModal';
import { getLeads, uploadLeads, deleteLead, getAssignedLeads, updateLeadStatus, updateLeadComment, getServices, getSubServices, updateLeadServices, createLead } from '../../api/services/microService';
import { useAppSelector } from '../../store/store';
import { resolvePermissions } from '../../config/permissionResolver';
import { useLocation } from 'react-router-dom';

const LeadsPage = () => {
  const { permissions: userPermissions, user, roleName, position, group, designation_name } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isAssignedView = location.pathname === '/leads/assigned';
  
  // Use permissions from state or resolve from user data
  const permissions = userPermissions || resolvePermissions({
    role: roleName || 'staff',
    position: position || '1',
    group: group || undefined,
    designation_name: designation_name || undefined,
  });
  
  const canViewAllLeads = permissions.viewAllLeads || false;
  const canViewAssignedLeads = permissions.viewAssignedLeads || false;
  const canAssignLeads = permissions.assignLeads || false;
  const isAdmin = roleName?.toUpperCase() === 'ADMIN';
  const isAdminOrHead = ['ADMIN', 'DM HEAD'].includes(roleName?.toUpperCase() || '');
  const isAllLeadsView = canViewAllLeads && !isAssignedView;
  const [leads, setLeads] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>(''); 

  const [commentModal, setCommentModal] = useState({
    isOpen: false, 
    id: null as number | null, 
    text: '', 
    requirements: [] as string[], 
    serviceIds: [] as number[], 
    subServiceIds: [] as number[], 
    otherService: ''
  });

  const fetchData = useCallback(async (page: number, serviceFilter: string = '') => {
    try {
      setLoading(true);
      if (isAllLeadsView) {
        const result = await getLeads(page);
        const leadArray = result?.data?.data || [];
        setLeads(leadArray);
        setPagination(result?.data);
        setCurrentPage(result?.data?.current_page || 1);
      } else {
        // Fetch assigned leads
        const [leadsRes, servicesRes, subServicesRes] = await Promise.all([
          getAssignedLeads(page, serviceFilter, isAdmin ? undefined : user?.id),
          getServices(1),
          getSubServices(1)
        ]);
        setAssignments(leadsRes?.data?.data || []);
        setAvailableServices(servicesRes?.data?.data || []);
        setPagination(leadsRes?.data);
        setCurrentPage(leadsRes?.data?.current_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (isAllLeadsView) {
        setLeads([]);
      } else {
        setAssignments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAllLeadsView, isAdmin, user?.id]);

  useEffect(() => {
    fetchData(currentPage, selectedService);
  }, [currentPage, selectedService, fetchData]);

  const handleImport = async (file: File) => {
    if (!isAllLeadsView) return; // Only allow import in all leads view
    try {
      setIsUploading(true);
      await uploadLeads(file);
      setCurrentPage(1); // Reset to page 1 after successful upload
      fetchData(1);
    } catch (error) {
      alert('Upload failed. Check file format.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isAllLeadsView) return; // Only allow delete in all leads view
    if (window.confirm('Remove this lead?')) {
      try {
        await deleteLead(id);
        fetchData(currentPage);
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length && leads.length > 0) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: number) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleUpdateComment = async () => {
    if (!commentModal.id) return;
    try {
      await updateLeadComment(commentModal.id, commentModal.text);
      await updateLeadServices(commentModal.id, commentModal.serviceIds, commentModal.subServiceIds, commentModal.otherService);
      setCommentModal({ isOpen: false, id: null, text: '', requirements: [], serviceIds: [], subServiceIds: [], otherService: '' });
      fetchData(currentPage, selectedService);
    } catch (error) {
      alert('Update failed');
    }
  };

  const handleStatusChange = async (assignmentId: number, newStatus: string) => {
    try {
      await updateLeadStatus(assignmentId, newStatus);
      fetchData(currentPage, selectedService);
    } catch (error) {
      alert('Status update failed');
    }
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 font-sans bg-slate-50/50 min-h-screen">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
            {isAllLeadsView ? 'Leads & Pipeline' : 'Assigned Leads'}
          </h1>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            {isAllLeadsView ? 'Manage and track all incoming lead records.' : 'Tasks and enquiries currently assigned to you.'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAllLeadsView && <FileImportModal onImport={handleImport} isLoading={isUploading} />}
          {isAllLeadsView && (
            <Button variant="secondary" size="sm" className="border-slate-200 text-[10px] font-bold px-3 py-1.5 hover:bg-slate-100 transition-colors">
              <Download size={12} className="mr-1.5" /> EXPORT
            </Button>
          )}
          {isAllLeadsView && (
            <Button 
              variant="primary" 
              size="sm" 
              className="text-[10px] font-bold shadow-md px-3 py-1.5 bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus size={12} className="mr-1.5" /> ADD LEAD
            </Button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics - Improved design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-none shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-blue-200 transition-all">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
            <p className="text-[11px] font-bold text-slate-800">Connection Active</p>
          </div>
          <div className="h-8 w-8 bg-blue-50 rounded-none flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Clock size={16} />
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-none shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-emerald-200 transition-all">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Records</p>
            <p className="text-[11px] font-bold text-slate-800">{pagination?.total || leads.length}</p>
          </div>
          <div className="h-8 w-8 bg-emerald-50 rounded-none flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-none shadow-sm border border-slate-200/60 flex items-center justify-between group hover:border-indigo-200 transition-all">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sync Health</p>
            <p className="text-[11px] font-bold text-slate-800">99.4%</p>
          </div>
          <div className="h-8 w-8 bg-indigo-50 rounded-none flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <AlertCircle size={16} />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar - Better UI */}
      <div className="bg-white p-2 rounded-none shadow-sm border border-slate-200/60 flex flex-wrap lg:flex-nowrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-none text-[13px] font-medium outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400" 
            placeholder="Search leads by name, email or platform..." 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          {isAllLeadsView && selectedLeads.length > 0 && canAssignLeads && (
            <Button 
              variant="primary" 
              size="sm" 
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold rounded-none shadow-lg shadow-indigo-200 animate-in slide-in-from-right-4"
              onClick={() => setIsAssignModalOpen(true)}
            >
              <UserCheck size={12} className="mr-1.5" /> ASSIGN ({selectedLeads.length})
            </Button>
          )}
          
          {!isAllLeadsView && (
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="min-w-[140px] pl-3 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-none text-[11px] font-bold text-slate-600 outline-none focus:bg-white focus:border-blue-500 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.1rem_1.1rem] bg-[right_0.4rem_center] bg-no-repeat"
            >
              <option value="">Filter by Service</option>
              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          )}
          
          <Button variant="secondary" size="sm" className="border-slate-200 bg-white text-[10px] font-bold px-3 py-2 rounded-none">
            <Filter size={12} className="mr-1.5" /> FILTERS
          </Button>
        </div>
      </div>

      {/* 4. Table Section - Improved hierarchy and spacing */}
      <div className="bg-white rounded-none shadow-xl shadow-slate-100 border border-slate-200/50 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] z-20 transition-all">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-4">Refreshing</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                {isAllLeadsView ? (
                  <>
                    <th className="px-5 py-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer" 
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-5 py-4">Lead Profile</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Platform</th>
                    <th className="px-5 py-4">Campaign</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-4 w-14 text-center">#</th>
                    <th className="px-5 py-4">Enquiry Detail</th>
                    {isAdminOrHead && <th className="px-5 py-4">Assignee</th>}
                    <th className="px-5 py-4 text-center">Priority</th>
                    <th className="px-5 py-4 text-center">Work Status</th>
                    <th className="px-5 py-4">Required Services</th>
                    <th className="px-5 py-4">Notes</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {isAllLeadsView ? (
                leads.length > 0 ? (
                  leads.map((lead, idx) => (
                    <LeadTableRow 
                      key={lead.id} 
                      lead={lead} 
                      onDelete={handleDelete}
                      isSelected={selectedLeads.includes(lead.id)}
                      onSelect={() => toggleSelectLead(lead.id)}
                    />
                  ))
                ) : !loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center">
                      <p className="text-[13px] font-semibold text-slate-400">No lead records found.</p>
                    </td>
                  </tr>
                )
              ) : (
                assignments.length > 0 ? (
                  assignments.map((item, index) => {
                    const slNo = pagination ? (pagination.from + index) : (index + 1);
                    const leadData = item.lead?.lead_data;
                    const phoneNumber = leadData?.phone_number || leadData?.phone || 'N/A';
                    const isLocked = !!item.is_approved;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-5 py-4 text-center text-[10px] font-bold text-slate-400">{slNo}</td>
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-bold text-slate-800 tracking-tight leading-none mb-1.5">
                            {leadData?.full_name || 'N/A'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-1"><Mail size={10} className="text-slate-300"/> {leadData?.email || 'N/A'}</span>
                            <span className="h-0.5 w-0.5 bg-slate-200 rounded-full"></span>
                            <span className="flex items-center gap-1 text-blue-600/70"><Phone size={10} className="text-blue-300"/> {phoneNumber}</span>
                          </div>
                        </td>

                        {isAdminOrHead && (
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-100 uppercase">
                                {item.user?.name?.charAt(0)}
                              </div>
                              <span className="text-[11px] font-bold text-slate-600">{item.user?.name}</span>
                            </div>
                          </td>
                        )}

                        <td className="px-5 py-4 text-center">
                          {isAdminOrHead || isLocked ? (
                            <LeadStatusBadge status={item.user_status} />
                          ) : (
                            <select 
                              value={item.user_status?.toLowerCase() || ''}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`text-[10px] font-bold py-1 px-2.5 rounded-none border outline-none uppercase cursor-pointer transition-all ${
                                item.user_status?.toLowerCase() === 'hot' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                  : item.user_status?.toLowerCase() === 'warm'
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : item.user_status?.toLowerCase() === 'cold'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                              }`}
                            >
                              <option value="">Status</option>
                              <option value="hot">🔥 Hot</option>
                              <option value="warm">⚡ Warm</option>
                              <option value="cold">❄️ Cold</option>
                            </select>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center">
                          {item.is_approved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-100">
                              <CheckCircle2 size={10}/> APPROVED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-50 text-slate-400 rounded-none text-[9px] font-bold border border-slate-100">
                              <Clock size={10}/> PENDING
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {item.services?.map((s: any) => (
                              <span key={s.id} className="px-2 py-0.5 rounded-md bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 text-[9px] font-bold uppercase">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic max-w-[150px] font-medium leading-tight">
                            {item.user_comment ? `"${item.user_comment}"` : '—'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setCommentModal({ 
                              isOpen: true, 
                              id: item.id, 
                              text: item.user_comment || '', 
                              requirements: item.lead_requirements || [],
                              serviceIds: item.services?.map((s: any) => s.id) || [],
                              subServiceIds: item.sub_services?.map((s: any) => s.id) || [],
                              otherService: item.other_service || ''
                            })}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-none transition-all active:scale-95"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : !loading && (
                  <tr><td colSpan={isAdminOrHead ? 8 : 7} className="px-5 py-20 text-center text-[12px] text-slate-400 font-semibold">No assigned leads.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination - Redesigned */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <div className="flex flex-col">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Navigation</p>
              <p className="text-[11px] font-bold text-slate-600">
                <span className="text-blue-600">{pagination.from}-{pagination.to}</span> / {pagination.total}
              </p>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={!pagination.prev_page_url}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex items-center gap-1 px-1">
                {pagination.links.filter((l: any) => !isNaN(Number(l.label))).map((link: any) => (
                  <button
                    key={link.label}
                    onClick={() => setCurrentPage(Number(link.label))}
                    className={`h-8 min-w-[32px] px-1.5 rounded-none text-[10px] font-bold transition-all ${
                      link.active 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <button
                disabled={!pagination.next_page_url}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AssignLeadsModal 
        isOpen={isAssignModalOpen} 
        onOpenChange={setIsAssignModalOpen}
        selectedLeadIds={selectedLeads}
        onSuccess={() => {
          setSelectedLeads([]);
          fetchData(currentPage);
        }}
      />

      <AddLeadModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          fetchData(1); // Refresh data from first page
        }}
      />

      <LeadDescriptionModal
        isOpen={commentModal.isOpen}
        onOpenChange={(open) => setCommentModal(prev => ({ ...prev, isOpen: open }))}
        comment={commentModal.text}
        onCommentChange={(text) => setCommentModal(prev => ({ ...prev, text }))}
        requirements={commentModal.requirements}
        onRequirementsChange={(requirements) => setCommentModal(prev => ({ ...prev, requirements }))}
        selectedServiceIds={commentModal.serviceIds}
        onServiceIdsChange={(serviceIds) => setCommentModal(prev => ({ ...prev, serviceIds }))}
        selectedSubServiceIds={commentModal.subServiceIds}
        onSubServiceIdsChange={(subServiceIds) => setCommentModal(prev => ({ ...prev, subServiceIds }))}
        otherService={commentModal.otherService}
        onOtherServiceChange={(otherService) => setCommentModal(prev => ({ ...prev, otherService }))}
        availableServices={availableServices}
        onSave={handleUpdateComment}
        isAdminOrHead={isAdminOrHead}
      />
    </div>
  );
};

export default LeadsPage;
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, UserPlus, Download, Clock, 
  CheckCircle2, AlertCircle, Loader2, ChevronLeft, ChevronRight, UserCheck, ChevronDown, User, Mail, Phone, MessageSquare 
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { LeadTableRow } from './LeadTableRow';
import { PipelineMetric } from './PipelineMetric';
import { FileImportModal } from './FileImportModal';
import { AssignLeadsModal } from './components/AssignLeadsModal';
import { LeadDescriptionModal } from './components/LeadDescriptionModal';
import { getLeads, uploadLeads, deleteLead, getAssignedLeads, updateLeadStatus, updateLeadComment, getServices, getSubServices, updateLeadServices } from '../../api/services/microService';
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
  }, [isAllLeadsView, user?.id]);

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
    <div className="space-y-5 animate-in fade-in duration-500 font-sans">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
            {isAllLeadsView ? 'Leads & Pipeline' : 'Assigned Leads'}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest leading-none">
            {isAllLeadsView ? 'Master Lead Directory' : 'My Assigned Leads'}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAllLeadsView && <FileImportModal onImport={handleImport} isLoading={isUploading} />}
          {isAllLeadsView && (
            <Button variant="secondary" size="sm" className="h-8 border-slate-200 text-[10px] font-bold px-3">
              <Download size={12} /> EXPORT
            </Button>
          )}
          {isAllLeadsView && (
            <Button variant="primary" size="sm" className="h-8 text-[10px] font-bold shadow-sm px-3">
              <UserPlus size={12} /> ADD LEAD
            </Button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics - High Density */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PipelineMetric label="Sync Status" value="Active" variant="blue" icon={<Clock size={14} />} />
        <PipelineMetric 
          label="Total Records" 
          value={pagination?.total?.toString() || leads.length.toString()} 
          variant="white" 
          icon={<CheckCircle2 size={14} className="text-green-500" />} 
        />
        <PipelineMetric label="Health Index" value="99.4%" variant="white" icon={<AlertCircle size={14} className="text-blue-500" />} />
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200/60 flex gap-2 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={13} />
          <input 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-transparent rounded-md text-[11px] font-medium outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-400" 
            placeholder="Search leads..." 
          />
        </div>
        
        {isAllLeadsView && selectedLeads.length > 0 && canAssignLeads && (
          <Button 
            variant="primary" 
            size="sm" 
            className="h-8 text-[10px] bg-indigo-600 hover:bg-indigo-700 animate-in zoom-in-95 font-bold"
            onClick={() => setIsAssignModalOpen(true)}
          >
            <UserCheck size={12} /> ASSIGN ({selectedLeads.length})
          </Button>
        )}
        
        {!isAllLeadsView && (
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-transparent rounded-md text-[11px] font-medium outline-none focus:bg-white focus:border-blue-500 transition-all"
          >
            <option value="">All Services</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        )}
        
        <Button variant="secondary" size="sm" className="h-8 border-slate-200 text-[10px] font-bold px-3">
          <Filter size={12} /> FILTERS
        </Button>
      </div>

      {/* 4. Table Section - Removed min-h-[400px] to allow growth */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={20} />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Updating Registry...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {isAllLeadsView ? (
                  <>
                    <th className="px-5 py-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer" 
                        checked={selectedLeads.length === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-5 py-3">Lead Identity</th>
                    <th className="px-5 py-3">Engagement</th>
                    <th className="px-5 py-3">Preferences</th>
                    <th className="px-5 py-3">Origin</th>
                    <th className="px-5 py-3">Campaign Data</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3 w-12 text-center">#</th>
                    <th className="px-5 py-3">Lead Identity</th>
                    {isAdminOrHead && <th className="px-5 py-3">Assignee</th>}
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-center">Approval</th>
                    <th className="px-5 py-3">Services</th>
                    <th className="px-5 py-3">Notes</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isAllLeadsView ? (
                leads.length > 0 ? (
                  leads.map(lead => (
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
                    <td colSpan={7} className="px-5 py-12 text-center text-[11px] text-slate-400 italic font-medium">
                      No lead records found in current synchronization.
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
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{slNo}</td>
                        <td className="px-5 py-3">
                          <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[150px]">
                            {leadData?.full_name || 'N/A'}
                          </p>
                          <div className="flex flex-col gap-0.5 mt-1.5 text-[9px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Mail size={10} className="text-slate-300"/> 
                              {leadData?.email || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-slate-500">
                              <Phone size={10} className="text-blue-400/60"/> 
                              {phoneNumber}
                            </span>
                          </div>
                        </td>

                        {isAdminOrHead && (
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold border border-slate-200 uppercase">
                                {item.user?.name?.charAt(0)}
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">{item.user?.name}</span>
                            </div>
                          </td>
                        )}

                        <td className="px-5 py-3 text-center">
                          {isAdminOrHead || isLocked ? (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tighter ${
                              item.user_status?.toLowerCase() === 'hot' 
                                ? 'bg-red-50 text-red-600 border-red-100' 
                                : item.user_status?.toLowerCase() === 'warm'
                                ? 'bg-orange-50 text-orange-600 border-orange-100'
                                : item.user_status?.toLowerCase() === 'cold'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {item.user_status || 'New'}
                            </span>
                          ) : (
                            <select 
                              value={item.user_status?.toLowerCase() || ''}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`text-[10px] font-bold py-0.5 px-1 rounded border outline-none uppercase cursor-pointer ${
                                item.user_status?.toLowerCase() === 'hot' 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : item.user_status?.toLowerCase() === 'warm'
                                  ? 'bg-orange-50 text-orange-600 border-orange-100'
                                  : item.user_status?.toLowerCase() === 'cold'
                                  ? 'bg-blue-50 text-blue-600 border-blue-100'
                                  : 'bg-white text-slate-700 border-slate-200 focus:border-blue-500'
                              }`}
                            >
                              <option value="">Set</option>
                              <option value="hot">Hot</option>
                              <option value="warm">Warm</option>
                              <option value="cold">Cold</option>
                            </select>
                          )}
                        </td>

                        <td className="px-5 py-3 text-center">
                          {item.is_approved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[9px] font-bold border border-green-100">
                              <CheckCircle2 size={10}/> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold border border-slate-100">
                              <Clock size={10}/> Pending
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {item.services?.map((s: any) => (
                              <span key={s.id} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-bold uppercase tracking-tighter">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic max-w-[140px] font-medium">
                            {item.user_comment ? `"${item.user_comment}"` : '—'}
                          </p>
                        </td>

                        <td className="px-5 py-3 text-right">
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
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-90"
                          >
                            <MessageSquare size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : !loading && (
                  <tr><td colSpan={isAdminOrHead ? 8 : 7} className="px-5 py-12 text-center text-[11px] text-slate-400 italic font-medium">No leads assigned yet.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI - High Density */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-5 py-2.5 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {pagination.from}-{pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={!pagination.prev_page_url}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all active:scale-95"
              >
                <ChevronLeft size={14} />
              </button>
              
              <div className="flex gap-1">
                {pagination.links.filter((l: any) => !isNaN(Number(l.label))).map((link: any) => (
                  <button
                    key={link.label}
                    onClick={() => setCurrentPage(Number(link.label))}
                    className={`h-7 px-2.5 rounded text-[10px] font-bold transition-all ${
                      link.active 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <button
                disabled={!pagination.next_page_url}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-30 transition-all active:scale-95"
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
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, Mail, Phone, User, Filter, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { 
  getAssignedLeads, 
  updateLeadStatus, 
  updateLeadComment, 
  getServices, 
  updateLeadServices,
  getProposals 
} from '../../api/services/microService';
import { LeadDescriptionModal } from './components/LeadDescriptionModal';
import { Button } from '../../components/common/Button';

const AssignedLeadsPage = () => {
  const { roleName } = useAppSelector((state) => state.auth);
  const isAdminOrHead = ['ADMIN', 'DM HEAD'].includes(roleName?.toUpperCase() || '');
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState<string>(''); 

  const [commentModal, setCommentModal] = useState({
    isOpen: false, id: null as number | null, text: '', requirements: [] as string[], 
    serviceIds: [] as number[], otherService: ''
  });

  const fetchData = useCallback(async (page: number, serviceFilter: string = '') => {
    try {
      setLoading(true);
      const [leadsRes, servicesRes, proposalsRes] = await Promise.all([
        getAssignedLeads(page, serviceFilter),
        getServices(1),
        getProposals(1)
      ]);
      
      const rawLeads = leadsRes?.data?.data || [];
      const proposalsMap = proposalsRes?.data?.data || [];

      const merged = rawLeads.map((lead: any) => {
        const proposal = proposalsMap.find((p: any) => Number(p.lead_assign_id) === Number(lead.id));
        return {
          ...lead,
          is_approved: !!proposal?.is_accepted 
        };
      });

      setAssignments(merged);
      setAvailableServices(servicesRes?.data?.data || []);
      setPagination(leadsRes?.data);
      setCurrentPage(leadsRes?.data?.current_page || 1);
    } catch (error) {
      console.error("Data fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(currentPage, selectedService); 
  }, [currentPage, selectedService, fetchData]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === "") return;
    try {
      await updateLeadStatus(id, newStatus.toLowerCase());
      fetchData(currentPage, selectedService); 
    } catch (error) { alert("Error updating status"); }
  };

  const handleSaveData = async () => {
    if (!commentModal.id) return;
    try {
      const validServiceIds = commentModal.serviceIds.filter(id => id !== 999);
      await Promise.all([
        updateLeadComment(commentModal.id, commentModal.text),
        updateLeadServices(commentModal.id, validServiceIds, commentModal.otherService)
      ]);
      setCommentModal(prev => ({ ...prev, isOpen: false }));
      fetchData(currentPage, selectedService);
    } catch (error) { alert("Failed to save data."); }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Assigned Leads</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Workflow Management</p>
        </div>

        <div className="relative w-full sm:w-64 group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <select
            value={selectedService}
            onChange={(e) => { setSelectedService(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Services</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.name}>{service.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-blue-600" size={20} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3 w-12 text-center">#</th>
                <th className="px-5 py-3">Lead Identity</th>
                {isAdminOrHead && <th className="px-5 py-3">Assignee</th>}
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Approval</th>
                <th className="px-5 py-3">Services</th>
                <th className="px-5 py-3">Notes</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assignments.length > 0 ? assignments.map((item, index) => {
                const slNo = pagination ? (pagination.from + index) : (index + 1);
                
                // DATA MAPPING FIX
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
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {item.user_status || 'New'}
                        </span>
                      ) : (
                        <select 
                          value={item.user_status?.toLowerCase() || ''}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="text-[10px] font-bold py-0.5 px-1 rounded border border-slate-200 outline-none bg-white focus:border-blue-500 uppercase cursor-pointer"
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
                          isOpen: true, id: item.id, text: item.user_comment || '', 
                          requirements: item.lead_requirements || [],
                          serviceIds: item.services?.map((s: any) => s.id) || [],
                          otherService: item.other_service || ''
                        })}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all active:scale-90"
                      >
                        <MessageSquare size={15} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={isAdminOrHead ? 8 : 7} className="px-5 py-12 text-center text-[11px] text-slate-400 italic font-medium">
                    No leads assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-5 py-2.5 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {pagination.from}-{pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-1.5">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={!pagination.prev_page_url} 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                className="h-7 w-7 p-0 border-slate-200 bg-white"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={!pagination.next_page_url} 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                className="h-7 w-7 p-0 border-slate-200 bg-white"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadDescriptionModal 
        isOpen={commentModal.isOpen} 
        onOpenChange={(open) => setCommentModal(prev => ({ ...prev, isOpen: open }))}
        comment={commentModal.text} 
        onCommentChange={(text) => setCommentModal(prev => ({ ...prev, text }))}
        requirements={commentModal.requirements} 
        onRequirementsChange={(reqs) => setCommentModal(prev => ({ ...prev, requirements: reqs }))}
        selectedServiceIds={commentModal.serviceIds}
        onServiceIdsChange={(ids) => setCommentModal(prev => ({ ...prev, serviceIds: ids }))}
        otherService={commentModal.otherService}
        onOtherServiceChange={(text) => setCommentModal(prev => ({ ...prev, otherService: text }))}
        onSave={handleSaveData} 
        isAdminOrHead={isAdminOrHead} 
        availableServices={availableServices}
      />
    </div>
  );
};

export default AssignedLeadsPage;
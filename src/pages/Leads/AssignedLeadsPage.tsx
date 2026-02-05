import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, Mail, Phone, User, Filter, AlertCircle, XCircle } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { 
  getAssignedLeads, 
  updateLeadStatus, 
  updateLeadComment, 
  getServices, 
  updateLeadServices 
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
  const [selectedReq, setSelectedReq] = useState<string>(''); 
  const [allPossibleRequirements, setAllPossibleRequirements] = useState<string[]>([]);

  const [commentModal, setCommentModal] = useState<{
    isOpen: boolean, id: number | null, text: string, requirements: string[], 
    serviceIds: number[], otherService: string
  }>({
    isOpen: false, id: null, text: '', requirements: [], serviceIds: [], otherService: ''
  });

  const fetchData = useCallback(async (page: number, requirement: string = '') => {
    try {
      setLoading(true);
      // Fetch assignments and the global services list
      const [assignmentsRes, servicesRes] = await Promise.all([
        getAssignedLeads(page, requirement),
        getServices(1)
      ]);
      
      const fetchedAssignments = assignmentsRes?.data?.data || [];
      setAssignments(fetchedAssignments);
      setAvailableServices(servicesRes?.data?.data || []);
      setPagination(assignmentsRes?.data);
      setCurrentPage(assignmentsRes?.data?.current_page || 1);

      // Extract unique requirements for the filter dropdown
      if (fetchedAssignments.length > 0) {
        setAllPossibleRequirements(prev => {
          const newReqs = fetchedAssignments.flatMap((item: any) => [
            ...(item.lead_requirements || []),
            ...(item.lead_requirements_history?.flatMap((h: any) => h.new_requirements || []) || [])
          ]);
          return Array.from(new Set([...prev, ...newReqs])).filter(Boolean).sort();
        });
      }
    } catch (error) {
      console.error("Data fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(currentPage, selectedReq); 
  }, [currentPage, selectedReq, fetchData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReq(e.target.value);
    setCurrentPage(1); 
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === "") return;
    try {
      await updateLeadStatus(id, newStatus.toLowerCase());
      fetchData(currentPage, selectedReq); 
    } catch (error) { alert("Error updating status"); }
  };

  const handleSaveData = async () => {
  if (!commentModal.id) return;
  try {
    // FIX: Filter out the placeholder ID (999) before sending to API
    const validServiceIds = commentModal.serviceIds.filter(id => id !== 999);

    await Promise.all([
      updateLeadComment(commentModal.id, commentModal.text),
      updateLeadServices(commentModal.id, validServiceIds, commentModal.otherService)
    ]);

    setCommentModal(prev => ({ ...prev, isOpen: false }));
    fetchData(currentPage, selectedReq);
  } catch (error) { 
    alert("Failed to save data. Please check if 'Other Service' details are required."); 
  }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Leads</h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage and track follow-ups</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
           <div className="relative group w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={selectedReq}
                onChange={handleFilterChange}
                className="w-full sm:w-auto pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="">All Requirements</option>
                {allPossibleRequirements.map(req => (
                  <option key={req} value={req}>{req}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronLeft className="-rotate-90" size={12} />
              </div>
           </div>
           {selectedReq && (
              <button 
                onClick={() => { setSelectedReq(''); setCurrentPage(1); }}
                className="p-2.5 text-slate-400 hover:text-red-500 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"
              >
                <XCircle size={16} />
              </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[450px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">#</th>
                  <th className="px-6 py-4 min-w-[200px]">Lead Identity</th>
                  {isAdminOrHead && <th className="px-6 py-4">Assignment Info</th>}
                  <th className="px-6 py-4 text-center">Lead Status</th>
                  <th className="px-6 py-4">Requirements & Services</th>
                  <th className="px-6 py-4">Last note</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assignments.length > 0 ? assignments.map((item, index) => {
                  const slNo = pagination ? (pagination.from + index) : (index + 1);
                  const leadData = item.lead?.lead_data;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-400">{slNo}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900 leading-none mb-2 truncate max-w-[150px]">
                          {leadData?.full_name || 'Anonymous Lead'}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-slate-500 flex items-center gap-2">
                            <Mail size={12} className="text-blue-400" /> {leadData?.email || 'N/A'}
                          </span>
                          {/* Corrected: Fetching phone from nested lead data */}
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                            <Phone size={12} className="text-green-500" /> {leadData?.phone || leadData?.phone_number || 'N/A'}
                          </span>
                        </div>
                      </td>
                      
                      {isAdminOrHead && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User size={12} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-700">{item.user?.name}</span>
                            </div>
                            <span className="w-fit px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-black uppercase border border-slate-200">
                              {item.status || 'assigned'}
                            </span>
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4 text-center">
                        {isAdminOrHead ? (
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black border uppercase shadow-sm ${
                            item.user_status?.toLowerCase() === 'hot' ? 'bg-red-500 text-white border-red-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>{item.user_status || 'New'}</span>
                        ) : (
                          <select 
                            value={item.user_status?.toLowerCase() || ''}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className="text-[10px] font-bold p-1.5 rounded-lg border outline-none bg-white focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="">Status</option>
                            <option value="hot">🔥 Hot</option>
                            <option value="warm">⚡ Warm</option>
                            <option value="cold">❄️ Cold</option>
                          </select>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {/* Merged View: Predefined Services */}
                          {item.services?.map((s: any) => (
                            <span key={s.id} className="px-2 py-0.5 rounded-md border text-[9px] font-bold bg-indigo-50 text-indigo-600 border-indigo-100">
                              {s.name}
                            </span>
                          ))}
                          {/* Merged View: Other Service text */}
                          {item.other_service && (
                            <span className="px-2 py-0.5 rounded-md border text-[9px] font-bold bg-purple-50 text-purple-600 border-purple-100">
                              {item.other_service}
                            </span>
                          )}
                          {/* Merged View: General Requirements */}
                          {item.lead_requirements?.map((req: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md border text-[9px] font-bold bg-blue-50 text-blue-600 border-blue-100 shadow-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-[10px] text-slate-600 line-clamp-2 italic font-medium max-w-[180px]">
                          {item.user_comment ? `"${item.user_comment}"` : 'Pending follow-up...'}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setCommentModal({ 
                            isOpen: true, 
                            id: item.id, 
                            text: item.user_comment || '', 
                            requirements: item.lead_requirements || [],
                            serviceIds: item.services?.map((s: any) => s.id) || [],
                            otherService: item.other_service || ''
                          })}
                          className="p-2.5 rounded-xl border bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
                        >
                          <MessageSquare size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={ isAdminOrHead ? 7 : 6 } className="px-6 py-20 text-center text-slate-400 italic text-sm">
                       No results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {!loading && pagination && pagination.last_page > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Records {pagination.from} - {pagination.to} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" size="sm" 
                disabled={!pagination.prev_page_url} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="h-9 w-9 p-0 rounded-lg flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="secondary" size="sm" 
                disabled={!pagination.next_page_url} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="h-9 w-9 p-0 rounded-lg flex items-center justify-center"
              >
                <ChevronRight size={16} />
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
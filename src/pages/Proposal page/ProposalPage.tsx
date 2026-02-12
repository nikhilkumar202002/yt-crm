import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Phone, Mail, User, Settings2,
  UploadCloud, Loader2, ChevronLeft, ChevronRight, Clock, Flame
} from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { getAssignedLeads, getProposals, acceptProposal } from '../../api/services/microService';
import { ProposalUploadModal } from './components/ProposalUploadModal';
import { ProposalDetailsModal } from './components/ProposalDetailsModal';
import { Button } from '../../components/common/Button';

const ProposalPage = () => {
  const { roleName } = useAppSelector((state) => state.auth);
  // Roles allowed to see financial data and add details
  const isFinancePrivileged = ['ADMIN', 'DM HEAD', 'ACCOUNTANT'].includes(roleName?.toUpperCase() || '');

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, leadId: null as number | null, proposalId: null as number | null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, proposalId: null as number | null });

  const fetchData = useCallback(async (page: number, silent = false) => {
    try {
      if (!silent) setLoading(true); 
      
      // First, fetch leads
      const leadsRes = await getAssignedLeads(page, 'hot');
      const hotLeads = (leadsRes?.data?.data || []).filter(
        (l: any) => l.user_status?.toLowerCase() === 'hot'
      );

      // Fetch all proposals (handle pagination)
      let allProposals: any[] = [];
      try {
        const firstProposalRes = await getProposals(1);
        const firstPageData = firstProposalRes?.data?.data || [];
        const totalPages = firstProposalRes?.data?.last_page || 1;
        
        allProposals = [...firstPageData];
        
        if (totalPages > 1) {
          // Fetch remaining pages in parallel
          const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
          const remainingResponses = await Promise.all(
            remainingPages.map(p => getProposals(p))
          );
          
          remainingResponses.forEach(res => {
            const pageData = res?.data?.data || [];
            allProposals = allProposals.concat(pageData);
          });
        }
      } catch (error) {
        console.warn("Could not fetch proposals (permission denied or API error), proposal data will not be shown");
        allProposals = [];
      }

      const mergedData = hotLeads.map((lead: any) => {
        const existingProposal = allProposals.find(
          (p: any) => Number(p.lead_assign_id) === Number(lead.id)
        );
        
        return {
          ...lead,
          proposal_file_url: existingProposal?.file_url || null,
          proposal_id: existingProposal?.id || null,
          proposal_is_accepted: !!existingProposal?.is_accepted,
          // Delivery & Price data
          creatives_nos: existingProposal?.creatives_nos || 0,
          videos_nos: existingProposal?.videos_nos || 0,
          amount: Number(existingProposal?.amount || 0),
          gst_percentage: Number(existingProposal?.gst_percentage || 18)
        };
      });

      setLeads(mergedData);
      setPagination(leadsRes?.data);
      setCurrentPage(leadsRes?.data?.current_page || 1);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, fetchData]);

  const handleAcceptTrigger = async (proposalId: number) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.proposal_id === proposalId 
          ? { ...lead, proposal_is_accepted: true } 
          : lead
      )
    );

    try {
      await acceptProposal(proposalId);
      await fetchData(currentPage, true); 
    } catch (error) {
      await fetchData(currentPage, true);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none flex items-center gap-2">
            Proposal Management
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest leading-none">
            High Priority Documentation Pipeline
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-10 py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={20} />
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Processing records...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3 w-12 text-center">#</th>
                <th className="px-5 py-3">Lead Identity</th>
                <th className="px-5 py-3 text-center">Priority</th>
                {isFinancePrivileged && (
                  <>
                    <th className="px-5 py-3 text-center">Output</th>
                    <th className="px-5 py-3 text-right">Total Amount</th>
                  </>
                )}
                <th className="px-5 py-3">Assignee</th>
                <th className="px-5 py-3">Services Scope</th>
                <th className="px-5 py-3 text-center">Approval</th>
                <th className="px-5 py-3 text-center">Document</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.length > 0 ? leads.map((item, index) => {
                const slNo = pagination ? (pagination.from + index) : (index + 1);
                const leadData = item.lead?.lead_data;
                const displayPhone = leadData?.phone_number || leadData?.phone || 'N/A';
                const displayEmail = leadData?.email || 'N/A'; // Fixed Email fetching
                const isAccepted = !!item.proposal_is_accepted;
                const totalWithGst = item.amount + (item.amount * (item.gst_percentage / 100));

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-3 text-center text-[10px] font-medium text-slate-400">{slNo}</td>
                    
                    <td className="px-5 py-3">
                      <p className="text-[11px] font-bold text-slate-900 leading-none truncate max-w-[150px]">
                        {leadData?.full_name || 'N/A'}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1.5 text-[9px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1 font-bold text-slate-500">
                           <Phone size={10} className="text-blue-400/60"/> {displayPhone}
                        </span>
                        <span className="flex items-center gap-1">
                           <Mail size={10} className="text-slate-300"/> {displayEmail}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm animate-pulse">
                        <Flame size={8} fill="currentColor" /> Hot
                      </span>
                    </td>

                    {isFinancePrivileged && (
                      <>
                        <td className="px-5 py-3 text-center">
                          <div className="text-[10px] font-bold text-slate-700">{item.creatives_nos}C / {item.videos_nos}V</div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-[10px] font-black text-slate-900">₹{totalWithGst.toLocaleString()}</span>
                        </td>
                      </>
                    )}

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold border border-slate-200 uppercase">
                          {item.user?.name?.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[80px]">{item.user?.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {/* Fixed Services fetching */}
                        {item.services?.map((s: any) => (
                          <span key={s.id} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-bold uppercase tracking-tighter">
                            {s.name}
                          </span>
                        ))}
                        {item.other_service && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 text-[8px] font-bold uppercase tracking-tighter">
                            {item.other_service}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {item.proposal_id ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={isAccepted}
                              onClick={() => handleAcceptTrigger(item.proposal_id)}
                              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                                isAccepted ? 'bg-green-500' : 'bg-slate-200'
                              }`}
                            >
                              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAccepted ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </button>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isAccepted ? 'text-green-600' : 'text-slate-400'}`}>
                              {isAccepted ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-300 italic font-medium flex items-center gap-1">
                            <Clock size={10} /> Pending PDF
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      {item.proposal_file_url ? (
                        <a 
                          href={item.proposal_file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 font-bold text-[10px] bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 w-fit transition-all shadow-sm mx-auto"
                        >
                          <FileText size={12} /> View
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Missing</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Details Modal Trigger: Visible only if approved and privileged */}
                        {isAccepted && isFinancePrivileged && (
                          <button 
                            onClick={() => setDetailsModal({ isOpen: true, proposalId: item.proposal_id })} 
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-all" 
                            title="Add Details"
                          >
                            <Settings2 size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => setUploadModal({ 
                            isOpen: true, 
                            leadId: item.id, 
                            proposalId: item.proposal_id 
                          })}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors p-1.5 group"
                        >
                          <UploadCloud size={14} className="group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-[11px] text-slate-400 italic font-medium">
                    No hot leads found requiring proposals.
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
              Records {pagination.from}-{pagination.to}
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

      <ProposalUploadModal 
        isOpen={uploadModal.isOpen}
        onOpenChange={(open) => setUploadModal({ ...uploadModal, isOpen: open })}
        leadId={uploadModal.leadId}
        proposalId={uploadModal.proposalId}
      />

      <ProposalDetailsModal 
        isOpen={detailsModal.isOpen} 
        onOpenChange={(open) => setDetailsModal({ ...detailsModal, isOpen: open })} 
        proposalId={detailsModal.proposalId} 
        onSuccess={() => fetchData(currentPage, true)} 
      />
    </div>
  );
};

export default ProposalPage;
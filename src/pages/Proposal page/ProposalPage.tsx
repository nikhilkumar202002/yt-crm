import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Phone, Mail, User, ExternalLink, 
  UploadCloud, AlertCircle, Flame, Loader2, ChevronLeft, ChevronRight, Clock
} from 'lucide-react';
import { getAssignedLeads, getProposals, acceptProposal } from '../../api/services/microService';
import { ProposalUploadModal } from './components/ProposalUploadModal';
import { Button } from '../../components/common/Button';

const ProposalPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadModal, setUploadModal] = useState({ 
    isOpen: false, 
    leadId: null as number | null,
    proposalId: null as number | null 
  });

  // Updated fetchData to support silent refreshing
  const fetchData = useCallback(async (page: number, silent = false) => {
    try {
      if (!silent) setLoading(true); 
      
      const [leadsRes, proposalsRes] = await Promise.all([
        getAssignedLeads(page, 'hot'),
        getProposals(1)
      ]);

      const hotLeads = (leadsRes?.data?.data || []).filter(
        (l: any) => l.user_status?.toLowerCase() === 'hot'
      );

      const proposalsMap = proposalsRes?.data?.data || [];

      const mergedData = hotLeads.map((lead: any) => {
        const existingProposal = proposalsMap.find((p: any) => p.lead_assign_id == lead.id);
        return {
          ...lead,
          proposal_file_url: existingProposal?.file_url || null,
          proposal_id: existingProposal?.id || null,
          // GROUND TRUTH: Use the status directly from the API
          proposal_status: existingProposal?.status || 'pending' 
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
    // 1. Optimistic Update: Instantly slide the toggle locally
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.proposal_id === proposalId 
          ? { ...lead, proposal_status: 'accepted' } 
          : lead
      )
    );

    try {
      // 2. API Call
      await acceptProposal(proposalId);
      
      // 3. Silent Refresh: Sync with DB without showing the 'Synchronizing' spinner
      await fetchData(currentPage, true); 
    } catch (error) {
      // 4. Rollback: If API fails, revert the toggle
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.proposal_id === proposalId 
            ? { ...lead, proposal_status: 'pending' } 
            : lead
        )
      );
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Proposal Management
          </h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">Manage PDF documents and client approvals for Hot leads</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[450px]">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
             <Loader2 className="animate-spin text-blue-600" size={24} />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">#</th>
                  <th className="px-6 py-4 min-w-[200px]">Lead Identity</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4 text-center">Lead Status</th>
                  <th className="px-6 py-4 text-center">Client Approval</th>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.length > 0 ? leads.map((item, index) => {
                  const slNo = pagination ? (pagination.from + index) : (index + 1);
                  const leadData = item.lead?.lead_data;
                  // isAccepted is derived from the merged API status
                  const isAccepted = item.proposal_status?.toLowerCase() === 'accepted';

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-400">{slNo}</td>
                      
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900 mb-1 leading-none">{leadData?.full_name || 'Anonymous'}</p>
                        <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                          <span className="flex items-center gap-2 font-medium tracking-tight"><Phone size={10} className="text-green-500" /> {leadData?.phone_number || leadData?.phone || 'N/A'}</span>
                          <span className="flex items-center gap-2 font-medium tracking-tight"><Mail size={10} className="text-blue-500" /> {leadData?.email || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                            <User size={12} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{item.user?.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                          <Flame size={10} fill="currentColor" /> {item.user_status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center">
                          {item.proposal_id ? (
                            <div className="flex items-center gap-3">
                              <button
                                disabled={isAccepted}
                                onClick={() => handleAcceptTrigger(item.proposal_id)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer ${
                                  isAccepted ? 'bg-green-500' : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                                    isAccepted ? 'translate-x-[22px]' : 'translate-x-[4px]'
                                  }`}
                                />
                              </button>
                              <span className={`text-[9px] font-black uppercase tracking-widest min-w-[50px] text-left transition-colors duration-300 ${
                                isAccepted ? 'text-green-600' : 'text-slate-400'
                              }`}>
                                {isAccepted ? 'Accepted' : 'Pending'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-300 text-[10px] italic font-medium">
                              <Clock size={12} /> Pending Upload
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.proposal_file_url ? (
                          <a 
                            href={item.proposal_file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 text-blue-600 font-bold text-[10px] hover:text-white hover:bg-blue-600 bg-blue-50 p-2 rounded-xl w-fit transition-all border border-blue-100 shadow-sm"
                          >
                            <FileText size={14} /> View PDF
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-300 text-[10px] italic font-medium">
                            <AlertCircle size={14} /> Missing
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => setUploadModal({ 
                            isOpen: true, 
                            leadId: item.id, 
                            proposalId: item.proposal_id 
                          })}
                          className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 mx-auto"
                        >
                          <UploadCloud size={16} className="text-slate-500" />
                          {item.proposal_file_url ? 'Update' : 'Upload'}
                        </Button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 text-sm italic font-medium">No hot leads found requiring proposals.</td>
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

      <ProposalUploadModal 
        isOpen={uploadModal.isOpen}
        onOpenChange={(open) => setUploadModal({ ...uploadModal, isOpen: open })}
        leadId={uploadModal.leadId}
        proposalId={uploadModal.proposalId}
        onSuccess={() => fetchData(currentPage, true)} 
      />
    </div>
  );
};

export default ProposalPage;
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Phone, Mail, User, ExternalLink, 
  UploadCloud, AlertCircle, Search, Flame, Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { getAssignedLeads, getProposals } from '../../api/services/microService';
import { ProposalUploadModal } from './components/ProposalUploadModal';
import { Button } from '../../components/common/Button';

const ProposalPage = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, leadId: null as number | null });

  const fetchData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      // Fetch assigned leads with 'hot' requirement filter to get all hot leads
      const [leadsRes, proposalsRes] = await Promise.all([
        getAssignedLeads(page, 'hot'),
        getProposals(1) // Fetch proposals to check for existing files
      ]);

      const hotLeads = (leadsRes?.data?.data || []).filter(
        (l: any) => l.user_status?.toLowerCase() === 'hot'
      );

      const proposalsMap = proposalsRes?.data?.data || [];

      // Merge proposal info into the leads data
      const mergedData = hotLeads.map((lead: any) => {
        const existingProposal = proposalsMap.find((p: any) => p.lead_assign_id == lead.id);
        return {
          ...lead,
          proposal_file_url: existingProposal?.file_url || null,
          proposal_id: existingProposal?.id || null
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Proposal Management
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">Manage PDF proposals for Hot leads</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative min-h-[400px]">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
             <Loader2 className="animate-spin text-blue-600" size={24} />
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Sl No</th>
                  <th className="px-6 py-4 min-w-[200px]">Lead Details</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Services & Requirements</th>
                  <th className="px-6 py-4">Proposal PDF</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.length > 0 ? leads.map((item, index) => {
                  const slNo = pagination ? (pagination.from + index) : (index + 1);
                  const leadData = item.lead?.lead_data;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-6 py-4 text-center text-[11px] font-bold text-slate-400">{slNo}</td>
                      
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-900 mb-1">{leadData?.full_name || 'N/A'}</p>
                        <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                          <span className="flex items-center gap-2"><Phone size={12} className="text-green-500" /> {leadData?.phone_number || leadData?.phone || 'N/A'}</span>
                          <span className="flex items-center gap-2"><Mail size={12} className="text-blue-400" /> {leadData?.email || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                            <User size={14} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{item.user?.name}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-tighter">
                          <Flame size={10} fill="currentColor" /> {item.user_status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                          {/* Corrected Service Mapping */}
                          {item.services?.map((s: any) => (
                            <span key={s.id} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[9px] font-bold uppercase">{s.name}</span>
                          ))}
                          {item.other_service && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold uppercase">{item.other_service}</span>
                          )}
                          {item.lead_requirements?.map((req: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold">{req}</span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {item.proposal_file_url ? (
                          <a 
                            href={item.proposal_file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 text-blue-600 font-bold text-[10px] hover:text-blue-700 bg-blue-50/50 p-2 rounded-xl w-fit transition-all border border-blue-100"
                          >
                            <FileText size={16} /> View PDF <ExternalLink size={10} />
                          </a>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-300 text-[10px] italic font-medium">
                            <AlertCircle size={14} /> No PDF
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => setUploadModal({ isOpen: true, leadId: item.id })}
                          className="h-9 px-4 text-[10px] font-bold rounded-xl shadow-sm border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 mx-auto"
                        >
                          <UploadCloud size={16} className="text-slate-500" />
                          {item.proposal_file_url ? 'Update' : 'Upload'}
                        </Button>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-slate-400 text-sm italic">No hot leads found requiring proposals.</td>
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
        onOpenChange={(open: boolean) => setUploadModal({ ...uploadModal, isOpen: open })}
        leadId={uploadModal.leadId}
        onSuccess={() => fetchData(currentPage)}
      />
    </div>
  );
};

export default ProposalPage;
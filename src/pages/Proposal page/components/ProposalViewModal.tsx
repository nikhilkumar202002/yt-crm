import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Download, User, Calendar, MessageSquare, IndianRupee, Image as ImageIcon, Video as VideoIcon, CheckCircle2, MapPin, Hash, Target, History } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { getProposalDetail } from '../../../api/services/microService';

interface ProposalViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number | null;
}

export const ProposalViewModal = ({ isOpen, onOpenChange, proposalId }: ProposalViewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!proposalId || !isOpen) return;
      try {
        setLoading(true);
        const res = await getProposalDetail(proposalId);
        setProposal(res?.data);
      } catch (error) {
        console.error("Failed to fetch proposal details", error);
        setProposal(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [proposalId, isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white rounded-none p-0 shadow-2xl z-[120] font-sans border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
          
          <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 text-white rounded-none flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText size={16} />
              </div>
              <div>
                <Dialog.Title className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  Proposal Extended Intelligence
                </Dialog.Title>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Global ID: {proposal?.lead?.lead_id || 'N/A'}</p>
              </div>
            </div>
            <Dialog.Close className="p-2 hover:bg-slate-200 rounded-none transition-colors">
               <X size={18} />
            </Dialog.Close>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                 <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compiling Dataset...</p>
              </div>
            ) : proposal ? (
              <div className="space-y-6">
                {/* Section 1: Lead & Source Intelligence */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-blue-600 pl-2">
                       Lead Profile
                    </label>
                    <div className="bg-slate-50 p-4 border border-slate-200 space-y-3">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white border border-slate-200 flex items-center justify-center rounded-none text-slate-400">
                             <User size={14}/>
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{proposal.lead?.lead_data?.full_name || 'N/A'}</p>
                             <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1 uppercase">
                                <MapPin size={10} className="text-slate-300"/> {proposal.lead?.lead_data?.city || 'Location Unknown'}
                             </p>
                          </div>
                       </div>
                       <div className="pt-2 border-t border-slate-200 space-y-1.5 font-bold">
                          <p className="text-[9px] text-slate-500 uppercase flex items-center justify-between">
                             <span>Email:</span>
                             <span className="text-slate-800 truncate ml-2">{proposal.lead?.lead_data?.email || 'N/A'}</span>
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase flex items-center justify-between">
                             <span>Phone:</span>
                             <span className="text-slate-800 ml-2">{proposal.lead?.lead_data?.phone || 'N/A'}</span>
                          </p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-indigo-600 pl-2">
                       Acquisition Source
                    </label>
                    <div className="bg-slate-50 p-4 border border-slate-200 space-y-2">
                       <div className="flex items-start gap-2">
                          <Target size={12} className="text-indigo-500 mt-0.5"/>
                          <div>
                             <p className="text-[9px] text-slate-400 font-black uppercase leading-none">Campaign</p>
                             <p className="text-[10px] font-bold text-slate-700 mt-1 leading-tight">{proposal.lead?.campaign_name || 'Manual Import'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-2 pt-1">
                          <Hash size={12} className="text-slate-400 mt-0.5"/>
                          <div>
                             <p className="text-[9px] text-slate-400 font-black uppercase leading-none">Ad Name</p>
                             <p className="text-[10px] font-bold text-slate-700 mt-1 leading-tight italic">"{proposal.lead?.ad_name || 'N/A'}"</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Scoping & Financials */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-emerald-600 pl-2">
                       Deliverables & Commercials
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                       <div className="bg-white border border-slate-200 p-3 text-center">
                          <ImageIcon size={14} className="mx-auto text-blue-500 mb-1"/>
                          <p className="text-[14px] font-black text-slate-900 leading-none">{proposal.proposal?.creatives_nos || 0}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-1.5">Creatives</p>
                       </div>
                       <div className="bg-white border border-slate-200 p-3 text-center">
                          <VideoIcon size={14} className="mx-auto text-indigo-500 mb-1"/>
                          <p className="text-[14px] font-black text-slate-900 leading-none">{proposal.proposal?.videos_nos || 0}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase mt-1.5">Videos</p>
                       </div>
                       <div className="bg-slate-900 p-3 text-center">
                          <IndianRupee size={12} className="mx-auto text-emerald-400 mb-1"/>
                          <p className="text-[14px] font-black text-emerald-400 leading-none">₹{Number(proposal.proposal?.amount || 0).toLocaleString()}</p>
                          <p className="text-[8px] font-black text-slate-500 uppercase mt-1.5">Base Price</p>
                       </div>
                       <div className="bg-emerald-600 p-3 text-center shadow-lg shadow-emerald-50">
                          <CheckCircle2 size={12} className="mx-auto text-white mb-1"/>
                          <p className="text-[14px] font-black text-white leading-none">₹{((proposal.proposal?.amount || 0) + ((proposal.proposal?.amount || 0) * ((proposal.proposal?.gst_percentage || 18) / 100))).toLocaleString()}</p>
                          <p className="text-[8px] font-black text-emerald-100 uppercase mt-1.5">Gross (+{proposal.proposal?.gst_percentage || 18}%)</p>
                       </div>
                    </div>
                </div>

                {/* Section 3: Strategic Description */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-l-2 border-orange-600 pl-2">
                       Project Strategy & Methodology
                    </label>
                    <div className="bg-amber-50/30 p-4 border border-amber-100 shadow-sm min-h-[80px]">
                       <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                          {proposal.proposal?.description || "No strategic overview provided."}
                       </p>
                    </div>
                </div>

                {/* Section 4: History & Context */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <History size={10}/> Data Provenance
                        </label>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-[9px] border-b border-slate-100 pb-1.5 font-bold">
                              <span className="text-slate-400 uppercase">Document Owner:</span>
                              <span className="text-slate-900">{proposal.proposal?.created_by?.name || 'System'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[9px] border-b border-slate-100 pb-1.5 font-bold">
                              <span className="text-slate-400 uppercase">Assigned Executive:</span>
                              <span className="text-slate-900">{proposal.proposal?.lead_assign?.user?.name || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400 uppercase">System Status:</span>
                              <span className="text-blue-600 uppercase tracking-tighter">{proposal.proposal?.lead_assign?.user_status || 'Cold'}</span>
                           </div>
                        </div>
                    </div>
                    
                    {proposal.proposal?.update_history && proposal.proposal.update_history.length > 0 && (
                      <div className="space-y-3">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={10}/> Modification Logs
                         </label>
                         <div className="bg-slate-50 p-3 max-h-[100px] overflow-y-auto border border-slate-200">
                            {proposal.proposal?.update_history.map((log: any, idx: number) => (
                               <div key={idx} className="mb-2 last:mb-0 border-l-2 border-slate-300 pl-2">
                                  <p className="text-[8px] font-black text-slate-500 uppercase leading-none">{new Date(log.updated_at).toLocaleString()}</p>
                                  <p className="text-[9px] text-slate-600 font-bold mt-1 leading-tight">Fields: {Object.keys(log.changes || {}).join(', ')}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      {proposal.proposal?.is_accepted ? (
                        <div className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-100">
                           Document Approved
                        </div>
                      ) : (
                        <div className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200">
                           Draft Review
                        </div>
                      )}
                   </div>
                   
                   {proposal.proposal?.file_url && (
                     <a 
                       href={proposal.proposal?.file_url} 
                       target="_blank" 
                       rel="noreferrer"
                       className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                     >
                        <Download size={14}/> Secure Terminal Download
                     </a>
                   )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center">
                 <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">No proposal data available.</p>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
